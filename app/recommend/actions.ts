"use client";

// TODO:
// localStorage stuff:
// -- Decide how we want to structure the number of games to fetch - include the number we've already got in localStorage, or not?

// Try to convince user not to close the page
// Backend stuff:
// -- Save generated recs
// -- Save ongoing stats instead of localStorage?
// UI to:
// -- Advise user what they have in localStorage
// -- Buttons to delete it etc
// --Date picker, time control picker etc

import { streamLichessGames } from "../utils/rawOpeningStats/lichess/streamLichessGames";
import { StatsLocalStorageUtils } from "../utils/rawOpeningStats/localStorage/statsLocalStorage";
import {
	fetchLichessUserProfile,
	estimateNumGamesToStream,
	selectPlayerRating,
	AllowedTimeControl,
	LichessGameAPIResponse,
} from "../utils/types/lichess";
import { MemoryMonitor } from "../utils/memoryUsage/MemoryMonitor";
import {
	Color,
	OpeningStatsUtils,
	GameResult,
	PlayerData,
} from "../utils/types/stats";
import { loadOpeningNamesForColor } from "../utils/rawOpeningStats/modelArtifacts/modelArtifactUtils";
import {
	GameValidationFilters,
	isValidLichessGame,
	createValidationStats,
	logValidationStats,
} from "../utils/rawOpeningStats/isValidLichessGame/mainGameValidationFn";
import { MAX_RATING_DELTA_BETWEEN_PLAYERS } from "../utils/rawOpeningStats/isValidLichessGame/isValidRating";
import wakeUpHuggingFaceSpace from "../utils/rawOpeningStats/huggingFace/wakeUpHuggingFaceSpace";

// Configuration Constants
// Much lower number for testing so I don't get IPbanned by Lichess
// The most active player on lichess has about 400,000 games, so 200k for one color
export const MAX_GAMES_TO_FETCH =
	process.env.NODE_ENV === "development" ? 500 : 200_000;

/**
 * Heuristic weights for different time controls
 * Classical games are higher quality data points than blitz
 * So, slower time controls add more games to the total.
 */
const TIME_CONTROL_WEIGHTS: Record<LichessGameAPIResponse["speed"], number> = {
	blitz: 1,
	rapid: 2,
	classical: 3,
};

/**
 * TOGGLE: Set to true to debug memory leaks.
 *
 * We want to ensure memory usage grows O(k) with number of unique openings,
 * NOT O(n) with number of games processed.
 *
 * In prod, this should be false or process.env.NODE_ENV === 'development'
 *
 * TODO Can probably delete this later once we've solidified processes, or just set it permanently to false
 */
const SHOULD_TRACK_MEMORY_USAGE = process.env.NODE_ENV === "development";

