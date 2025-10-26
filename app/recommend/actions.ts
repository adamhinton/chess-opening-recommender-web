"use server";

export async function processLichessUsername(formData: FormData) {
	const username = formData.get("username") as string;

	if (!username) {
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
