// =========================================
// LocalStorage utility for managing chess opening statistics
//
// FETCH PATTERN: We stream games from NEWEST to OLDEST (backwards in time)
// - `sinceUnixMS` timestamp tracks the OLDEST game processed so far
// - To resume, we fetch games older than `sinceUnixMS`
//
// STORAGE KEYS: All usernames normalized to lowercase for consistency
// - Keys: chess-opening-recommender:player:{lowercase_username}:{color}
// - Metadata: chess-opening-recommender:metadata
//
// VALIDATION: All retrieved data validated with Zod schemas
// =========================================

import { AllowedTimeControl } from "../../types/lichess";
import { Color, PlayerData, PlayerDataSchema } from "../../types/stats";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration for localStorage keys and behavior
 */
const CONFIG = {
	/**Namespace prefix for all keys */
	KEY_PREFIX: "chess-opening-recommender",
	/**Key for metadata tracking all stored players */
	METADATA_KEY: "chess-opening-recommender:metadata",
	/**Maximum age in milliseconds before suggesting fresh fetch (7 days) */
	MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,
	/**Storage quota warning threshold (5MB) */
	STORAGE_QUOTA_WARNING_BYTES: 5 * 1024 * 1024,
	/**Schema version for future migrations */
	CURRENT_SCHEMA_VERSION: 1,
} as const;

// ============================================================================
// Storage Types
// ============================================================================

/**
 * Extended player data with metadata for localStorage
 */
export interface StoredPlayerData {
	// Core player data
	playerData: PlayerData;
	// When we last fetched games
	lastFetchedUnixMS: number;
	// Oldest game timestamp processed so far
	sinceUnixMS: number;
	// Number of games processed so far
	fetchProgress: number;
	// Whether fetch completed successfully (streaming done AND inference complete)
	isComplete: boolean;
	// Schema version for migrations
	schemaVersion: 1.0; // update to union type if/when we get different version numbers
	createdAtUnixMS: number;
	allowedTimeControls: AllowedTimeControl[];
}

/**
 * Metadata tracking all stored players.
 * Keys are in format "username:color" (e.g., "magnus:white")
 */
interface StorageMetadata {
	// Map of "username:color" to last access time
	players: Record<string, number>;
	// Total storage used estimate (bytes)
	totalStorageBytes: number;
}

/**
 * Result of checking for existing stats
 */
type ExistingStatsCheck =
	| ExistingStatsCheckDoesExist
	| ExistingStatsCheckDoesNotExist;

type ExistingStatsCheckDoesExist = {
	exists: true;
	data: StoredPlayerData;
	isStale: boolean;
	canResume: boolean;
};

type ExistingStatsCheckDoesNotExist = {
	exists: false;
};

/**
 * Result of conflict resolution when user submits form with potentially conflicting saved data.
 *
 * CONFLICT RULES:
 * 1. TIME CONTROL CONFLICT: If form time controls ≠ saved time controls → delete & restart
 *    (We can't merge stats from different time control sets)
 *
 * 2. DATE CONFLICT (no time control conflict):
 *    - We stream games from NEWEST to OLDEST
 *    - savedSinceUnixMS = oldest game timestamp we've processed
 *
 *    Cases:
 *    a) formSinceDate is undefined or BEFORE savedSinceUnixMS:
 *       → RESUME (we want older games, and we have newer ones cached)
 *
 *    b) formSinceDate is AFTER savedSinceUnixMS:
 *       → The user wants FEWER games (more recent only)
 *       → Since we stream newest→oldest, our cache already covers from "now" backwards
 *       → So if formSinceDate is within our cached range, we're fine: RESUME
 *       → If formSinceDate is somehow in the future or we have no data: FRESH_START
 */
export type LocalStorageResumeConflictResolution =
	| { action: "resume"; reason: string }
	| { action: "delete-and-restart"; reason: string }
	| { action: "fresh-start"; reason: string };

// ============================================================================
// Storage Utility Class
// ============================================================================

export class StatsLocalStorageUtils {
	/**
	 * Generate storage key for a specific username and color.
	 * White and black analyses are stored separately since they use different models.
	 */
	private static getPlayerKey(username: string, color: Color): string {
		return `${CONFIG.KEY_PREFIX}:player:${username.toLowerCase()}:${color}`;
	}

