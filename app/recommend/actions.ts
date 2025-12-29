"use client";

import { streamLichessGames } from "../utils/rawOpeningStats/lichess/streamLichessGames";
import { StatsLocalStorageUtils } from "../utils/rawOpeningStats/localStorage/statsLocalStorage";
import {
	fetchLichessUserProfile,
	selectPlayerRating,
} from "../utils/types/lichess";
import { Color, OpeningStatsUtils } from "../utils/types/stats";

export async function processLichessUsername(formData: FormData) {
	const username = formData.get("username");
	const COLOR: Color = "white";

	console.log("Processing username:", username);

	if (!username || typeof username !== "string") {
		throw new Error("Username is required");
	}

	try {
		// Step 1: Check if we already have this lichess username's data in localStorage
		const existingStats = StatsLocalStorageUtils.getExistingStats(username);

		if (existingStats) {
			// We have cached data - check if it's fresh and complete
			const check =
				StatsLocalStorageUtils.checkExistingStatsByUsername(username);

			if (check.exists && !check.isStale && check.data.isComplete) {
				// Data is fresh and complete - just return it
				return {
					success: true,
					message: `Using cached data for ${username}`,
					gameData: existingStats,
				};
			}

			// Otherwise fall through to fetch more games
			console.log("Existing data is stale or incomplete, fetching fresh data");
		}

		// Step 2: Fetch lichess user profile to get their rating
		const userProfile = await fetchLichessUserProfile(username);
		const ratingSelection = selectPlayerRating(userProfile.perfs);

		if (!ratingSelection.isValid) {
			if (ratingSelection.reason === "no_ratings") {
				return {
					success: false,
					message: `User ${username} has no ratings in blitz, rapid, or classical time controls. Please play some rated games first.`,
				};
			} else if (ratingSelection.reason === "all_unreliable") {
				return {
					success: false,
					message: `User ${username} has insufficient data (rating deviation >= 110 for all time controls). Please play more rated games to establish a reliable rating.`,
				};
			}

			// Should never reach here due to exhaustive check, but TypeScript needs it
			return {
				success: false,
				message: `Unable to determine rating for ${username}`,
			};
		}

		const { rating, timeControl, ratingDeviation } = ratingSelection;
		console.log(
			`Selected ${timeControl} rating: ${rating} (RD: ${ratingDeviation})`
		);

		// Step 3: Create or use existing player data structure
		const playerData =
			existingStats ||
			OpeningStatsUtils.createEmptyPlayerData(username, rating, COLOR);

		let gameCount = 0;

		// Stream games one at a time
		for await (const game of streamLichessGames({
			username,
			color: COLOR,
			numGames: 100,
		})) {
			gameCount++;
			console.log(`Processing game ${gameCount}:`, game.id);
			// TODO: Process game and accumulate opening stats
			// OpeningStatsUtils.accumulateOpeningStats(playerData, ...)
		}

		// Save to localStorage
		const saveResult = StatsLocalStorageUtils.saveStats(playerData, {
			fetchProgress: gameCount,
			isComplete: true,
		});

		if (!saveResult.success) {
			console.error("Failed to save to localStorage:", saveResult.error);
		}

		if (gameCount === 0) {
			return {
				success: false,
				message: `No rated games found for ${username} in blitz, rapid, or classical time controls.`,
			};
		}

		return {
			success: true,
			message: `Successfully processed ${gameCount} games for ${username}`,
			gameData: playerData,
		};
	} catch (error) {
		console.error("Error processing username:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "An error occurred",
		};
	}
}
