/**
 * Types and utilities for Lichess API responses
 */

import { z } from "zod";

// ============================================================================
// Lichess User Profile API Types
// ============================================================================

/**
 * Represents a single game from Lichess API (NDJSON format).
 * There are more fields in the response; this only includes fields and values we care about for opening stats.
 */
export interface LichessGameAPIResponse {
	id: string;
	clock: {
		createdAt: number; // unix MS time
		lasteMoveAt: number; // unix MS time
	};
	clocks: number[]; // each entry here denotes one ply; use that to determine how many moves the game had - clocks.length // 2 is the number of game moves
	rated: boolean;
	speed: "blitz" | "rapid" | "classical";
	players: {
		white: LichessPlayerFromAPI;
		black: LichessPlayerFromAPI;
	};
	opening?: {
		eco: string;
		name: string;
		ply: never; // THIS IS MISLEADING. This is how many moves the OPENING has, not how many moves the game has. DO NOT USE THIS TO COUNT HOW MANY MOVES THE GAME HAS. I made it never to raise an error if we ever try to use it. This would filter out a lot of games.
	};
	winner?: "white" | "black"; // if this doesn't exist you know it's a draw
	status: string; // we want mate, resign, stalemate, timeout, outoftime, draw
	variant: "standard" | string;
}

/**
 * The player data that comes with a game from a lichess API call
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
});

export type LichessUserProfile = z.infer<typeof LichessUserProfileSchema>;

// ============================================================================
// Rating Selection Logic
// ============================================================================

/**
 * Thresholds for rating selection algorithm
 */
const RATING_SELECTION_CONFIG = {
	/**
	 * Max RD considered "reliable"
	 * Below this threshold, rating is trustworthy
	 */
	RELIABLE_RD_THRESHOLD: 110,
	/**
	 * RD difference threshold for preferring rapid over blitz
	 * If rapid RD is this much better than blitz, use rapid
	 */
	RD_THRESHOLD_DIFFERENCE: 20,
} as const;

/**
 * Internal helper for rating with reliability check
 */
interface RatingWithRD {
	rating: number;
	ratingDeviation: number;
	numGames: number;
}

/**
 * Extract rating info from perfs object
 */
function extractRatingInfo(
	perfs: LichessPerformance,
	timeControl: "blitz" | "rapid" | "classical"
): RatingWithRD | null {
	const perf = perfs[timeControl];
	if (!perf) return null;

	// Mapping some of these keys to better variable names
	return {
		rating: perf.rating,
		ratingDeviation: perf.rd,
		numGames: perf.games,
	};
}

/**
 * Check if a rating is reliable based on RD threshold
 */
function isReliableRating(ratingInfo: RatingWithRD): boolean {
	return (
		ratingInfo.ratingDeviation < RATING_SELECTION_CONFIG.RELIABLE_RD_THRESHOLD
	);
}

/**
 * Result of rating selection
 */
export type RatingSelectionResult =
	| RatingSelectionSuccess
	| RatingSelectionFailure;

type RatingSelectionSuccess = {
	isValid: true;
	rating: number;
	timeControl: "blitz" | "rapid" | "classical";
	ratingDeviation: number;
};

type RatingSelectionFailure = {
	isValid: false;
	reason: "no_ratings" | "all_unreliable";
};

/**
 * Select the most appropriate time control rating for a player.
 *
 * Rating selection logic:
 * 1. If blitz RD < 110, use blitz rating (preferred)
 * 2. If blitz RD >= 110 and rapid RD is 20+ points better, use rapid
 * 3. If both blitz and rapid RD >= 110, but classical RD < 110, use classical
 * 4. Otherwise, use blitz rating (fallback)
 * 5. If no ratings exist at all, return failure
 *
 * @param perfs - The 'perfs' object from Lichess user profile
 * @returns Tagged union indicating success with rating details or failure with reason
 */
export function selectPlayerRating(
	perfs: LichessPerformance
): RatingSelectionResult {
	// Extract rating info for each time control
	const blitz = extractRatingInfo(perfs, "blitz");
	const rapid = extractRatingInfo(perfs, "rapid");
	const classical = extractRatingInfo(perfs, "classical");

	// Rule 5: No ratings exist at all
	if (!blitz && !rapid && !classical) {
		return {
			isValid: false,
			reason: "no_ratings",
		};
	}

	// Rule 1: Prefer blitz if it's reliable
	if (blitz && isReliableRating(blitz)) {
		return {
			isValid: true,
			rating: blitz.rating,
			timeControl: "blitz",
			ratingDeviation: blitz.ratingDeviation,
		};
	}

	// Rule 2: Use rapid if it's significantly more reliable than blitz
	if (blitz && rapid) {
		if (
			rapid.ratingDeviation <
			blitz.ratingDeviation - RATING_SELECTION_CONFIG.RD_THRESHOLD_DIFFERENCE
		) {
			return {
				isValid: true,
				rating: rapid.rating,
				timeControl: "rapid",
				ratingDeviation: rapid.ratingDeviation,
			};
		}
	}

	// Rule 3: Use classical if both blitz and rapid are unreliable, but classical is reliable
	if (classical && isReliableRating(classical)) {
		const blitzUnreliable = !blitz || !isReliableRating(blitz);
		const rapidUnreliable = !rapid || !isReliableRating(rapid);

		if (blitzUnreliable && rapidUnreliable) {
			return {
				isValid: true,
				rating: classical.rating,
				timeControl: "classical",
				ratingDeviation: classical.ratingDeviation,
			};
		}
	}

	// Rule 4: Fallback to blitz if it exists (even if unreliable)
	if (blitz) {
		return {
			isValid: true,
			rating: blitz.rating,
			timeControl: "blitz",
			ratingDeviation: blitz.ratingDeviation,
		};
	}

	// Final fallback: rapid, then classical
	if (rapid) {
		return {
			isValid: true,
			rating: rapid.rating,
			timeControl: "rapid",
			ratingDeviation: rapid.ratingDeviation,
		};
	}

	if (classical) {
		return {
			isValid: true,
			rating: classical.rating,
			timeControl: "classical",
			ratingDeviation: classical.ratingDeviation,
		};
	}

	// All ratings have unreliable RD values
	return {
		isValid: false,
		reason: "all_unreliable",
	};
}

/**
 * Fetch and validate Lichess user profile
 */
export async function fetchLichessUserProfile(
	username: string
): Promise<LichessUserProfile> {
	const response = await fetch(`https://lichess.org/api/user/${username}`);

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error(
				`User "${username}" not found on Lichess. Please check the username and try again.`
			);
		} else if (response.status === 429) {
			throw new Error("Too many requests. Please wait a moment and try again.");
		} else if (response.status >= 500) {
			throw new Error("Lichess server error. Please try again later.");
		}
		throw new Error(
			`Failed to fetch user profile: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();
	const parseResult = LichessUserProfileSchema.safeParse(data);

	if (!parseResult.success) {
		throw new Error(
			`Invalid Lichess API response: ${parseResult.error.message}`
		);
	}

	return parseResult.data;
}
