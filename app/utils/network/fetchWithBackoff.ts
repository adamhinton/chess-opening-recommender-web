// __________________
// This is utils for our game-fetching call to the Lichess API
// Particularly, implementing exponential backoff to respect any API limits etc
// __________________

/**
 * Configuration for fetchWithBackoff
 */
export interface FetchWithBackoffConfig {
	url: string;
	options?: RequestInit;
	maxRetries?: number;
	baseDelayMs?: number;
	onRetry?: (message: string) => void;
}

/**
 * Performs a fetch with exponential backoff for 429 and 5xx errors.
 *
 * This is to respect any Lichess API rate limits etc.
 *
 * @param config - Configuration object
 * @returns The Response object
 * @throws Error if max retries exceeded for network errors
 */
export async function fetchWithBackoff({
	url,
	options,
	maxRetries = 5,
	baseDelayMs = 1000,
	onRetry,
}: FetchWithBackoffConfig): Promise<Response> {
	let numAttemptsSoFar = 0;

	while (true) {
		try {
			const response = await fetch(url, options);

			// Success
			if (response.ok) {
				return response;
			}

			// Client error (4xx) that isn't 429 (Too Many Requests) - do not retry
			if (
				response.status >= 400 &&
				response.status < 500 &&
				response.status !== 429
			) {
				return response;
			}

			// If we are here, it's a 429 or 5xx error.
			// Check if we've exceeded max retries
			if (numAttemptsSoFar >= maxRetries) {
				return response;
			}

			numAttemptsSoFar++;

			// Calculate delay
			let delayMs = baseDelayMs * Math.pow(2, numAttemptsSoFar - 1);

			// Respect Retry-After header if present
			const retryAfterHeader = response.headers.get("Retry-After");
			if (retryAfterHeader) {
				const retryAfterSeconds = parseInt(retryAfterHeader, 10);
				if (!isNaN(retryAfterSeconds)) {
					const retryAfterMs = retryAfterSeconds * 1000;
					delayMs = retryAfterMs;
				}
			}

			// Add Jitter (+/- 20%)
			const jitterMs = delayMs * 0.2 * (Math.random() * 2 - 1);
			delayMs = Math.max(0, delayMs + jitterMs);

			// Notify user
			if (onRetry) {
				onRetry(
					`Server is busy (Attempt ${numAttemptsSoFar}/${maxRetries}). Retrying in ${(
						delayMs / 1000
					).toFixed(1)}s...`
				);
			}

			// Wait
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		} catch (error) {
			// Network error (fetch failed to connect)
			numAttemptsSoFar++;

			if (numAttemptsSoFar > maxRetries) {
				throw error;
			}

			let delayMs = baseDelayMs * Math.pow(2, numAttemptsSoFar - 1);
			/**
			 * Random 20% changes in delay
			 */
			const jitterMs = delayMs * 0.2 * (Math.random() * 2 - 1);
			delayMs = Math.max(0, delayMs + jitterMs);

			if (onRetry) {
				onRetry(
					`Network error (Attempt ${numAttemptsSoFar}/${maxRetries}). Retrying in ${(
						delayMs / 1000
					).toFixed(1)}s...`
				);
			}

			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}
}
