// Here we define the structure of our opening stats accumulator
// The win rates etc per opening
// Will be contained within a broader player object that also has very basic info such as rating and username

import z from "zod";
import { AllowedTimeControl } from "./lichessTypes";

/**
 * Earliest date of games we'll fetch.
 *
 * Lichess games before March 2018 lack needed data about number of moves; for simplicity we'll just start from 2019. Data that old won't be very relevant anyway.
 *
 * This is January 1, 2019 00:00:00 UTC in Unix milliseconds.
 */
export const LICHESS_MIN_DATE_UNIX_MS = 1546320593000;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ResultTypeSchema = z.enum(["win", "draw", "loss"]);
export type GameResult = z.infer<typeof ResultTypeSchema>;

export const ColorSchema = z.enum(["white", "black"]);
export type Color = z.infer<typeof ColorSchema>;

/**
 * See docstring for RawOpeningStats type.
 */
export const RawOpeningStatsSchema = z.object({
	openingName: z.string(),
	eco: z.string(),
	trainingID: z.number(),
	numGames: z.number().nonnegative(),
	numWins: z.number().nonnegative(),
	numDraws: z.number().nonnegative(),
	numLosses: z.number().nonnegative(),
});

/**
 * Statistics for a single opening accumulated from Lichess games.
 *
 * This is what we build up as we stream games from Lichess API.
 */
export type RawOpeningStats = z.infer<typeof RawOpeningStatsSchema>;

/**
 * See docstring for PlayerData type.
 */
export const PlayerDataSchema = z.object({
	lichessUsername: z.string(),
	rating: z.number().nonnegative(),
	color: ColorSchema,
	openingStats: z.record(z.string(), RawOpeningStatsSchema), // key is opening name
	allowedTimeControls: z.array(z.enum(["blitz", "rapid", "classical"])),
});

/**
 * Complete player profile before sending to model.
 *
 * Contains all opening stats accumulated from streaming Lichess games.
 * We will change this to snake case then send it to HuggingFace space for processing and inference.
 */
export type PlayerData = z.infer<typeof PlayerDataSchema>;

// ============================================================================
// Payload types (TS - Python boundary)
// ============================================================================

// We will convert player stats key names from camelCase to snake_case
// Because the program that processes and mutates them on our HuggingFace space is written in python

/**
 * See docstring for HFInterfacePayload type.
 */
export const HFInterfacePayloadSchema = z.object({
	/**Lichess username */
	name: z.string(),
	rating: z.number().nonnegative(),
	side: ColorSchema,
	opening_stats: z.array(
		z.object({
			opening_name: z.string(),
			// Sequential id we used in training
			opening_id: z.number(),
			eco: z.string(),
			num_games: z.number().nonnegative(),
			num_wins: z.number().nonnegative(),
			num_draws: z.number().nonnegative(),
			num_losses: z.number().nonnegative(),
		}),
	),
});

/**
 * Payload sent to HuggingFace space
 * We will convert PlayerData (camelCase) to this (snake_case) because the program taking it in is written in python.
 */
export type HFInterfacePayload = z.infer<typeof HFInterfacePayloadSchema>;

// ============================================================================
// HuggingFace Response Types (Inference Results)
// ============================================================================

/**
 * Schema for a single opening recommendation from the model
 */
export const SingleOpeningRecommendationSchema = z.object({
	opening_name: z.string(),
	eco: z.string(),
	predicted_score: z.number().min(0).max(1),
});

/**A single opening recommendation from the model */
export type SingleOpeningRecommendation = z.infer<
	typeof SingleOpeningRecommendationSchema
>;

/**
 * Schema for statistics about the recommendations
 */
export const RecommendationStatsSchema = z.object({
	num_openings_total: z.number().nonnegative(),
	num_openings_played: z.number().nonnegative(),
	num_openings_unplayed: z.number().nonnegative(),
	predicted_min: z.number(),
	predicted_max: z.number(),
	predicted_mean: z.number(),
});

/**
 * Statistics about the recommendations
 */
export type RecommendationStats = z.infer<typeof RecommendationStatsSchema>;