	/**
	 * Check if localStorage is available
	 */
	private static isLocalStorageAvailable(): boolean {
		try {
			const test = "__localStorage_test__";
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get current storage usage estimate
	 */
	private static getStorageUsageBytes(): number {
		let total = 0;
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(CONFIG.KEY_PREFIX)) {
				const value = localStorage.getItem(key);
				if (value) {
					// Rough estimate: 2 bytes per character in UTF-16
					total += (key.length + value.length) * 2;
				}
			}
		}
		return total;
	}

	/**
	 * Get or initialize metadata
	 */
	private static getMetadata(): StorageMetadata {
		try {
			const raw = localStorage.getItem(CONFIG.METADATA_KEY);
			if (raw) {
				return JSON.parse(raw) as StorageMetadata;
			}
		} catch (error) {
			console.error("Error reading metadata:", error);
		}

		return {
			players: {},
			totalStorageBytes: 0,
		};
	}

	/**
	 * Update metadata.
	 * Key format: "username:color" (both lowercased)
	 */
	private static updateMetadata(username: string, color: Color): void {
		const metadata = this.getMetadata();
		const metadataKey = `${username.toLowerCase()}:${color}`;
		metadata.players[metadataKey] = Date.now();
		metadata.totalStorageBytes = this.getStorageUsageBytes();

		try {
			localStorage.setItem(CONFIG.METADATA_KEY, JSON.stringify(metadata));
		} catch (error) {
			console.error("Error updating metadata:", error);
		}
	}

	/**
	 * Check for existing stats for a username and color.
	 * White and black are stored separately.
	 */
	static checkExistingStatsByUsername(
		username: string,
		color: Color
	): ExistingStatsCheck {
		if (!this.isLocalStorageAvailable()) {
			return { exists: false };
		}

		const key = this.getPlayerKey(username, color);
		const raw = localStorage.getItem(key);

		if (!raw) {
			return { exists: false };
		}

		try {
			const stored = JSON.parse(raw) as StoredPlayerData;

			// Validate the player data with Zod
			const parseResult = PlayerDataSchema.safeParse(stored.playerData);
			if (!parseResult.success) {
				console.error("Stored data validation failed:", parseResult.error);
				// Delete corrupted data
				this.deleteStatsByUsername(username, color);
				return { exists: false };
			}

			const age = Date.now() - stored.lastFetchedUnixMS;
			const isStale = age > CONFIG.MAX_AGE_MS;
			const canResume = !stored.isComplete;

			return {
				exists: true,
				data: stored,
				isStale,
				canResume,
			};
		} catch (error) {
			console.error("Error parsing stored data:", error);
			// Delete corrupted data
			this.deleteStatsByUsername(username, color);
			return { exists: false };
		}
	}

	/**
	 * Save or update player stats
	 */
	static saveStats(
		playerData: PlayerData,
		options: {
			lastFetchedUnixMS?: number;
			sinceUnixMS: number;
			fetchProgress: number;
			isComplete: boolean;
		}
	): { success: true } | { success: false; error: string } {
		if (!this.isLocalStorageAvailable()) {
			return {
				success: false,
				error: "localStorage is not available",
			};
		}

		// Check storage quota
		const currentUsage = this.getStorageUsageBytes();
		if (currentUsage > CONFIG.STORAGE_QUOTA_WARNING_BYTES) {
			console.warn(
				`Storage usage (${(currentUsage / 1024 / 1024).toFixed(
					2
				)}MB) exceeds warning threshold`
			);
		}

		const stored: StoredPlayerData = {
			playerData,
			lastFetchedUnixMS: options.lastFetchedUnixMS ?? Date.now(),
			sinceUnixMS: options.sinceUnixMS,
			fetchProgress: options.fetchProgress,
			isComplete: options.isComplete,
			schemaVersion: CONFIG.CURRENT_SCHEMA_VERSION,
			createdAtUnixMS: Date.now(),
			allowedTimeControls: playerData.allowedTimeControls,
		};

		const key = this.getPlayerKey(playerData.lichessUsername, playerData.color);

		try {
			localStorage.setItem(key, JSON.stringify(stored));
			this.updateMetadata(playerData.lichessUsername, playerData.color);
			return { success: true };
		} catch (error) {
			console.error("Error saving stats:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to save to localStorage",
			};
		}
	}

