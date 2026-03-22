// _____________
// Once the player's accumulated opening stats are parsed on the frontend, this sends those stats to the HuggingFace
// AI model for inference.
// _____________

"use server";

import {
	InferencePredictResponse,
	isValidInferencePredictResponse,
	OpeningStatsUtils,
	PlayerData,
} from "../../types/stats";

/**
 * Sends player's accumulated opening stats to HuggingFace model to get opening recommendations.
 *
 * @param data All of the player's data needed for the model to perform inference
 * @returns Information about the openings recommended, color, and user account.
 */
const sendRawStatsToHF = async (
	data: Readonly<PlayerData>,
): Promise<Readonly<InferencePredictResponse> | { error: string }> => {
	// Step 1: Prepare to send
	const hfSpaceApiUrl =
		process.env.NODE_ENV === "development"
			? process.env.NEXT_PUBLIC_HF_SPACE_URL_DEV
			: process.env.HF_SPACE_URL_PROD;

	if (!hfSpaceApiUrl) {
		return { error: "HuggingFace space URL not configured" };
	}

	const hfApiToken = process.env.HF_API_TOKEN;
	if (!hfApiToken) {
		return { error: "HuggingFace API token not configured" };
	}

	const payload = OpeningStatsUtils.convertToHFPayload(data);

	// Step 2: Send
	const response = await fetch(`${hfSpaceApiUrl}/predict`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${hfApiToken}`,
		},
		body: JSON.stringify(payload),
	});

	const responseJSON = await response.json();
	const isValidResponse = isValidInferencePredictResponse(responseJSON);

	if (!isValidResponse) {
		return { error: "Invalid response from HuggingFace space" };
	}

	return responseJSON;
};

export default sendRawStatsToHF;