export async function processLichessUsername(
	formData: FormData,
	onStatusUpdate?: (message: string) => void,
	onProgressUpdate?: (progress: {
		numGamesProcessed: number;
		totalGamesNeeded: number;
	}) => void
) {
	const username = formData.get("username");
	const sinceDateString = formData.get("sinceDate");
	const colorString = formData.get("color");
	const timeControlsString = formData.get("timeControls");

	if (!username || typeof username !== "string") {
		throw new Error("Username is required");
	}

	// Validate and extract color
	const playerColor: Color =
		colorString === "black" || colorString === "white" ? colorString : "white";

	// Parse and validate time controls
	let allowedTimeControls: AllowedTimeControl[] = [
		"blitz",
		"rapid",
		"classical",
	];
	if (timeControlsString && typeof timeControlsString === "string") {
		try {
			const parsed = JSON.parse(timeControlsString);
			if (Array.isArray(parsed) && parsed.length > 0) {
				allowedTimeControls = parsed.filter((tc): tc is AllowedTimeControl =>
					["blitz", "rapid", "classical"].includes(tc)
				);
			}
		} catch (error) {
			console.error("Error parsing time controls:", error);
			// Fall back to default
		}
	}

	// Ensure at least one time control is selected
	if (allowedTimeControls.length === 0) {
		throw new Error("At least one time control must be selected");
	}

	// Parse sinceDate if provided
	let sinceUnixMS: number | undefined;
	if (sinceDateString && typeof sinceDateString === "string") {
		const sinceDate = new Date(sinceDateString);
		sinceUnixMS = sinceDate.getTime();
	}

	console.log(`Starting processing for: ${username}`);

	try {
		// Wake up HF space early (non-blocking) because it sleeps after inactivity
		// Don't need to await this
		wakeUpHuggingFaceSpace().then((result) => {
			if (result.success) {
				console.log("[HF Space] Wake-up successful");
			} else {
				console.warn(
					"[HF Space] Wake-up failed, but continuing:",
					result.message
				);
			}
		});

		// 1. Prepare: Load Model Artifacts & User Profile (+ derived rating)
		const [trainingOpenings, userInfo] = await Promise.all([
			loadOpeningNamesForColor(playerColor),
			fetchUserRatingAndProfile(username),
		]);

		if (!userInfo.isValid) {
			return { success: false, message: userInfo.error };
		}

		const estimatedTotalGamesNeeded = estimateNumGamesToStream({
			userProfile: userInfo.userProfile,
			allowedTimeControls,
			sinceUnixMS,
		});

		// Send an early update so the progress bar has the right denominator ASAP.
		if (onProgressUpdate) {
			onProgressUpdate({
				numGamesProcessed: 0,
				totalGamesNeeded: estimatedTotalGamesNeeded,
			});
		}

		// 2. Initialize Stats Containers (Resume if possible)
		let playerData: PlayerData;
		let oldestGameTimestampUnixMS: number | undefined; // Tracks the timestamp of the oldest game we've processed (for pagination)
		let numGamesProcessedSoFar = 0;

		const cachedCheck =
			StatsLocalStorageUtils.checkExistingStatsByUsername(username);

		if (cachedCheck.exists) {
			console.log(`Resuming with cached data for ${username}`);
			playerData = cachedCheck.data.playerData;
			oldestGameTimestampUnixMS = cachedCheck.data.sinceUnixMS;
			numGamesProcessedSoFar = cachedCheck.data.fetchProgress;
		} else {
			playerData = OpeningStatsUtils.createEmptyPlayerData(
				username,
				userInfo.rating,
				playerColor
			);
		}

		const validationStats = createValidationStats();
		const filters: GameValidationFilters = {
			validOpenings: trainingOpenings,
			maxRatingDeltaBetweenPlayers: MAX_RATING_DELTA_BETWEEN_PLAYERS,
		};

		// Initialize Memory Monitor
		// We sample every x games to avoid console spam
		const memoryMonitor = new MemoryMonitor(SHOULD_TRACK_MEMORY_USAGE, 250);

		// 3. Stream, Validate, and Accumulate
		// Determine how many more games we need
		// We still cap by MAX_GAMES_TO_FETCH for now (keeps cost/time bounded),
		// but the progress bar denominator should reflect the user's estimated total.
		const numGamesNeeded = Math.max(
			0,
			MAX_GAMES_TO_FETCH - numGamesProcessedSoFar
		);

		if (numGamesNeeded === 0) {
			console.log("Max games reached in cache. Returning cached data.");
			return {
				success: true,
				message: `Using cached data (${numGamesProcessedSoFar} games).`,
				gameData: playerData,
			};
		}

		/** Count of valid games in THIS session */
		let validGameCount = 0;
		/**Count of valid games including any retrieved from localStorage */
		let totalGamesProcessed = 0;

		const stream = streamLichessGames({
			username,
			color: playerColor,
			numGames: numGamesNeeded,
			allowedTimeControls: allowedTimeControls,
			sinceUnixMS: sinceUnixMS,
			onWait: onStatusUpdate, // informs the user in the UI when there's a delay in the API call
		});

		for await (const game of stream) {
			totalGamesProcessed++;
			validationStats.totalGamesProcessed++;

			// Update the oldest timestamp seen. Since stream is newest->oldest, this naturally tracks the end of our window.
			if (game.createdAt) {
				const oldestToNumber = Number(game.createdAt);
				oldestGameTimestampUnixMS = oldestToNumber;
			}

			// Check memory usage (sampled inside the class)
			// We want to verify that heap size stays relatively flat (O(k) with k being the number of unique openings)
			// as totalProcessed (O(n)) increases.
			memoryMonitor.check(
				totalGamesProcessed,
				Object.keys(playerData.openingStats).length // number of unique openings
			);

			if (!isValidLichessGame(game, filters)) {
				// Basic tracking of why game wasn't accepted
				if (!game.opening || !trainingOpenings.has(game.opening.name)) {
					validationStats.filteredByOpening++;
				}
				continue;
			}

			// Game is valid: Accumulate stats
			const result = getGameResult(game, playerColor);

			/**
			 * Determine weight based on speed
			 * Slow games are higher quality data and so add more to the total
			 */
			const weight = TIME_CONTROL_WEIGHTS[game.speed] || 1;

			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				game.opening!.name, // Safe because isValidLichessGame checks this
				game.opening!.eco,
				result,
				weight
			);

			validGameCount++;
			validationStats.validGames++;
			if (totalGamesProcessed % 50 === 0) {
				console.log(`Processed ${totalGamesProcessed} games`);
			}

			// Report progress to UI
			if (onProgressUpdate) {
				onProgressUpdate({
					numGamesProcessed: numGamesProcessedSoFar + validGameCount,
					totalGamesNeeded: estimatedTotalGamesNeeded,
				});
			}
		}

		// 4. Finalize
		logValidationStats(validationStats);

		const totalValidGames = numGamesProcessedSoFar + validGameCount;

		if (totalValidGames === 0) {
			return {
				success: false,
				message: `No valid games found for ${username} (checked ${totalGamesProcessed}).`,
			};
		}

		// Save to local storage
		// We must provide sinceUnixMS (the timestamp of the oldest game in our dataset)
		if (oldestGameTimestampUnixMS) {
			StatsLocalStorageUtils.saveStats(playerData, {
				fetchProgress: totalValidGames,
				isComplete: true,
				sinceUnixMS: oldestGameTimestampUnixMS,
			});
		} else {
			console.warn(
				"Skipping localStorage save: No oldestGameTimestamp available (likely no games processed)."
			);
		}

		return {
			success: true,
			message: `Successfully processed games.`,
			gameData: playerData,
		};
	} catch (error) {
		console.error("Error processing username:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "An unknown error occurred",
		};
	}
}

