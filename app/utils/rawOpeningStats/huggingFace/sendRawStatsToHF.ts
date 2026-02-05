"use server";

import {
	InferencePredictResponse,
	isValidInferencePredictResponse,
	OpeningStatsUtils,
	PlayerData,
} from "../../types/stats";

const sendRawStatsToHF = async (
	data: PlayerData,
): Promise<InferencePredictResponse | { error: string }> => {
	// Step 1: Prepare to send
	const hfSpaceApiUrl = process.env.HF_SPACE_URL_PROD;

	if (!hfSpaceApiUrl) {
		return { error: "HuggingFace space URL not configured" };
	}

	const hfApiToken = process.env.HF_API_TOKEN;
	if (!hfApiToken) {
		return { error: "HuggingFace API token not configured" };
	}

	const payload = OpeningStatsUtils.convertToHFPayload(data);
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
