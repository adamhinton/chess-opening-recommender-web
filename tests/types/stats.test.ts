/**
 * @jest-environment node
 */
// ^^ Doing node env to allow structuredClone

// This is in the `types` folder
// But don't be fooled by my stupid naming - it also has an opening stats utils class
// Need to change that later

import {
	HFInterfacePayloadSchema,
	OpeningStatsUtils,
	PlayerData,
	RawOpeningStats,
} from "@/app/utils/types/stats";

/** will change this as needed for each test */
const baseStats: RawOpeningStats = {
	numGames: 100,
	numWins: 50,
	numDraws: 30,
	numLosses: 20,
	openingName: "Some Opening",
	trainingID: 1,
	eco: "A00",
};

describe("OpeningStatsUtils", () => {
	describe("calculateRawScore", () => {
		it("should return 0 for 0 games", () => {
			const stats: RawOpeningStats = {
				...baseStats,
				numGames: 0,
				numWins: 0,
				numDraws: 0,
				numLosses: 0,
			};
			expect(OpeningStatsUtils.calculateRawScore(stats)).toBe(0);
		});

		it("should calculate correct score for given stats", () => {
			const stats: RawOpeningStats = {
				...baseStats,
				numGames: 100,
				numWins: 50,
				numDraws: 30,
				numLosses: 20,
			};
			// Score = (50 + 0.5 * 30) / 100 = (50 + 15) / 100 = 65 / 100 = 0.65
			expect(OpeningStatsUtils.calculateRawScore(stats)).toBe(0.65);
		});

		// Calculates correctly for high numbers
		it("should calculate correct score for high numbers", () => {
			const stats: RawOpeningStats = {
				...baseStats,
				numGames: 1000,
				numWins: 500,
				numDraws: 300,
				numLosses: 200,
			};
			expect(OpeningStatsUtils.calculateRawScore(stats)).toBe(0.65);
		});

		// Calculates correctly for 0 wins
		it("should calculate correct score for 0 wins", () => {
			const stats: RawOpeningStats = {
				...baseStats,
				numGames: 100,
				numWins: 0,
				numDraws: 30,
				numLosses: 70,
			};
			expect(OpeningStatsUtils.calculateRawScore(stats)).toBe(0.15);
		});

		// Calculates correctly for 0 draws
		it("should calculate correct score for 0 draws", () => {
			const stats: RawOpeningStats = {
				...baseStats,
				numGames: 100,
				numWins: 50,
				numDraws: 0,
				numLosses: 50,
			};
			expect(OpeningStatsUtils.calculateRawScore(stats)).toBe(0.5);
		});

		// Calculates correctly for 0 losses
		it("should calculate correct score for 0 losses", () => {
			const stats: RawOpeningStats = {
				...baseStats,
				numGames: 100,
				numWins: 50,
				numDraws: 30,
				numLosses: 0,
			};
			expect(OpeningStatsUtils.calculateRawScore(stats)).toBe(0.65);
		});

		it("should return 0 for 0 games", () => {
			const stats: RawOpeningStats = {
				...baseStats,
				numGames: 0,
				numWins: 0,
				numDraws: 0,
				numLosses: 0,
			};
			expect(OpeningStatsUtils.calculateRawScore(stats)).toBe(0);
		});
	});

	describe("getTotalGames", () => {
		it("correctly calculates the total number of games across multiple openings", () => {
			const statsArray: RawOpeningStats[] = [
				{ ...baseStats, numGames: 100 },
				{ ...baseStats, numGames: 200 },
				{ ...baseStats, numGames: 300 },
			];
			expect(OpeningStatsUtils.getTotalGames(statsArray)).toBe(600);
		});

		it("should return 0 for empty array", () => {
			expect(OpeningStatsUtils.getTotalGames([])).toBe(0);
		});

		it("should calculate large total games correctly", () => {
			const statsArray: RawOpeningStats[] = [
				{ ...baseStats, numGames: 100 },
				{ ...baseStats, numGames: 200 },
				{ ...baseStats, numGames: 300 },
				{ ...baseStats, numGames: 400 },
			];
			expect(OpeningStatsUtils.getTotalGames(statsArray)).toBe(1000);
		});

		it("should return 0 if all games are 0", () => {
			const statsArray: RawOpeningStats[] = [
				{ ...baseStats, numGames: 0 },
				{ ...baseStats, numGames: 0 },
				{ ...baseStats, numGames: 0 },
			];
			expect(OpeningStatsUtils.getTotalGames(statsArray)).toBe(0);
		});
	});

	describe("convertToHFPayload", () => {
		it("satisfies HFInterfacePayload Zod schema", () => {
			const playerData: PlayerData = {
				lichessUsername: "test_user",
				rating: 1500,
				color: "white",
				allowedTimeControls: ["rapid", "blitz"],
				openingStats: {
					"Some Opening": {
						openingName: "Some Opening",
						trainingID: 1,
						eco: "A00",
						numGames: 100,
						numWins: 50,
						numDraws: 30,
						numLosses: 20,
					},
				},
			};

			const hfPayload = OpeningStatsUtils.convertToHFPayload(playerData);
			expect(() => HFInterfacePayloadSchema.parse(hfPayload)).not.toThrow();
		});
	});
});

