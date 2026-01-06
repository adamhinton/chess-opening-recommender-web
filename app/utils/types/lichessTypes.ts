/**
 * Types and utilities for Lichess API responses
 */

import { z } from "zod";

// ============================================================================
// Lichess User Profile API Types
// ============================================================================

export type AllowedTimeControl = "blitz" | "rapid" | "classical";

/**
 * Semantic way to tell people never to use game.opening.ply because it's a misleading name and will cause errors
 *
 * This is how many moves the OPENING has, not how many moves the game has.
 */
type Dont_Use_This_It_Isnt_What_You_Think = never;

/**
 * A single game from Lichess API (NDJSON format).
 *
 * There are more fields in the response; this only includes fields and values we care about for opening stats.
 */
export interface LichessGameAPIResponse {
	id: string;
	createdAt: number; // unix MS time
	lastMoveAt: number; // unix MS time
	clocks: number[]; // each entry here denotes one ply; use that to determine how many moves the game had - clocks.length // 2 is the number of game moves
	rated: boolean;
	speed: AllowedTimeControl;
	players: {
		white: LichessPlayerFromAPI;
		black: LichessPlayerFromAPI;
	};
	opening?: {
		eco: string;
		name: string;
		ply: Dont_Use_This_It_Isnt_What_You_Think;
	};
	winner?: "white" | "black"; // if this doesn't exist you know it's a draw
	status: string; // There are many possibilities but we want mate, resign, stalemate, timeout, outoftime, draw
	variant: "standard" | string; // we only want standard games
}

/**
 * The player data that comes with a game from a lichess API call
 *
 * It has other fields too but these are the ones we need
 */
export type LichessPlayerFromAPI = {
	user: {
		name: string;
	};
	rating: number;
};

/**
 * Rating info for a single time control (raw Lichess API format)
 */
export const LichessRatingInfoSchema = z.object({
	games: z.number().nonnegative(),
	rating: z.number().nonnegative(),
	rd: z.number().nonnegative(),
	prog: z.number().optional(),
	prov: z.boolean().optional(),
});

export type LichessRatingInfo = z.infer<typeof LichessRatingInfoSchema>;

/**
 * Performance stats from Lichess user profile
 *
 * Only includes the time controls we care about
 */
export const LichessPerformanceSchema = z.object({
	blitz: LichessRatingInfoSchema.optional(),
	rapid: LichessRatingInfoSchema.optional(),
	classical: LichessRatingInfoSchema.optional(),
});

export type LichessPerformance = z.infer<typeof LichessPerformanceSchema>;

/**
 * Lichess user profile response (minimal fields we need)
 */
export const LichessUserProfileSchema = z.object({
	id: z.string(),
	username: z.string(),
	perfs: LichessPerformanceSchema,
	createdAt: z.number(), // Unix MS
});

export type LichessUserProfile = z.infer<typeof LichessUserProfileSchema>;

/**
 * Estimates how many games we’ll stream for progress tracking.

 * This is intentionally approximate.

 * Returns at least 1 to keep progress math safe.
 */
export function estimateNumGamesToStream(params: {
	userProfile: LichessUserProfile;
	allowedTimeControls: AllowedTimeControl[];
	sinceUnixMS?: number;
}): number {
	const { userProfile, allowedTimeControls, sinceUnixMS } = params;

	const totalGamesAllColors = allowedTimeControls.reduce((sum, tc) => {
		return sum + (userProfile.perfs[tc]?.games ?? 0);
	}, 0);

	// Divide by 2 because we're only streaming games where the user is the chosen color.
	let estimatedOneColorGames = Math.floor(totalGamesAllColors / 2);

	if (sinceUnixMS !== undefined) {
		const now = Date.now();
		const accountAgeMS = now - userProfile.createdAt;
		const sinceWindowMS = now - sinceUnixMS;

		// Guard against weird clocks / future `since` / invalid profile values
		if (accountAgeMS > 0 && sinceWindowMS > 0) {
			const proportion = Math.min(1, sinceWindowMS / accountAgeMS);
			estimatedOneColorGames = Math.floor(estimatedOneColorGames * proportion);
		}
	}

	return Math.max(1, estimatedOneColorGames);
}
