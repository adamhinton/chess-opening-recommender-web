"use client";

// TODO:
// localStorage stuff:
// -- Figure out how often to save ongoing stats to localStorage
// -- Figure out why UI freezes when I try to accumulate while I already have stats in localStorage
// Wake up HF space
// Progress bar
// Try to convince user not to close the page
// Backend stuff:
// -- Save generated recs
// -- Save ongoing stats instead of localStorage?
// UI to:
// -- Advise user what they have in localStorage
// -- Buttons to delete it etc
// --Date picker, time control picker etc
// Enhancements to processing:
// -- Weight slower time controls? Like x2 games for rapid, x4 for classical?

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
const MAX_GAMES_TO_FETCH = 5_000;
const PLAYER_COLOR: Color = "white";

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
				Object.keys(playerData.openingStats).length
			);

			if (!isValidLichessGame(game, filters)) {
				// Basic tracking of why it failed
				if (!game.opening || !trainingOpenings.has(game.opening.name)) {
					validationStats.filteredByOpening++;
				}
				continue;
			}

			// Game is valid: Accumulate stats
			const result = getGameResult(game, PLAYER_COLOR);
			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				game.opening!.name, // Safe because isValidLichessGame checks this
				game.opening!.eco,
				result
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
