/**
 * Validates whether a Lichess game has an opening from our training set.
 *
 * During model training, we used a specific set of ~2,500 openings per color.
 * Games with openings outside this set are filtered out since we can't make
 * predictions for openings the model has never seen.
 */

import { LichessGameAPIResponse } from "../../types/lichessTypes";
import { type OpeningNamesToTrainingIDs } from "../modelArtifacts/modelArtifactUtils";

type OpeningName = NonNullable<LichessGameAPIResponse["opening"]>["name"];

/**
 * Checks if a Lichess game's opening is in the valid training set.
 *
 * Filters out games where:
 * - The opening name is undefined
 * - The opening name is not in our training set
 *
 * @param openingName - The name of the opening from the game
 * @param openingNamesToTrainingIDs - Map of opening names → training IDs
 * @returns true if the game's opening is in the training dataset, false otherwise
 */
export function isValidOpening(
	openingName: OpeningName, // just a string lol
	openingNamesToTrainingIDs: OpeningNamesToTrainingIDs,
): boolean {
	if (!openingName) {
		return false;
	}

	// Filter out games with openings not in our training set
	return openingNamesToTrainingIDs.has(openingName);
}
