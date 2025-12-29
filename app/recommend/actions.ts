"use client";

import { streamLichessGames } from "../utils/rawOpeningStats/lichess/streamLichessGames";

export async function processLichessUsername(formData: FormData) {
	const username = formData.get("username");

	console.log("Processing username:", username);

	if (!username || typeof username !== "string") {
		throw new Error("Username is required");
	}

	try {
		let gameCount = 0;

		// Stream games one at a time
		for await (const game of streamLichessGames({
			username,
			color: "white",
			numGames: 100,
		})) {
			gameCount++;
			console.log(`Processing game ${gameCount}:`, game.id);
			// TODO: Process game and accumulate opening stats
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
		};
	} catch (error) {
		console.error("Error processing username:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "An error occurred",
		};
	}
}