// ============================================================================
// Helpers
// ============================================================================

async function fetchUserRatingAndProfile(username: string): Promise<
	| {
			isValid: true;
			rating: number;
			error: "";
			userProfile: Awaited<ReturnType<typeof fetchLichessUserProfile>>;
	  }
	| {
			isValid: false;
			rating: 0;
			error: string;
			userProfile: Awaited<ReturnType<typeof fetchLichessUserProfile>>;
	  }
> {
	const userProfile = await fetchLichessUserProfile(username);
	const ratingSelection = selectPlayerRating(userProfile.perfs);

	if (!ratingSelection.isValid) {
		let error = `Unable to determine rating for ${username}`;
		if (ratingSelection.reason === "no_ratings") {
			error = `User ${username} has no rated games in standard time controls.`;
		} else if (ratingSelection.reason === "all_unreliable") {
			error = `User ${username} has unreliable ratings (RD too high). Play more games.`;
		}
		return { isValid: false, error, rating: 0, userProfile };
	}

	console.log(
		`Selected ${ratingSelection.timeControl} rating: ${ratingSelection.rating}`
	);
	return {
		isValid: true,
		rating: ratingSelection.rating,
		error: "",
		userProfile,
	};
}

function getGameResult(
	game: LichessGameAPIResponse,
	myColor: Color
): GameResult {
	if (!game.winner) return "draw";
	return game.winner === myColor ? "win" : "loss";
}
