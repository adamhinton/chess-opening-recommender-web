// Here we'll define the structure of our accumulator
// The win rates etc per opening
// Will be contained within a broader player object that also has very basic info such as rating and username

import z from "zod";

// We'll also define the types for the parsed opening stats that the server sends to the model after normalizing ratings, bayesian shrinkage of scores, etc

// Note that I alraedy have this defined in another repo as a python class; should be fairly simple to convert to TS

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ResultTypeSchema = z.enum(["win", "draw", "loss"]);
type GameResult = z.infer<typeof ResultTypeSchema>;

const ColorSchema = z.enum(["white", "black"]);
type Color = z.infer<typeof ColorSchema>;

/**
 * See docstring for RawOpeningStats type.
 */
export const RawOpeningStatsSchema = z.object({
	openingName: z.string(),
	eco: z.string(),
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
	openingStats: z.map(z.string(), RawOpeningStatsSchema), // key is opening name
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
// Because the program that processes and mutates them on our HuggingFace space is written in python.

/**
 * See docstring for HFInterfacePayload type.
 */
export const HFInterfacePayloadSchema = z.object({
	lichess_username: z.string(),
	rating: z.number().nonnegative(),
	color: ColorSchema,
	opening_stats: z.array(
		z.object({
			opening_name: z.string(),
			eco: z.string(),
			num_games: z.number().nonnegative(),
			num_wins: z.number().nonnegative(),
			num_draws: z.number().nonnegative(),
			num_losses: z.number().nonnegative(),
		})
	),
});

/**
 * Payload sent to HuggingFace space
 * We will convert PlayerData (camelCase) to this (snake_case) because the program taking it in is written in python.
 */
export type HFInterfacePayload = z.infer<typeof HFInterfacePayloadSchema>;

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
			lichess_username: playerData.lichessUsername,
			rating: playerData.rating,
			color: playerData.color,
			opening_stats: Array.from(playerData.openingStats.values()).map(
				(stat) => ({
					opening_name: stat.openingName,
					eco: stat.eco,
					num_games: stat.numGames,
					num_wins: stat.numWins,
					num_draws: stat.numDraws,
					num_losses: stat.numLosses,
				})
			),
		};
	}

	/**
	 * Create empty PlayerData structure.
	 */
	static createEmptyPlayerData(
		lichessUsername: string,
		rating: number,
		color: Color
	): PlayerData {
		return {
			lichessUsername,
			rating,
			color,
			openingStats: new Map(),
		};
	}

	/**
	 * Add or update opening stats (accumulator pattern).
	 * If opening exists, adds to counts. If new openings, creates new entry.
	 */
	static accumulateOpeningStats(
		playerData: PlayerData,
		openingName: string,
		eco: string,
		result: GameResult
	): void {
		const existing = playerData.openingStats.get(openingName);

		if (existing) {
			// Update existing stats
			existing.numGames++;
			switch (result) {
				case "win":
					existing.numWins++;
				case "draw":
					existing.numDraws++;
				case "loss":
					existing.numLosses++;
			}
		} else {
			// Add new stats entry for this opening
			playerData.openingStats.set(openingName, {
				openingName,
				eco,
				numGames: 1,
				numWins: result === "win" ? 1 : 0,
				numDraws: result === "draw" ? 1 : 0,
				numLosses: result === "loss" ? 1 : 0,
			});
		}
	}
}
