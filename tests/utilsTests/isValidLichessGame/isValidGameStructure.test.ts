import { isValidGameStructure } from "@/app/utils/rawOpeningStats/isValidLichessGame/isValidGameStructure";
import { LichessGameAPIResponse } from "@/app/utils/types/lichessTypes";
import "@testing-library/jest-dom";

// Making these readonly to ensure no accidental mutations in tests, which could lead to false positives/negatives
const validGameVariant: LichessGameAPIResponse["variant"] = "standard";
const validGameClocks: LichessGameAPIResponse["clocks"] = [
	300, 300, 290, 290, 280, 280, 270, 270, 260, 260, 250, 250, 240, 240, 230,
	230, 220, 220, 210, 210, 200, 200,
];
const validGameStatus: LichessGameAPIResponse["status"] = "mate";

it("should return true for a valid lichess game structure", () => {
	const isValidGame = isValidGameStructure(
		validGameVariant,
		validGameClocks,
		validGameStatus,
	);
	expect(isValidGame).toBe(true);
});

describe("variants", () => {
	it("should return false for any variant name except 'standard'", () => {
		const isValidGame960 = isValidGameStructure(
			"chess960",
			validGameClocks,
			validGameStatus,
		);

		const isValidGameCrazyhouse = isValidGameStructure(
			"crazyhouse",
			validGameClocks,
			validGameStatus,
		);

		const isValidGameNonsenseVariant = isValidGameStructure(
			"nonsenseVariant",
			validGameClocks,
			validGameStatus,
		);
		expect(isValidGame960).toBe(false);
		expect(isValidGameCrazyhouse).toBe(false);
		expect(isValidGameNonsenseVariant).toBe(false);
	});

	// Happy path already covered in "should return true for a valid lichess game structure" -- only one variant ("stndard") is valid
});

describe("clocks", () => {
	it("should return false for games with too few plies", () => {
		const isValidGameFewPly = isValidGameStructure(
			validGameVariant,
			[300, 300], // Only 2 plies (1 move)
			validGameStatus,
		);
		expect(isValidGameFewPly).toBe(false);
	});

	it("should return false for empty clocks array", () => {
		const isValidGameEmptyClocks = isValidGameStructure(
			validGameVariant,
			[], // No moves
			validGameStatus,
		);
		expect(isValidGameEmptyClocks).toBe(false);
	});
});

describe("ending statuses", () => {
	it("should return false for games with invalid ending statuses", () => {
		const isValidGameCheatDetected = isValidGameStructure(
			validGameVariant,
			validGameClocks,
			"cheat detected",
		);

		const isValidGameAborted = isValidGameStructure(
			validGameVariant,
			validGameClocks,
			"aborted",
		);

		const isValidGameServerError = isValidGameStructure(
			validGameVariant,
			validGameClocks,
			"server error",
		);

		const isValidGameNonsenseStatus = isValidGameStructure(
			validGameVariant,
			validGameClocks,
			"nonsenseStatus",
		);

		expect(isValidGameCheatDetected).toBe(false);
		expect(isValidGameAborted).toBe(false);
		expect(isValidGameServerError).toBe(false);
		expect(isValidGameNonsenseStatus).toBe(false);
	});

	it("should accept all valid ending statuses", () => {
		const validStatuses: LichessGameAPIResponse["status"][] = [
			"mate",
			"resign",
			"stalemate",
			"timeout",
			"outoftime",
			"draw",
		];

		validStatuses.forEach((status) => {
			const isValid = isValidGameStructure(
				validGameVariant,
				validGameClocks,
				status,
			);
			expect(isValid).toBe(true);
		});
	});
});
