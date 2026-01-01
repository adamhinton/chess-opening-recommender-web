"use client";

// TODO:
// localStorage stuff:
// -- Figure out how often to save ongoing stats to localStorage
// -- Figure out why UI freezes when I try to accumulate while I already have stats in localStorage
// -- The UI just says "Using cached data for MrScribbles" and the console says "Starting processing for: MrScribbles". I see the data in localStorage. But it does nothing from there.

// Wake up HF space
// -- Because it sleeps after inactivity, so we'll wake it up early to give time to get the sand out of its eyes

// Progress bar
// -- We won't be sure how many games we're downloading
// -- So maybe, instead just detail how many games downloaded
// -- maybe Option for user to stop downloading and begin inference, or save progress for later

// Try to convince user not to close the page
// Backend stuff:
// -- Save generated recs
// -- Save ongoing stats instead of localStorage?
// UI to:
// -- Advise user what they have in localStorage
// -- Buttons to delete it etc
// --Date picker, time control picker etc

// Enhancements to processing:
// Finished all of these so far

import { streamLichessGames } from "../utils/rawOpeningStats/lichess/streamLichessGames";
import { StatsLocalStorageUtils } from "../utils/rawOpeningStats/localStorage/statsLocalStorage";
import {
	fetchLichessUserProfile,
	selectPlayerRating,
	LichessGameAPIResponse,
} from "../utils/types/lichess";
import { MemoryMonitor } from "../utils/memoryUsage/MemoryMonitor";
import { Color, OpeningStatsUtils, GameResult } from "../utils/types/stats";
import { loadOpeningNamesForColor } from "../utils/rawOpeningStats/modelArtifacts/modelArtifactUtils";
import {
	GameValidationFilters,
	isValidLichessGame,
	createValidationStats,
	logValidationStats,
} from "../utils/rawOpeningStats/isValidLichessGame/mainGameValidationFn";
import { MAX_RATING_DELTA_BETWEEN_PLAYERS } from "../utils/rawOpeningStats/isValidLichessGame/isValidRating";

// Configuration Constants
const MAX_GAMES_TO_FETCH = 500;
const PLAYER_COLOR: Color = "white";

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
	onStatusUpdate?: (message: string) => void
) {
	const username = formData.get("username");

	if (!username || typeof username !== "string") {
		throw new Error("Username is required");
	}

	console.log(`Starting processing for: ${username}`);

	try {
		// 1. Check Cache (Fast Return)
		const cached = getCachedStats(username);
		if (cached) return cached;

		// 2. Prepare: Load Model Artifacts & User Rating
		const [trainingOpenings, ratingInfo] = await Promise.all([
			loadOpeningNamesForColor(PLAYER_COLOR),
			fetchAndValidateRating(username),
		]);

		if (!ratingInfo.isValid) {
			return { success: false, message: ratingInfo.error };
		}

		// 3. Initialize Stats Containers
		const playerData = OpeningStatsUtils.createEmptyPlayerData(
			username,
			ratingInfo.rating,
			PLAYER_COLOR
		);
		const validationStats = createValidationStats();
		const filters: GameValidationFilters = {
			validOpenings: trainingOpenings,
			maxRatingDeltaBetweenPlayers: MAX_RATING_DELTA_BETWEEN_PLAYERS,
		};

		// Initialize Memory Monitor
		// We sample every 1000 games to avoid console spam
		const memoryMonitor = new MemoryMonitor(SHOULD_TRACK_MEMORY_USAGE, 250);

		// 4. Stream, Validate, and Accumulate
		let validGameCount = 0;
		let totalProcessed = 0;

		const stream = streamLichessGames({
			username,
			color: PLAYER_COLOR,
			numGames: MAX_GAMES_TO_FETCH,
			onWait: onStatusUpdate, // informs the user in the UI when there's a delay in the API call
		});

		for await (const game of stream) {
			totalProcessed++;
			validationStats.totalGamesProcessed++;

			// Check memory usage (sampled inside the class)
			// We want to verify that heap size stays relatively flat (O(k) with k being the number of opening stats (200-600))
			// as totalProcessed (O(n)) increases, with n being the number of processed games (10_000+).
			memoryMonitor.check(
				totalProcessed,
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
			const result = getGameResult(game, PLAYER_COLOR);

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
			console.log(
				`Processed ${validGameCount}: ${game.opening?.name} (${result})`
			);
		}

		// 5. Finalize
		logValidationStats(validationStats);

		if (validGameCount === 0) {
			return {
				success: false,
				message: `No valid games found for ${username} (checked ${totalProcessed}).`,
			};
		}

		// Save to local storage
		StatsLocalStorageUtils.saveStats(playerData, {
			fetchProgress: validGameCount,
			isComplete: true,
		});

		return {
			success: true,
			message: `Successfully processed ${validGameCount} games.`,
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

function getCachedStats(username: string) {
	const existingStats = StatsLocalStorageUtils.getExistingStats(username);
	if (existingStats) {
		const check = StatsLocalStorageUtils.checkExistingStatsByUsername(username);
		if (check.exists && !check.isStale && check.data.isComplete) {
			return {
				success: true,
				message: `Using cached data for ${username}`,
				gameData: existingStats,
			};
		}
		console.log("Cache miss: Data is stale or incomplete.");
	}
	return null;
}

async function fetchAndValidateRating(username: string) {
	const userProfile = await fetchLichessUserProfile(username);
	const ratingSelection = selectPlayerRating(userProfile.perfs);

	if (!ratingSelection.isValid) {
		let error = `Unable to determine rating for ${username}`;
		if (ratingSelection.reason === "no_ratings") {
			error = `User ${username} has no rated games in standard time controls.`;
		} else if (ratingSelection.reason === "all_unreliable") {
			error = `User ${username} has unreliable ratings (RD too high). Play more games.`;
		}
		return { isValid: false, error, rating: 0 };
	}

	console.log(
		`Selected ${ratingSelection.timeControl} rating: ${ratingSelection.rating}`
	);
	return { isValid: true, rating: ratingSelection.rating, error: "" };
}

function getGameResult(
	game: LichessGameAPIResponse,
	myColor: Color
): GameResult {
	if (!game.winner) return "draw";
	return game.winner === myColor ? "win" : "loss";
}
