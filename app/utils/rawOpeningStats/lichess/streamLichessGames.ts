import { LichessGameAPIResponse } from "../../types/lichess";
import { Color } from "../../types/stats";
import { fetchWithBackoff } from "../../network/fetchWithBackoff";

//lichess.org/api#tag/games/GET/api/games/user/{username}

/**
 * Configuration for streaming Lichess games.
 */
export interface StreamLichessGamesConfig {
	username: string;
	color: Color;
	numGames: number;
	since?: number; // Unix timestamp in milliseconds
	until?: number; // Unix timestamp in milliseconds
	/**This passes up a user-friendly message to the UI informing them that there's a delay */
	onWait?: (message: string) => void;
}

/**
 * Streams games from Lichess API one at a time.
 *
 * Uses async generator pattern - yields one game at a time, allowing
 * immediate processing and automatic garbage collection of previous games.
 *
 * @param config - Configuration for what games to stream
 * @yields Individual games as they're parsed from the NDJSON stream
 * @throws Error if API request fails or username not found
 *
 * @example
 * ```typescript
 * for await (const game of streamLichessGames({ username: "player123", color: "white", numGames: 100 })) {
 *    Process game
 *    Previous games are automatically garbage collected
 * }
 * ```
 */
export async function* streamLichessGames(
	config: StreamLichessGamesConfig
): AsyncGenerator<LichessGameAPIResponse, void, unknown> {
	const {
		username,
		color,
		numGames: numGamesToFetch,
		since,
		until,
		onWait,
	} = config;

	// Build API parameters
	const params = new URLSearchParams({
		color: color,
		rated: "true",
		perfType: "blitz,rapid,classical",
		max: numGamesToFetch.toString(),
		moves: "false",
		opening: "true",
		tags: "false",
		clocks: "true",
	});

	// Add optional timestamp params if provided
	if (since !== undefined) {
		params.append("since", since.toString());
	}
	if (until !== undefined) {
		params.append("until", until.toString());
	}

	// Make API request
	// fetchWithBackOff (obviously) calls the Lichess API to get user's games, with exponential backoff to respect any rate limits etc
	const response = await fetchWithBackoff({
		url: `https://lichess.org/api/games/user/${username}?${params.toString()}`,
		options: {
			headers: {
				Accept: "application/x-ndjson",
			},
		},
		onRetry: onWait,
	});

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error(
				`User "${username}" not found on Lichess. Please check the username and try again.`
			);
		} else if (response.status === 429) {
			throw new Error("Too many requests. Please wait a moment and try again.");
		} else if (response.status >= 500) {
			throw new Error("Lichess server error. Please try again later.");
		}
		throw new Error(
			`Failed to fetch games: ${response.status} ${response.statusText}`
		);
	}

	// Get the response body as a readable stream
	const reader = response.body?.getReader();
	if (!reader) {
		throw new Error("Failed to get response stream");
	}

	const decoder = new TextDecoder();
	let buffer = "";

	try {
		// Read stream chunk by chunk
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				// Process any remaining data in buffer
				if (buffer.trim()) {
					try {
						const game = JSON.parse(buffer) as LichessGameAPIResponse;
						yield game;
					} catch (error) {
						console.error("Error parsing final game:", error);
					}
				}
				break;
			}

			// Decode chunk and add to buffer
			buffer += decoder.decode(value, { stream: true });

			// Process complete lines (NDJSON format)
			const lines = buffer.split("\n");
			// Keep last incomplete line in buffer
			buffer = lines.pop() || "";

			// Parse and yield each complete line
			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;

				try {
					// Don't want to validate every single game here with Zod, that would get expensive with thousands of games
					// But, the lichess API is very reliable so we'll assume data is valid
					const game = JSON.parse(trimmed) as LichessGameAPIResponse;
					yield game;
				} catch (error) {
					console.error("Error parsing game line:", error);
					// Continue processing other games
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}
