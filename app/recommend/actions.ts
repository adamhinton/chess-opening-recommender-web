"use client";

// TODO:
// Backend stuff:
// -- Save generated recs
// -- Save ongoing stats instead of localStorage?

import { streamLichessGames } from "../utils/rawOpeningStats/lichess/streamLichessGames";
import { StatsLocalStorageUtils } from "../utils/rawOpeningStats/localStorage/statsLocalStorage";
import {
	estimateNumGamesToStream,
	AllowedTimeControl,
	LichessGameAPIResponse,
} from "../utils/types/lichessTypes";
import { MemoryMonitor } from "../utils/memoryUsage/MemoryMonitor";
import {
	Color,
	OpeningStatsUtils,
	PlayerData,
	isValidInferencePredictResponse,
	LICHESS_MIN_DATE_UNIX_MS,
} from "../utils/types/stats";
import { loadOpeningNamesForColor } from "../utils/rawOpeningStats/modelArtifacts/modelArtifactUtils";
import {
	GameValidationFilters,
	isValidLichessGame,
	createValidationStats,
	logValidationStats,
} from "../utils/rawOpeningStats/isValidLichessGame/mainGameValidationFn";
import { MAX_RATING_DELTA_BETWEEN_PLAYERS } from "../utils/rawOpeningStats/isValidLichessGame/isValidRating";
import wakeUpHuggingFaceSpace from "../utils/rawOpeningStats/huggingFace/wakeUpHuggingFaceSpace";
import {
	fetchUserRatingAndProfile,
	getGameResult,
} from "../utils/rawOpeningStats/lichess/lichessUtils";
import sendRawStatsToHF from "../utils/rawOpeningStats/huggingFace/sendRawStatsToHF";
import { RecommendationsLocalStorageUtils } from "../utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";

// Much lower number for testing so I don't get IPbanned by Lichess
// The most active player on lichess has about 400,000 games, so 200k for one color in prod
export const MAX_GAMES_TO_FETCH =
	process.env.NODE_ENV === "development" ? 200_000 : 200_000;

export const SAVE_LOCAL_STORAGE_EVERY_N_GAMES = 100;

// ============================================================================

/**
 * Heuristic weights for different time controls
 * Classical games are higher quality data points than blitz
 */
const TIME_CONTROL_WEIGHTS: Record<LichessGameAPIResponse["speed"], number> = {
	blitz: 1,
	rapid: 2,
	classical: 3,
};

/**
 * Tracks memory usage to make sure it doesn't increase O(n) with number of games processed.
 */
const SHOULD_TRACK_MEMORY_USAGE = process.env.NODE_ENV === "development";

