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

	if (!username || typeof username !== "string") {
		throw new Error("Username is required");
	}

	// TODO: Implement actual processing logic
	console.log("Processing username:", username);

	// For now, just return a success message
	return {
		success: true,
		message: `Processing recommendations for ${username}...`,
		username,
	};
}
