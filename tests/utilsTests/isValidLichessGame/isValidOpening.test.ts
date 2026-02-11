import "@testing-library/jest-dom";

import { isValidOpening } from "@/app/utils/rawOpeningStats/isValidLichessGame/isValidOpening";
import { OpeningNamesToTrainingIDs } from "@/app/utils/rawOpeningStats/modelArtifacts/modelArtifactUtils";

const dummyOpeningNamesToTrainingIDs: OpeningNamesToTrainingIDs = new Map([
	["Sicilian Defense", 1],
	["French Defense", 2],
	["Ruy Lopez", 3],
]);

describe("isValidOpening", () => {
	it("returns true for opening name that is in training dataset", () => {
		expect(
			isValidOpening("Sicilian Defense", dummyOpeningNamesToTrainingIDs),
		).toBe(true);
	});

	it("returns false for an opening name that is real but not in training dataset", () => {
		expect(
			isValidOpening("King's Gambit", dummyOpeningNamesToTrainingIDs),
		).toBe(false);
	});

	it("returns false for nonsense opening name", () => {
		expect(
			isValidOpening("HorbleGorble Gambit 123", dummyOpeningNamesToTrainingIDs),
		).toBe(false);
	});

	it("returns false for undefined/null opening name", () => {
		// @ts-expect-error - testing invalid input
		expect(isValidOpening(undefined, dummyOpeningNamesToTrainingIDs)).toBe(
			false,
		);

		// @ts-expect-error - testing invalid input
		expect(isValidOpening(null, dummyOpeningNamesToTrainingIDs)).toBe(false);
	});
});