// use structuredClone in each test to avoid mutating baseStats
describe("accumulateOpeningStats", () => {
	// base stats for testing
	const basePlayerStats: PlayerData = {
		lichessUsername: "test_user",
		rating: 1500,
		color: "white",
		allowedTimeControls: ["rapid", "blitz"],
		openingStats: {
			"Some Opening": {
				openingName: "Some Opening",
				trainingID: 1,
				eco: "A00",
				numGames: 100,
				numWins: 50,
				numDraws: 30,
				numLosses: 20,
			},
			"Another Opening": {
				openingName: "Another Opening",
				trainingID: 2,
				eco: "B00",
				numGames: 200,
				numWins: 120,
				numDraws: 50,
				numLosses: 30,
			},
			"Third Opening": {
				openingName: "Third Opening",
				trainingID: 3,
				eco: "C00",
				numGames: 300,
				numWins: 200,
				numDraws: 50,
				numLosses: 50,
			},
		},
	};

	describe("Already existing opening entry", () => {
		it("should increment num wins for existing opening if result is win", () => {
			const playerData = structuredClone<PlayerData>(basePlayerStats);
			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				"Some Opening",
				1,
				"A00",
				"win",
			);
			expect(playerData.openingStats["Some Opening"].numGames).toBe(101);
			expect(playerData.openingStats["Some Opening"].numWins).toBe(51);
			expect(playerData.openingStats["Some Opening"].numDraws).toBe(30);
			expect(playerData.openingStats["Some Opening"].numLosses).toBe(20);
		});

		it("should increment num draws for existing opening if result is draw", () => {
			const playerData = structuredClone<PlayerData>(basePlayerStats);
			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				"Some Opening",
				1,
				"A00",
				"draw",
			);
			expect(playerData.openingStats["Some Opening"].numGames).toBe(101);
			expect(playerData.openingStats["Some Opening"].numWins).toBe(50);
			expect(playerData.openingStats["Some Opening"].numDraws).toBe(31);
			expect(playerData.openingStats["Some Opening"].numLosses).toBe(20);
		});

		it("should increment num losses for existing opening if result is loss", () => {
			const playerData = structuredClone<PlayerData>(basePlayerStats);
			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				"Some Opening",
				1,
				"A00",
				"loss",
			);
			expect(playerData.openingStats["Some Opening"].numGames).toBe(101);
			expect(playerData.openingStats["Some Opening"].numWins).toBe(50);
			expect(playerData.openingStats["Some Opening"].numDraws).toBe(30);
			expect(playerData.openingStats["Some Opening"].numLosses).toBe(21);
		});

		it("should weight increment correctly in existing opening entry ", () => {
			const playerData = structuredClone<PlayerData>(basePlayerStats);
			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				"Some Opening",
				1,
				"A00",
				"win",
				3,
			);
			expect(playerData.openingStats["Some Opening"].numGames).toBe(103);
			expect(playerData.openingStats["Some Opening"].numWins).toBe(53);
			expect(playerData.openingStats["Some Opening"].numDraws).toBe(30);
			expect(playerData.openingStats["Some Opening"].numLosses).toBe(20);
		});
	});

	describe("New opening entry", () => {
		it("should create new entry with 1 win for new opening if result is win", () => {
			const playerData = structuredClone<PlayerData>(basePlayerStats);
			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				"New Opening",
				4,
				"D00",
				"win",
			);
			expect(playerData.openingStats["New Opening"]).toEqual({
				openingName: "New Opening",
				trainingID: 4,
				eco: "D00",
				numGames: 1,
				numWins: 1,
				numDraws: 0,
				numLosses: 0,
			});
		});

		it("should create new entry with 1 draw for new opening if result is draw", () => {
			const playerData = structuredClone<PlayerData>(basePlayerStats);
			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				"New Opening",
				4,
				"D00",
				"draw",
			);
			expect(playerData.openingStats["New Opening"]).toEqual({
				openingName: "New Opening",
				trainingID: 4,
				eco: "D00",
				numGames: 1,
				numWins: 0,
				numDraws: 1,
				numLosses: 0,
			});
		});

		it("should create new entry with 1 loss for new opening if result is loss", () => {
			const playerData = structuredClone<PlayerData>(basePlayerStats);
			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				"New Opening",
				4,
				"D00",
				"loss",
			);
			expect(playerData.openingStats["New Opening"]).toEqual({
				openingName: "New Opening",
				trainingID: 4,
				eco: "D00",
				numGames: 1,
				numWins: 0,
				numDraws: 0,
				numLosses: 1,
			});
		});

		it("should weight increment correctly in new opening entry ", () => {
			const playerData = structuredClone<PlayerData>(basePlayerStats);
			OpeningStatsUtils.accumulateOpeningStats(
				playerData,
				"New Opening",
				4,
				"D00",
				"win",
				3,
			);
			expect(playerData.openingStats["New Opening"]).toEqual({
				openingName: "New Opening",
				trainingID: 4,
				eco: "D00",
				numGames: 3,
				numWins: 3,
				numDraws: 0,
				numLosses: 0,
			});
		});
	});
});
