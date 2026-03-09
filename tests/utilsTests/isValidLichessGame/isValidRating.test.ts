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
				1570,
				MAX_RATING_DELTA_BETWEEN_PLAYERS,
			),
		).toBe(true);
	});

	describe("invalid ratings", () => {
		it("returns false when whiteRating is not a number", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					// @ts-expect-error - testing invalid input
					"1500",
					1550,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when blackRating is not a number", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					// @ts-expect-error - testing invalid input
					"1550",
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when whiteRating is null", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					// @ts-expect-error - testing invalid input
					null,
					1550,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when blackRating is null", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					// @ts-expect-error - testing invalid input
					null,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when whiteRating is undefined", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					// @ts-expect-error - testing invalid input
					undefined,
					1550,
					MAX_RATING_DELTA_BETWEEN_PLAYERS,
				),
			).toBe(false);
		});

		it("returns false when blackRating is undefined", () => {
			expect(
				isValidRatingDeltaBetweenPlayers(
					1500,
					// @ts-expect-error - testing invalid input
					undefined,
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
