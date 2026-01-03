"use server";

/**
 * HuggingFace (HF) spaces sleep after inactivity
 *
 * So, this is a quick ping to the HF space early on in stats accumulation,
 * so the space is awake and ready to go when it's time for the actual inference call.
 *
 * Pings /health which is a quick endpoint that verifies the space is online.
 *
 * This is run on the server so as not to expose secrets.
 */
const wakeUpHuggingFaceSpace = async (): Promise<{
	success: boolean;
	message: string;
}> => {
	try {
		// Determine which space URL to use based on environment
		const isDev = process.env.NODE_ENV === "development";
		const spaceUrl = isDev
			? process.env.NEXT_PUBLIC_HF_SPACE_URL_DEV
			: process.env.HF_SPACE_URL_PROD;

		if (!spaceUrl) {
			const envVar = isDev
				? "NEXT_PUBLIC_HF_SPACE_URL_DEV"
				: "HF_SPACE_URL_PROD";
			throw new Error(`Missing ${envVar} environment variable`);
		}

		console.log(
			`[HF Space] Waking up ${
				isDev ? "local" : "production"
			} space: ${spaceUrl}`
		);

		// Build request headers
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (process.env.HF_API_TOKEN) {
			headers["Authorization"] = `Bearer ${process.env.HF_API_TOKEN}`;
		}

		// Ping the health endpoint with a reasonable timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30_000);

		const response = await fetch(`${spaceUrl}/health`, {
			method: "GET",
			headers,
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(
				`Health check failed: ${response.status} ${response.statusText}`
			);
		}

		console.log("[HF Space] Successfully woken up and healthy");

		return {
			success: true,
			message: "HuggingFace Space is awake and ready",
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown error occurred";

		console.error("[HF Space] Failed to wake up space:", message);

		// Don't throw - we want the main process to continue even if wake-up fails
		// The space will just take longer to respond to the actual inference call
		return {
			success: false,
			message: `Failed to wake HF Space: ${message}`,
		};
	}
};

export default wakeUpHuggingFaceSpace;
