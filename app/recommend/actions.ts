// ________________________________
// This is a testing file for now
// User will enter a lichess username on the client;
// This server action will call the Liches (or other site) API to get game data for that username
// Then, it will process that data.
// Right now, we just want to successfully download game data.
// ________________________________

"use server";

export async function processLichessUsername(formData: FormData) {
	const username = formData.get("username");

	console.log("Processing username:", username);

	if (!username || typeof username !== "string") {
		throw new Error("Username is required");
	}

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
		`https://lichess.org/api/user/${username}/games?${params}`
	);

	console.log("response:", response);

	if (!response.ok) {
		console.error("Failed to fetch game data:", response.statusText);
		return {
			success: false,
			message: `Failed to fetch game data for ${username}.`,
		};
	}

	const gameData = await response.json();

	console.log("Fetched game data:", gameData);

	// For now, just return a success message
	return {
		success: true,
		gameData,
	};
}
