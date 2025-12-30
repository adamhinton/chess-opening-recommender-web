/**
 * Utilities for loading and managing model artifacts from training.
 *
 * During model training, we saved artifacts including the list of openings used.
 * When compiling raw opening stats, we filter out games with openings not in our training set.
 *
 * This file handles:
 * 1. Loading opening name → training ID mappings (JSON files)
 * 2. Extracting just the opening names into a Set for O(1) lookup
 * 3. Providing that Set for game filtering
 */

import { Color } from "../../types/stats";

/**
 * Type for the JSON structure: { "Opening Name": training_id, ... }
 */
type OpeningNameToTrainingId = Record<string, number>;

/**
 * Loads the valid opening names for a specific color from model artifacts.
 *
 * The JSON files map opening names to training IDs, but we only need the names
 * for filtering. Returns a Set for O(1) lookup performance.
 *
 * @param color - The color to load openings for ('white' or 'black')
 * @returns Promise resolving to a Set of valid opening names
 * @throws Error if the JSON file fails to load or parse
 *
 * @example
 * const validOpenings = await loadOpeningNamesForColor('white');
 * const isValid = validOpenings.has('Sicilian Defense'); // O(1) lookup
 */
export async function loadOpeningNamesForColor(
	color: Color
): Promise<Set<string>> {
	try {
		const jsonModule = await import(
			`./${color}ModelArtifacts/opening_name_to_training_id_${color}.json`
		);

		// The default export is the JSON object
		const openingMap: OpeningNameToTrainingId = jsonModule.default;

		// Extract just the opening names (keys) into a Set
		// The opening IDs in the artifact aren't used here
		const openingNames = new Set(Object.keys(openingMap));

		console.log(
			`Loaded ${openingNames.size} valid opening names for ${color} player`
		);

		return openingNames;
	} catch (error) {
		// Fail loudly - if we can't load openings, we shouldn't proceed
		throw new Error(
			`Failed to load opening names for ${color}: ${
				error instanceof Error ? error.message : String(error)
			}`
		);
	}
}
