import { LichessPlayerFromAPI } from "../../types/lichess";

/**
 * Validates that the rating difference between players is within acceptable limits.
 *
 * @param whiteRating - The rating of the white player
 * @param blackRating - The rating of the black player
 * @param maxRatingDeltaBetweenPlayers - Maximum allowed rating difference
 * @returns true if rating difference is <= maxRatingDeltaBetweenPlayers
 */
export function isValidRatingDeltaBetweenPlayers(
	whiteRating: LichessPlayerFromAPI["rating"],
	blackRating: LichessPlayerFromAPI["rating"],
	maxRatingDeltaBetweenPlayers: number
): boolean {
	if (typeof whiteRating !== "number" || typeof blackRating !== "number") {
		return false;
	}

	return Math.abs(whiteRating - blackRating) <= maxRatingDeltaBetweenPlayers;
}
