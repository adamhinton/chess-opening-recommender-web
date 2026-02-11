import {
	isValidRatingDeltaBetweenPlayers,
	MAX_RATING_DELTA_BETWEEN_PLAYERS,
} from "@/app/utils/rawOpeningStats/isValidLichessGame/isValidRating";
import "@testing-library/jest-dom";

describe("isValidRatingDeltaBetweenPlayers", () => {
	it("returns true when ratings are valid numbers and within the allowed delta", () => {
		expect(
			isValidRatingDeltaBetweenPlayers(
				1500,
				1550,
				MAX_RATING_DELTA_BETWEEN_PLAYERS,
			),
		).toBe(true);
	});

	describe("invalid ratings", () => {
		// string, null, undefined, NaN

		it("returns false when whiteRating is not a number", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					"1500" as unknown as number,
					1550,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when blackRating is not a number", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					"1550" as unknown as number,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when whiteRating is null", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					null as unknown as number,
					1550,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when blackRating is null", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					null as unknown as number,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when whiteRating is undefined", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					undefined as unknown as number,
					1550,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when blackRating is undefined", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					undefined as unknown as number,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when whiteRating is NaN", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					NaN,
					1550,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when blackRating is NaN", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					NaN,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});
	});

	it("returns false when rating difference exceeds the allowed delta", () => {
		expect(
			isValidRatingDeltaBetweenPlayers(
				1500,
				1700,
				MAX_RATING_DELTA_BETWEEN_PLAYERS,
			),
		).toBe(false);

		expect(
			isValidRatingDeltaBetweenPlayers(
				1500,
				1500 + MAX_RATING_DELTA_BETWEEN_PLAYERS + 1,
				MAX_RATING_DELTA_BETWEEN_PLAYERS,
			),
		).toBe(false);

		expect(
			isValidRatingDeltaBetweenPlayers(
				2200,
				2200 + 1_000,
				MAX_RATING_DELTA_BETWEEN_PLAYERS,
			),
		).toBe(false);
	});

	describe("returns true at various rating differences within the allowed delta - ", () => {
		it("returns true when ratings are equal", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					1500,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(true);
		});

		it("returns true when rating difference is exactly the allowed delta", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					1500 + MAX_RATING_DELTA_BETWEEN_PLAYERS,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(true);
		});

		it("returns true when rating difference is just under the allowed delta", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					1500 + MAX_RATING_DELTA_BETWEEN_PLAYERS - 1,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(true);
		});
	});
});
