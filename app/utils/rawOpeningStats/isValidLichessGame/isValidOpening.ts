/**
 * Validates whether a Lichess game has an opening from our training set.
 *
 * During model training, we used a specific set of ~2,500 openings per color.
 * Games with openings outside this set are filtered out since we can't make
 * predictions for openings the model has never seen.
 */

import { LichessGame } from "../../types/lichess";

/**
 * Checks if a Lichess game's opening is in the valid training set.
 *
 * Filters out games where:
 * - The opening field is undefined (rare games without recognized openings)
 * - The opening name is not in our training set
 *
 * @param game - The Lichess game to validate
 * @param validOpenings - Set of opening names from model artifacts (O(1) lookup)
 * @returns true if the game's opening is valid, false otherwise
 *
 * @example
 * const validOpenings = await loadOpeningNamesForColor('white');
 * const game = { opening: { name: 'Sicilian Defense', eco: 'B20' }, ... };
 *
 * if (isValidOpening(game, validOpenings)) {
 *   // Process this game's stats
 * }
 */
export function isValidOpening(
	game: LichessGame,
	validOpenings: Set<string>
): boolean {
	// Filter out games without opening data
	if (!game.opening) {
		return false;
	}

	// Filter out games with openings not in our training set
	const isValid = validOpenings.has(game.opening.name);

	if (!isValid) {
		console.debug(
			`Filtered out game ${game.id}: opening "${game.opening.name}" not in training set`
		);
	}

	return isValid;
}
