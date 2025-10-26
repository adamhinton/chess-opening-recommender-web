// ________________________________
// This is a testing file for now
// User will enter a lichess username on the client;
// This server action will call the Liches (or other site) API to get game data for that username
// Then, it will process that data.
// Right now, we just want to successfully download game data.

// API docs:
// https://lichess.org/api#tag/Games/operation/apiGamesUser
// ________________________________

"use server";

export async function processLichessUsername(formData: FormData) {
	const username = formData.get("username");

	console.log("Processing username:", username);

	if (!username || typeof username !== "string") {
		throw new Error("Username is required");
	}

	// // First, verify the user exists by checking their profile
	// const userResponse = await fetch(`https://lichess.org/api/user/${username}`);

	// if (!userResponse.ok) {
	// 	if (userResponse.status === 404) {
	// 		return {
	// 			success: false,
	// 			message: `User "${username}" not found on Lichess. Please check the username and try again.`,
	// 		};
	// 	}
	// 	return {
	// 		success: false,
	// 		message: `Error checking user "${username}". Please try again.`,
	// 	};
	// }

	// Now call Lichess API to get user game data, with parameters such as openings, rated only, etc
	const params = new URLSearchParams({
		rated: "true",
		perfType: "blitz,rapid,classical",
		max: "100",
		moves: "false",
		opening: "true",
		color: "white",
	});

	const response = await fetch(
		`https://lichess.org/api/games/user/${username}?${params.toString()}`,
		{
			headers: {
				Accept: "application/x-ndjson",
			},
		}
	);

	console.log("response:", response);

	if (!response.ok) {
		console.error("Failed to fetch game data:", response.statusText);

		let errorMessage = `Failed to fetch game data for ${username}.`;

		if (response.status === 404) {
			errorMessage = `User "${username}" not found on Lichess. Please check the username and try again.`;
		} else if (response.status === 429) {
			errorMessage = "Too many requests. Please wait a moment and try again.";
		} else if (response.status >= 500) {
			errorMessage = "Lichess server error. Please try again later.";
		}

		return {
			success: false,
			message: errorMessage,
		};
	}

	console.log("response:", response);

	const gameData = await response.text();

	console.log("Fetched game data:", gameData);

	// Parse NDJSON - each line is a separate JSON object
	const games = gameData
		.trim()
		.split("\n")
		.filter((line) => line.trim() !== "")
		.map((line) => {
			try {
				return JSON.parse(line);
			} catch (error) {
				console.error("Error parsing game line:", error);
				return null;
			}
		})
		.filter((game) => game !== null);

	// Check if we got any games
	if (!games || games.length === 0) {
		return {
			success: false,
			message: `No rated games found for ${username} in blitz, rapid, or classical time controls. Please make sure you have played some rated games.`,
		};
	}

	console.log(`Found ${games.length} games for ${username}`);

	// For now, just return a success message
	return {
		success: true,
		gameData: games,
		message: `Successfully loaded ${games.length} games for ${username}`,
	};
}
