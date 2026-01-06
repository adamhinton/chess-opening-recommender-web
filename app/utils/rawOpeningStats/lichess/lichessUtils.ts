import {
	AllowedTimeControl,
	LichessGameAPIResponse,
	LichessPerformance,
	LichessUserProfile,
	LichessUserProfileSchema,
} from "../../types/lichessTypes";
import { Color, GameResult } from "../../types/stats";

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

/**Gets user profile with fetchLichessUserProfile, then decides which rating we want to use (blitz rapid or classical) */
export async function fetchUserRatingAndProfile(username: string): Promise<
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

export function getGameResult(
	game: LichessGameAPIResponse,
	myColor: Color
): GameResult {
	if (!game.winner) return "draw";
	return game.winner === myColor ? "win" : "loss";
}

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
 * Result of rating selection
 */
export type RatingSelectionResult =
	| RatingSelectionSuccess
	| RatingSelectionFailure;

type RatingSelectionSuccess = {
	isValid: true;
	rating: number;
	timeControl: AllowedTimeControl;
	ratingDeviation: number;
};

type RatingSelectionFailure = {
	isValid: false;
	reason: "no_ratings" | "all_unreliable";
};

/**
 * Extract rating info from perfs object
 */
export function extractRatingInfo(
	perfs: LichessPerformance,
	timeControl: AllowedTimeControl
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
