/**
 * Utilities for loading and managing model artifacts from training.
 *
 * During model training, we saved artifacts including the list of openings used.
 * When compiling raw opening stats, we filter out games with openings not in our training set.
 *
 * This file handles:
 * 1. Loading opening name → training ID mappings (JSON files)
 * 2. Providing a Map for O(1) lookup and training ID retrieval
 */

import { Color } from "../../types/stats";

/**
 * Type for the JSON structure: { "Opening Name": training_id, ... }
 */
type OpeningNameToTrainingIdJSON = Record<string, number>;

/**
 * Map from opening name to training ID (as string).
 * Used for both validation that the opening exists in our training data, and training ID lookup.
 */
export type OpeningNamesToTrainingIDs = Map<string, number>;

/**
 * Loads the opening name → training ID mapping for a specific color.
 *
 * Returns a Map for instnat lookup.
 * use .get() to retrieve the training ID when accumulating stats.
 *
 * @param color - The color to load openings for ('white' or 'black')
 * @returns Promise resolving to a Map of opening names → training IDs
 * @throws Error if the JSON file fails to load or parse
 *
 * @example
 * const openingNamesToTrainingIDs = await loadOpeningNamesForColor('white');
 * if (openingNamesToTrainingIDs.has('Sicilian Defense')) {
 *   const trainingID = openingNamesToTrainingIDs.get('Sicilian Defense')!;
 * }
 */
export async function loadOpeningNamesForColor(
	color: Color
): Promise<OpeningNamesToTrainingIDs> {
	try {
		const jsonModule = await import(
			`./${color}ModelArtifacts/opening_name_to_training_id_${color}.json`
		);

		// The default export is the JSON object
		const openingMap: OpeningNameToTrainingIdJSON = jsonModule.default;

		// Convert to Map<string, string> for O(1) lookup and training ID access
		const openingNamesToTrainingIDs: OpeningNamesToTrainingIDs = new Map(
			Object.entries(openingMap).map(([name, id]) => [name, id])
		);

		console.log(
			`Loaded ${openingNamesToTrainingIDs.size} valid opening names for ${color} player`
		);

		return openingNamesToTrainingIDs;
	} catch (error) {
		// Fail loudly - if we can't load openings, we shouldn't proceed
		throw new Error(
			`Failed to load opening names for ${color}: ${
				error instanceof Error ? error.message : String(error)
			}`
		);
	}
}