	/**
	 * Get existing stats for a username and color.
	 * Returns null if no stats exist.
	 */
	static getExistingStats(username: string, color: Color): PlayerData | null {
		const check = this.checkExistingStatsByUsername(username, color);

		if (check.exists && check.data) {
			return check.data.playerData;
		}
		return null;
	}

	/**
	 * Delete stats for a specific username and color.
	 * Returns true if successful deletion; false if any error.
	 */
	static deleteStatsByUsername(username: string, color: Color): boolean {
		if (!this.isLocalStorageAvailable()) {
			return false;
		}

		try {
			const key = this.getPlayerKey(username, color);
			localStorage.removeItem(key);

			// Update metadata - key is "username:color"
			const metadata = this.getMetadata();
			const metadataKey = `${username.toLowerCase()}:${color}`;
			delete metadata.players[metadataKey];
			metadata.totalStorageBytes = this.getStorageUsageBytes();
			localStorage.setItem(CONFIG.METADATA_KEY, JSON.stringify(metadata));

			return true;
		} catch (error) {
			console.error("Error deleting stats:", error);
			return false;
		}
	}

	/**
	 * Delete all localStorage stats (clear everything)
	 * Returns true if successful deletion, false if any error
	 */
	static deleteAllLocalStorageStats(): boolean {
		if (!this.isLocalStorageAvailable()) {
			return false;
		}

		try {
			const keysToDelete: string[] = [];

			// Find all our keys
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(CONFIG.KEY_PREFIX)) {
					keysToDelete.push(key);
				}
			}

			// Delete them
			keysToDelete.forEach((key) => localStorage.removeItem(key));