export const InferencePredictResponseSchema = z.object({
	request_id: z.string(),
	side: ColorSchema,
	recommendations: z.array(SingleOpeningRecommendationSchema),
	stats: RecommendationStatsSchema,
	model_loaded: z.boolean(),
	model_version: z.string(),
});

/**
 * Schema for the complete recommendation response from HuggingFace API
 */
export type InferencePredictResponse = z.infer<
	typeof InferencePredictResponseSchema
>;

/**
 * Validate HuggingFace prediction response
 */
export function isValidInferencePredictResponse(
	data: unknown,
): data is InferencePredictResponse {
	return InferencePredictResponseSchema.safeParse(data).success;
}

// ============================================================================
// End HuggingFace Response Types

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================
/**
 * Run this after raw data processing to ensure no mistakes
 */
export function isValidPlayerData(data: unknown): data is PlayerData {
	return PlayerDataSchema.safeParse(data).success;
}

/**
 * Utility functions for working with opening statistics.
 *
 * Keeps data (types) separate from behavior (methods).
 * All methods are static - no state needed.
 */
export class OpeningStatsUtils {
	/**
	 * Calculate raw performance score for an opening.
	 * Uses simple formula: (wins + 0.5 * draws) / total games.
	 */
	static calculateRawScore(stats: RawOpeningStats): number {
		if (stats.numGames === 0) return 0;
		return (stats.numWins + 0.5 * stats.numDraws) / stats.numGames;
	}

	/**
	 * Get total num games across all openings.
	 */
	static getTotalGames(stats: RawOpeningStats[]): number {
		let total = 0;
		for (const stat of stats) {
			total += stat.numGames;
		}
		return total;
	}

	/**
	 * Convert PlayerData to HFInterfacePayload
	 * All this does is change camelCase keys to snake_case
	 * This is because our HF space is written in python
	 */
	static convertToHFPayload(playerData: PlayerData): HFInterfacePayload {
		return {
			name: playerData.lichessUsername,
			rating: playerData.rating,
			side: playerData.color === "white" ? "white" : "black",
			opening_stats: Object.values(playerData.openingStats).map((stat) => ({
				opening_name: stat.openingName,
				opening_id: stat.trainingID,
				eco: stat.eco,
				num_games: stat.numGames,
				num_wins: stat.numWins,
				num_draws: stat.numDraws,
				num_losses: stat.numLosses,
			})),
		};
	}

	/**
	 * Create empty PlayerData structure.
	 */
	static createEmptyPlayerData(
		lichessUsername: string,
		rating: number,
		color: Color,
		allowedTimeControls: AllowedTimeControl[],
	): PlayerData {
		return {
			lichessUsername,
			rating,
			color,
			allowedTimeControls,
			openingStats: {},
		};
	}

	/**
	 * Add or update opening stats (accumulator pattern).
	 * If opening exists, adds to counts. If new opening, creates new entry.
	 */
	static accumulateOpeningStats(
		playerData: PlayerData,
		openingName: string,
		trainingID: number,
		eco: string,
		result: GameResult,
		/**
		 * Adds 1 game for blitz, two for Rapid, 3 for Classical.
		 * Because slower games take longer and give higher quality data.
		 * These weights can be changed.
		 */
		weight = 1,
	): void {
		const existing = playerData.openingStats[openingName];

		if (existing) {
			// Update existing stats
			existing.numGames += weight; // more for slower games

			// Increments numWins in player's opening stats if it's a win, numDraws for draw, etc
			const resultKeyMap: Record<
				GameResult,
				"numWins" | "numDraws" | "numLosses"
			> = {
				win: "numWins",
				draw: "numDraws",
				loss: "numLosses",
			};
			existing[resultKeyMap[result]] += weight;
		} else {
			// Add new stats entry for this opening
			playerData.openingStats[openingName] = {
				openingName,
				trainingID,
				eco,
				numGames: weight, // more for slower games
				numWins: result === "win" ? weight : 0,
				numDraws: result === "draw" ? weight : 0,
				numLosses: result === "loss" ? weight : 0,
			};
		}
	}
}
