/**
 * Main game validation orchestrator.
 *
 * Coordinates all validation filters for Lichess games. As we stream games from
 * Lichess API, each game passes through these filters. Only games that pass all
 * filters are included in our opening statistics.
 *
 * Current filters:
 * - Opening validation (opening must be in training set)
 *
 * Future filters (TODO):
 * - Rating delta validation (opponent rating within threshold)
 * - Time control validation (appropriate speed for analysis)
 * - Game completion validation (no aborted/timeout games)
 */

import { LichessGameAPIResponse } from "../../types/lichess";
import { isValidOpening } from "./isValidOpening";

/**
 * Configuration for all game validation filters.
 *
 * Pass this object to isValidLichessGame() to apply all filters.
 * As we add more filters, extend this interface with additional config.
 */
export interface GameValidationFilters {
	/** Set of valid opening names from model artifacts */
	validOpenings: Set<string>;

	// Future filter configs:
	// maxRatingDelta?: number;
	// allowedSpeeds?: string[];
	// allowedStatuses?: string[];
}

/**
 * Validates a Lichess game against all configured filters.
 *
 * This is the single entry point for game validation. As we stream games from
 * Lichess API, call this function for each game to determine if it should be
 * included in our opening statistics.
 *
 * @param game - The Lichess game to validate
 * @param filters - Configuration for all validation filters
 * @returns true if the game passes all filters, false otherwise
 *
 * @example
 * const validOpenings = await loadOpeningNamesForColor('white');
 * const filters: GameValidationFilters = { validOpenings };
 *
 * for (const game of lichessGames) {
 *   if (isValidLichessGame(game, filters)) {
 *     // Accumulate stats for this game
 *   }
 * }
 */
export function isValidLichessGame(
	game: LichessGameAPIResponse,
	filters: GameValidationFilters
): boolean {
	// Apply opening validation filter
	if (!isValidOpening(game, filters.validOpenings)) {
		return false;
	}

	// Future filters will be added here:
	// if (!isValidRatingDelta(game, filters.maxRatingDelta)) {
	//   return false;
	// }

	// Game passed all filters
	return true;
}

/**
 * Statistics about filtered games (for debugging/monitoring).
 *
 * Call this after processing a batch of games to see why games were filtered.
 * Useful for understanding data quality and filter effectiveness.
 */
export interface GameValidationStats {
	totalGamesProcessed: number;
	validGames: number;
	filteredByOpening: number;
	// Future stats:
	// filteredByRating: number;
	// filteredBySpeed: number;
}

/**
 * Creates a new stats tracker for monitoring game validation.
 *
 * @returns Empty stats object ready to track validation results
 */
export function createValidationStats(): GameValidationStats {
	return {
		totalGamesProcessed: 0,
		validGames: 0,
		filteredByOpening: 0,
	};
}

/**
 * Logs validation statistics to console.
 *
 * Useful for debugging and monitoring how many games are being filtered out.
 *
 * @param stats - Validation statistics to log
 */
export function logValidationStats(stats: GameValidationStats): void {
	const filterRate =
		((stats.totalGamesProcessed - stats.validGames) /
			stats.totalGamesProcessed) *
		100;

	console.log("=== Game Validation Statistics ===");
	console.log(`Total games processed: ${stats.totalGamesProcessed}`);
	console.log(`Valid games: ${stats.validGames}`);
	console.log(`Filter rate: ${filterRate.toFixed(1)}%`);
	console.log(`Filtered by opening: ${stats.filteredByOpening}`);
	console.log("=================================");
}