			return true;
		} catch (error) {
			console.error("Error deleting all stats:", error);
			return false;
		}
	}

	/**
	 * Get list of all stored players with basic metadata.
	 * Parses the metadata key format "username:color".
	 * This is just metadata; if you want full data, use getAllStoredPlayersFull().
	 */
	static getAllLocalStoragePlayers(): Array<{
		username: string;
		color: Color;
		lastAccess: number;
		isStale: boolean;
	}> {
		const metadata = this.getMetadata();
		const now = Date.now();

		return Object.entries(metadata.players).map(([key, lastAccess]) => {
			// Key format is "username:color"
			const lastColonIndex = key.lastIndexOf(":");
			const username =
				lastColonIndex > 0 ? key.substring(0, lastColonIndex) : key;
			const color = (
				lastColonIndex > 0 ? key.substring(lastColonIndex + 1) : "white"
			) as Color;

			return {
				username,
				color,
				lastAccess,
				isStale: now - lastAccess > CONFIG.MAX_AGE_MS,
			};
		});
	}

	/**
	 * Get all stored players with FULL data (for SavedProgress UI).
	 * Fetches and parses actual stored data, not just metadata. If you want just metadata, use getAllLocalStoragePlayers().
	 */
	static getAllStoredPlayersFull(): StoredPlayerData[] {
		if (!this.isLocalStorageAvailable()) {
			return [];
		}

		const results: StoredPlayerData[] = [];

		// Iterate all localStorage keys looking for our player keys
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			// Match pattern: chess-opening-recommender:player:{username}:{color}
			if (!key || !key.startsWith(`${CONFIG.KEY_PREFIX}:player:`)) {
				continue;
			}

			try {
				const raw = localStorage.getItem(key);
				if (!raw) continue;

				const stored = JSON.parse(raw) as StoredPlayerData;

				// Validate with Zod
				const parseResult = PlayerDataSchema.safeParse(stored.playerData);
				if (!parseResult.success) {
					console.warn(`Skipping corrupted data for key: ${key}`);
					continue;
				}

				results.push(stored);
			} catch (error) {
				console.warn(`Error parsing stored data for key: ${key}`, error);
			}
		}

		return results;
	}

	/**
	 * Get storage usage info
	 */
	static getStorageInfo(): {
		numUsedBytes: number;
		numUsedMB: number;
		playerCount: number;
		isNearQuota: boolean;
	} {
		const numUsedBytes = this.getStorageUsageBytes();
		const metadata = this.getMetadata();

		return {
			numUsedBytes,
			numUsedMB: numUsedBytes / 1024 / 1024,
			playerCount: Object.keys(metadata.players).length,
			isNearQuota: numUsedBytes > CONFIG.STORAGE_QUOTA_WARNING_BYTES,
		};
	}

	/**
	 * Resolve conflicts between form submission and existing localStorage data.
	 *
	 * Called when user manually enters a username (not via resume button).
	 * Determines whether to resume from cache, delete and restart, or start fresh.
	 *
	 * @param params.username - The username being analyzed
	 * @param params.color - The color being analyzed
	 * @param params.formTimeControls - Time controls selected in form
	 * @param params.formSinceUnixMS - Optional "since" date from form (undefined = all time)
	 */
	static resolveStorageConflict(params: {
		username: string;
		color: Color;
		formTimeControls: AllowedTimeControl[];
		formSinceUnixMS?: number;
	}): LocalStorageResumeConflictResolution {
		const { username, color, formTimeControls, formSinceUnixMS } = params;

		// Check if we have existing data for this user+color
		const existing = this.checkExistingStatsByUsername(username, color);

		// Case 1: No existing data → fresh start
		if (!existing.exists) {
			return {
				action: "fresh-start",
				reason: "No existing data found for this player and color.",
			};
		}

		const savedData = existing.data;
		const savedTimeControls = savedData.allowedTimeControls;
		const savedSinceUnixMS = savedData.sinceUnixMS; // Oldest game we've processed

		// Case 2: TIME CONTROL CONFLICT
		// If form time controls don't match saved time controls, we can't merge.
		// We must delete and restart because the stats were accumulated with different filters.
		const formTCSet = new Set(formTimeControls);
		const savedTCSet = new Set(savedTimeControls);
		const timeControlsMatch =
			formTCSet.size === savedTCSet.size &&
			[...formTCSet].every((tc) => savedTCSet.has(tc));

		if (!timeControlsMatch) {
			return {
				action: "delete-and-restart",
				reason: `Time controls changed (saved: ${savedTimeControls.join(
					", "
				)} → form: ${formTimeControls.join(", ")}). Must restart.`,
			};
		}

		// Case 3: DATE CONFLICT (time controls match)
		// We stream NEWEST → OLDEST, so savedSinceUnixMS is the oldest game we have.
		// - If formSinceUnixMS is undefined (all time) or BEFORE savedSinceUnixMS:
		//   → User wants older games than we have. RESUME and keep streaming backwards.
		// - If formSinceUnixMS is AFTER savedSinceUnixMS:
		//   → User wants fewer (more recent) games. Our cache covers from "now" backwards,
		//     so we already have all games from now to savedSinceUnixMS.
		//   → As long as formSinceUnixMS is within that range (≥ savedSinceUnixMS), RESUME.
		//   → If somehow formSinceUnixMS is in the future, just RESUME anyway (edge case).

		if (formSinceUnixMS === undefined) {
			// User wants all time → resume, we'll continue from where we left off
			return {
				action: "resume",
				reason: "Resuming from cached data (analyzing all time).",
			};
		}

		if (formSinceUnixMS <= savedSinceUnixMS) {
			// User wants games older than what we've processed so far.
			// Resume and continue streaming backwards from savedSinceUnixMS.
			return {
				action: "resume",
				reason:
					"Form date is before our cached oldest game. Resuming to fetch older games.",
			};
		}

		// formSinceUnixMS > savedSinceUnixMS
		// User wants only games newer than our oldest cached game.
		// Since we stream newest→oldest starting from "now", our cache already covers
		// all games from "now" down to savedSinceUnixMS.
		// So formSinceUnixMS is within our cached range → RESUME
		return {
			action: "resume",
			reason:
				"Form date is within cached range. Using cached data (no additional streaming needed for this date range).",
		};
	}
}
