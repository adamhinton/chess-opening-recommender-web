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
import * as Sentry from "@sentry/nextjs";

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
		Sentry.captureMessage("HuggingFace space URL not configured", {
			level: "error",
		});
		return { error: "HuggingFace space URL not configured" };
	}

	const hfApiToken = process.env.HF_API_TOKEN;
	if (!hfApiToken) {
		Sentry.captureMessage("HuggingFace API token not configured", {
			level: "error",
		});
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

	if (!response.ok) {
		const err = new Error(
			`HF inference request failed: ${response.status} ${response.statusText}`,
		);
		Sentry.captureException(err, {
			extra: {
				username: data.lichessUsername,
				color: data.color,
				status: response.status,
				statusText: response.statusText,
				url: `${hfSpaceApiUrl}/predict`,
			},
		});
		return {
			error: `HuggingFace inference failed: ${response.status} ${response.statusText}`,
		};
	}

	let responseJSON: unknown;
	try {
		responseJSON = await response.json();
	} catch (parseError) {
		Sentry.captureException(parseError, {
			extra: {
				username: data.lichessUsername,
				color: data.color,
				context: "Failed to parse HF inference response as JSON",
				status: response.status,
			},
		});
		return { error: "Failed to parse response from HuggingFace space" };
	}

	const isValidResponse = isValidInferencePredictResponse(responseJSON);

	if (!isValidResponse) {
		Sentry.captureMessage("Invalid response shape from HuggingFace inference", {
			level: "error",
			extra: {
				username: data.lichessUsername,
				color: data.color,
				responseJSON,
			},
		});
		return { error: "Invalid response from HuggingFace space" };
	}

	return responseJSON as InferencePredictResponse;
};

export default sendRawStatsToHF;
