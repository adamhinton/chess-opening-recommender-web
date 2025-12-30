"use client";

import { streamLichessGames } from "../utils/rawOpeningStats/lichess/streamLichessGames";
import { StatsLocalStorageUtils } from "../utils/rawOpeningStats/localStorage/statsLocalStorage";
import {
	fetchLichessUserProfile,
	selectPlayerRating,
} from "../utils/types/lichess";
import { Color, OpeningStatsUtils } from "../utils/types/stats";
import { loadOpeningNamesForColor } from "../utils/rawOpeningStats/modelArtifacts/modelArtifactUtils";
import {
	GameValidationFilters,
	isValidLichessGame,
	createValidationStats,
	logValidationStats,
} from "../utils/rawOpeningStats/isValidLichessGame/mainGameValidationFn";

export async function processLichessUsername(formData: FormData) {
	const username = formData.get("username");
	const COLOR: Color = "white";

	console.log("Processing username:", username);

	if (!username || typeof username !== "string") {
		throw new Error("Username is required");
	}

	// TODO:
	// Filter out invalid games
	// -- rating delta >100, other stuff I can't remember
	// Wake up HF space
	// Log memory usage
	// Log games per
	// Exponential backoff
	// Threading or something
	// -- Download games while processing previous batch

	try {
		// Step 1: Load valid opening names for filtering (based on COLOR)
		console.log(`Loading valid opening names for ${COLOR} player...`);
		/**
		 * The list of opening names we used when training the model.
		 * We will ignore any games that aren't in one of these openings. The model wouldn't recognize them.
		 */
		const trainingOpenings = await loadOpeningNamesForColor(COLOR);

		// Create game validation filters
		const filters: GameValidationFilters = {
			validOpenings: trainingOpenings,
		};

		// Create stats tracker for monitoring filter effectiveness
		const validationStats = createValidationStats();

		// Step 2: Check if we already have this lichess username's data in localStorage
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
		let validGameCount = 0;

		// Stream games one at a time
		for await (const game of streamLichessGames({
			username,
			color: COLOR,
			numGames: 1000,
		})) {
			gameCount++;
			validationStats.totalGamesProcessed++;

			// Validate game against all filters
			// TODO important maybe delete some of this later
			if (!isValidLichessGame(game, filters)) {
				// Track why the game was filtered
				if (!game.opening || !trainingOpenings.has(game.opening.name)) {
					validationStats.filteredByOpening++;
				}
				continue;
			}

			// Now we know it's a valid game and passed all filters to be included in our stats
			validGameCount++;
			validationStats.validGames++;

			console.log(
				`Processing valid game ${validGameCount}/${gameCount}:`,
				game.id,
				game.opening?.name
			);
			// TODO: Process game and accumulate opening stats
		}

		// Log validation statistics
		logValidationStats(validationStats);

		// Save to localStorage
		const saveResult = StatsLocalStorageUtils.saveStats(playerData, {
			fetchProgress: validGameCount,
			isComplete: true,
		});

		if (!saveResult.success) {
			console.error("Failed to save to localStorage:", saveResult.error);
		}

		if (validGameCount === 0) {
			return {
				success: false,
				message: `No valid games found for ${username}. Processed ${gameCount} games total, but none passed validation filters.`,
			};
		}

		return {
			success: true,
			message: `Successfully processed ${validGameCount} valid games out of ${gameCount} total games for ${username}`,
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