export async function processLichessUsername(
	formData: FormData,
	onStatusUpdate?: (message: string) => void,
	onProgressUpdate?: (progress: {
		numGamesProcessed: number;
		totalGamesNeeded: number;
	}) => void,
) {
	const username = formData.get("username");
	const sinceDateString = formData.get("sinceDate");
	const colorString = formData.get("color");
	const timeControlsString = formData.get("timeControls");

	if (!username || typeof username !== "string") {
		throw new Error("Username is required");
	}

	const playerColor: Color =
		colorString === "black" || colorString === "white" ? colorString : "white";

	// User picks these in form
	let allowedTimeControls: AllowedTimeControl[] = [
		"blitz",
		"rapid",
		"classical",
	];

	// Eliminate time controls user didn't select
	if (timeControlsString && typeof timeControlsString === "string") {
		try {
			const parsed = JSON.parse(timeControlsString);
			if (Array.isArray(parsed) && parsed.length > 0) {
				allowedTimeControls = parsed.filter((tc): tc is AllowedTimeControl =>
					["blitz", "rapid", "classical"].includes(tc),
				);
			}
		} catch (error) {
			console.error("Error parsing time controls:", error);
			// Fall back to default
		}
	}

	// Ensure at least one time control is selected, though UI should prevent thiss
	if (allowedTimeControls.length === 0) {
		throw new Error("At least one time control must be selected");
	}

	// Parse sinceDate if provided
	let sinceUnixMS: number | undefined;
	if (sinceDateString && typeof sinceDateString === "string") {
		const sinceDate = new Date(sinceDateString);
		sinceUnixMS = sinceDate.getTime();
		// Silently enforce minimum date (Jan 1, 2019) - games before this lack needed move number data
		if (sinceUnixMS < LICHESS_MIN_DATE_UNIX_MS) {
			sinceUnixMS = LICHESS_MIN_DATE_UNIX_MS;
		}
	}

	console.log(`Starting processing for: ${username}`);

	try {
		// Wake up HF space early (non-blocking) because it sleeps after inactivity
		// Async but we don't need to wait for it
		wakeUpHuggingFaceSpace();

		// 1. Load Model Artifacts & User Profile
		const [openingNamesToTrainingIDs, userInfo] = await Promise.all([
			loadOpeningNamesForColor(playerColor), // Map: opening name → training ID
			fetchUserRatingAndProfile(username),
		]);

		if (!userInfo.isValid) {
			return { success: false, message: userInfo.error };
		}

		const estimatedTotalGamesNeeded = estimateNumGamesToStream({
			userProfile: userInfo.userProfile,
			allowedTimeControls,
			sinceUnixMS,
		});

		// Send an early update so the progress bar has the right denominator ASAP.
		if (onProgressUpdate) {
			onProgressUpdate({
				numGamesProcessed: 0,
				totalGamesNeeded: estimatedTotalGamesNeeded,
			});
		}

		// 2. Initialize Stats Containers (Handle conflicts & Resume if possible)
		let playerData: PlayerData;
		let oldestGameTimestampUnixMS: number | undefined; // Tracks the timestamp of the oldest game we've processed (for pagination)
		let numGamesProcessedSoFar = 0;

		// =====================================================================
		// CONFLICT RESOLUTION: Check if we have existing data and handle conflicts
		// =====================================================================
		// When user manually enters username (not via resume button), we check:
		// 1. Time control conflict → delete cached data and restart
		// 2. Date conflict → resume or restart based on date comparison
		// See resolveStorageConflict() for full logic documentation.
		const conflictResolution = StatsLocalStorageUtils.resolveStorageConflict({
			username,
			color: playerColor,
			formTimeControls: allowedTimeControls,
			formSinceUnixMS: sinceUnixMS,
		});

		console.log(
			`[Conflict Resolution] ${conflictResolution.action}: ${conflictResolution.reason}`,
		);

		if (conflictResolution.action === "delete-and-restart") {
			// Time controls changed - we can't merge stats from different filters
			StatsLocalStorageUtils.deleteStatsByUsername(username, playerColor);
			playerData = OpeningStatsUtils.createEmptyPlayerData(
				username,
				userInfo.rating,
				playerColor,
				allowedTimeControls,
			);
		} else if (conflictResolution.action === "resume") {
			// Resume from cached data
			const cachedCheck = StatsLocalStorageUtils.checkExistingStatsByUsername(
				username,
				playerColor,
			);
			if (cachedCheck.exists) {
				console.log(
					`Resuming with cached data for ${username} (${playerColor})`,
				);
				playerData = cachedCheck.data.playerData;
				oldestGameTimestampUnixMS = cachedCheck.data.sinceUnixMS;
				numGamesProcessedSoFar = cachedCheck.data.fetchProgress;
			} else {
				// Shouldn't happen if resolveStorageConflict returned "resume", but handle gracefully
				playerData = OpeningStatsUtils.createEmptyPlayerData(
					username,
					userInfo.rating,
					playerColor,
					allowedTimeControls,
				);
			}
		} else {
			// Fresh start - no existing data
			playerData = OpeningStatsUtils.createEmptyPlayerData(
				username,
				userInfo.rating,
				playerColor,
				allowedTimeControls,
			);
		}

		const validationStats = createValidationStats();
		const filters: GameValidationFilters = {
			openingNamesToTrainingIDs,
			maxRatingDeltaBetweenPlayers: MAX_RATING_DELTA_BETWEEN_PLAYERS,
		};

		// Initialize Memory Monitor
		// We sample every x games to avoid console spam
		const memoryMonitor = new MemoryMonitor(SHOULD_TRACK_MEMORY_USAGE, 250);

		// 3. Stream, Validate, and Accumulate
		// Determine how many more games we need
		// We still cap by MAX_GAMES_TO_FETCH for now (keeps cost/time bounded),
		// but the progress bar denominator should reflect the user's estimated total.
		const numGamesNeeded = Math.max(
			0,
			MAX_GAMES_TO_FETCH - numGamesProcessedSoFar,
		);

		if (numGamesNeeded === 0) {
			console.log("Max games reached in cache. Returning cached data.");
			return {
				success: true,
				message: `Using cached data (${numGamesProcessedSoFar} games).`,
				gameData: playerData,
			};
		}

		/** Count of valid games in THIS session */
		let validGameCount = 0;
		/**Count of valid games including any retrieved from localStorage */
		let totalGamesProcessed = 0;
		// Pagination cursor: fetch games older than this timestamp
		// When resuming, start from the oldest game we've already processed
		let currentUntilUnixMS = oldestGameTimestampUnixMS;

		// Keep streaming in batches until we have enough valid games
		while (validGameCount < numGamesNeeded) {
			const stream = streamLichessGames({
				username,
				color: playerColor,
				numGames: Math.min(5000, numGamesNeeded - validGameCount), // Fetch in chunks of up to 5000
				allowedTimeControls: allowedTimeControls,
				sinceUnixMS: sinceUnixMS, // User's date filter (constant)
				untilUnixMS: currentUntilUnixMS, // The oldest timestamp already streamed (moves backwards)
				onWait: onStatusUpdate, // informs the user in the UI when there's a delay in the API call
			});

			let gamesInThisBatch = 0;

			for await (const game of stream) {
				totalGamesProcessed++;
				gamesInThisBatch++;
				validationStats.totalGamesProcessed++;
				// date in day month year
				// TODO delete this after debugging
				if (totalGamesProcessed % 50 === 0) {
					console.log("created at:" + new Date(game.createdAt).toDateString());
				}

				// Track the oldest timestamp seen for pagination after this batch completes
				if (game.createdAt) {
					const oldestToNumber = Number(game.createdAt);
					oldestGameTimestampUnixMS = oldestToNumber;
				}

				// Check memory usage (sampled inside the class)
				// We want to verify that heap size stays relatively flat (O(k) with k being the number of unique openings)
				// as totalProcessed (O(n)) increases.
				memoryMonitor.check(
					totalGamesProcessed,
					Object.keys(playerData.openingStats).length, // number of unique openings
				);

				if (!isValidLichessGame(game, filters)) {
					// Basic tracking of why game wasn't accepted
					if (
						!game.opening ||
						!openingNamesToTrainingIDs.has(game.opening.name)
					) {
						validationStats.filteredByOpening++;
					}
					continue;
				}

				// Game is valid: Accumulate stats
				const result = getGameResult(game, playerColor);

				/**
				 * Determine weight based on speed
				 * Slow games are higher quality data and so add more to the total
				 */
				const weight = TIME_CONTROL_WEIGHTS[game.speed] || 1;

				OpeningStatsUtils.accumulateOpeningStats(
					playerData,
					game.opening!.name, // Safe because isValidLichessGame checks this
					openingNamesToTrainingIDs.get(game.opening!.name)!, // Safe because isValidLichessGame checks this
					game.opening!.eco,
					result,
					weight,
				);

				validGameCount++;
				validationStats.validGames++;
				if (totalGamesProcessed % 50 === 0) {
					console.log(`Processed ${totalGamesProcessed} games`);
				}

				// Report progress to UI
				if (onProgressUpdate) {
					onProgressUpdate({
						numGamesProcessed: numGamesProcessedSoFar + validGameCount,
						totalGamesNeeded: estimatedTotalGamesNeeded,
					});
				}

				// Save progress in localStorage every 500 valid games
				if (
					validGameCount % SAVE_LOCAL_STORAGE_EVERY_N_GAMES === 0 &&
					oldestGameTimestampUnixMS
				) {
					StatsLocalStorageUtils.saveStats(playerData, {
						fetchProgress: numGamesProcessedSoFar + validGameCount,
						isComplete: false, // Still streaming - not complete
						sinceUnixMS: oldestGameTimestampUnixMS,
					});
					console.log(
						`[Incremental Save] Saved progress at ${
							numGamesProcessedSoFar + validGameCount
						} games`,
					);
				}

				// Stop if we've reached the target
				if (validGameCount >= numGamesNeeded) {
					break;
				}
			}

			// If we got no games in this batch, the user has no more games to fetch
			if (gamesInThisBatch === 0) {
				console.log("No more games available from Lichess");
				break;
			}

			// Update pagination cursor for next batch: fetch games older than the oldest we just processed
			// Subtract 1ms to avoid fetching the exact same game again
			if (oldestGameTimestampUnixMS) {
				currentUntilUnixMS = oldestGameTimestampUnixMS - 1;
			}

			console.log(
				`[Batch Complete] Fetched ${gamesInThisBatch} games in this batch. Valid games so far: ${validGameCount}/${numGamesNeeded}`,
			);
		}

		// 4. Finalize
		logValidationStats(validationStats);

		const totalValidGames = numGamesProcessedSoFar + validGameCount;

		if (totalValidGames === 0) {
			return {
				success: false,
				message: `No valid games found for ${username} (checked ${totalGamesProcessed}).`,
			};
		}
		// Save to local storage
		if (oldestGameTimestampUnixMS) {
			StatsLocalStorageUtils.saveStats(playerData, {
				fetchProgress: totalValidGames,
				isComplete: false, // Streaming done, but inference not yet complete
				sinceUnixMS: oldestGameTimestampUnixMS,
			});
		} else {
			console.warn(
				"Skipping localStorage save: No oldestGameTimestamp available (likely no games processed).",
			);
		}

		console.log("blah blah blah");

		// 5.  Now send to HF for inference
		// Takes 10 seconds or less when running both this app and the inference on local;
		// Not sure how long in dev but probably not long
		const response = await sendRawStatsToHF(playerData);
		console.log("response:", response);

		// Save recommendations to localStorage if inference was successful
		if (isValidInferencePredictResponse(response)) {
			console.log("blah blah blah it's a valid response");
			const saveResult = RecommendationsLocalStorageUtils.saveRecommendations(
				username,
				playerColor,
				response,
			);
			if (saveResult.success) {
				console.log(
					`[Recommendations] Saved ${response.recommendations.length} recommendations for ${username} (${playerColor})`,
				);
			} else {
				console.warn(
					`[Recommendations] Failed to save recommendations: ${saveResult.error}`,
				);
			}

			// Mark stats as complete now that inference is done
			if (oldestGameTimestampUnixMS) {
				StatsLocalStorageUtils.saveStats(playerData, {
					fetchProgress: totalValidGames,
					isComplete: true, // Both streaming and inference complete
					sinceUnixMS: oldestGameTimestampUnixMS,
				});
			}
		}

		return response;
	} catch (error) {
		console.error("Error processing username:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "An unknown error occurred",
		};
	}
}
