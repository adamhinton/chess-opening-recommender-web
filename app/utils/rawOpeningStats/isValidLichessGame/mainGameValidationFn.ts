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
import { isValidRatingDeltaBetweenPlayers } from "./isValidRating";
import { isValidGameStructure } from "./isValidGameStructure";

/**
 * Configuration for all game validation filters.
 *
 * Pass this object to isValidLichessGame() to apply all filters.
 * As we add more filters, extend this interface with additional config.
 */
export interface GameValidationFilters {
	/** Set of valid opening names from model artifacts */
	validOpenings: Set<string>;
	/** Maximum allowed rating difference between players */
	maxRatingDeltaBetweenPlayers: number;
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
 * const filters: GameValidationFilters = { validOpenings, maxRatingDeltaBetweenPlayers: 100 };
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
	// Short-circuit evaluation:
	// 1. Rating check (cheapest)
	// 2. Structure check (variant, moves, status)
	// 3. Opening check (set lookup)
	return (
		isValidRatingDeltaBetweenPlayers(
			game.players.white.rating,
			game.players.black.rating,
			filters.maxRatingDeltaBetweenPlayers
		) &&
		isValidGameStructure(game.variant, game.clocks, game.status) &&
		game.opening?.name !== undefined && // can't use game if it doesn't have an opening
		isValidOpening(game.opening?.name, filters.validOpenings)
	);
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
	filteredByRating: number;
	filteredByStructure: number;
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
		filteredByRating: 0,
		filteredByStructure: 0,
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
		stats.totalGamesProcessed > 0
			? ((stats.totalGamesProcessed - stats.validGames) /
					stats.totalGamesProcessed) *
			  100
			: 0;

	console.log("=== Game Validation Statistics ===");
	console.log(`Total games processed: ${stats.totalGamesProcessed}`);
	console.log(`Valid games: ${stats.validGames}`);
	console.log(`Filter rate: ${filterRate.toFixed(1)}%`);
	console.log(`Filtered by opening: ${stats.filteredByOpening}`);
	console.log(`Filtered by rating delta: ${stats.filteredByRating}`);
	console.log(
		`Filtered by structure (moves/status/variant): ${stats.filteredByStructure}`
	);
	console.log("=================================");
}
