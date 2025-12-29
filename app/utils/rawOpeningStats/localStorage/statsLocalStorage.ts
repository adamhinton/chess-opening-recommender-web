// =========================================
// LocalStorage utility for managing chess opening statistics
//
// FETCH PATTERN: We stream games from NEWEST to OLDEST (backwards in time)
// - `sinceUnixMS` timestamp tracks the OLDEST game processed so far
// - To resume, we fetch games older than `sinceUnixMS`
//
// STORAGE KEYS: All usernames normalized to lowercase for consistency
// - Keys: chess-opening-recommender:player:{lowercase_username}
// - Metadata: chess-opening-recommender:metadata
//
// VALIDATION: All retrieved data validated with Zod schemas
// =========================================

import { PlayerData, PlayerDataSchema } from "../../types/stats";

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
interface StoredPlayerData {
	// Core player data
	playerData: PlayerData;
	// When we last fetched games
	lastFetchedUnixMS: number;
	// Oldest game timestamp processed so far
	sinceUnixMS?: number;
	// Number of games processed so far
	fetchProgress: number;
	// Whether fetch completed successfully
	isComplete: boolean;
	// Schema version for migrations
	schemaVersion: 1.0; // update to union type if/when we get different version numbers
	createdAtUnixMS: number;
}

/**
 * Metadata tracking all stored players
 */
interface StorageMetadata {
	// Map of username to last access time
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

// ============================================================================
// Storage Utility Class
// ============================================================================

export class StatsLocalStorageUtils {
	/**
	 * Generate storage key for a specific username
	 */
	private static getPlayerKey(username: string): string {
		return `${CONFIG.KEY_PREFIX}:player:${username.toLowerCase()}`;
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
	 * Update metadata
	 * Always normalizes username to lowercase for consistency
	 */
	private static updateMetadata(username: string): void {
		const metadata = this.getMetadata();
		metadata.players[username.toLowerCase()] = Date.now();
		metadata.totalStorageBytes = this.getStorageUsageBytes();

		try {
			localStorage.setItem(CONFIG.METADATA_KEY, JSON.stringify(metadata));
		} catch (error) {
			console.error("Error updating metadata:", error);
		}
	}

	/**
	 * Check for existing stats for a username
	 */
	static checkExistingStatsByUsername(username: string): ExistingStatsCheck {
		if (!this.isLocalStorageAvailable()) {
			return { exists: false };
		}

		const key = this.getPlayerKey(username);
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
				this.deleteStatsByUsername(username);
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
			this.deleteStatsByUsername(username);
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
			sinceUnixMS?: number;
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
		};

		const key = this.getPlayerKey(playerData.lichessUsername);

		try {
			localStorage.setItem(key, JSON.stringify(stored));
			this.updateMetadata(playerData.lichessUsername);
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
	 * Get existing stats for a username
	 * Returns null if no stats exist
	 */
	static getExistingStats(username: string): PlayerData | null {
		const check = this.checkExistingStatsByUsername(username);

		if (check.exists && check.data) {
			return check.data.playerData;
		}
		return null;
	}

	/**
	 * Delete stats for a specific username
	 * Returns true if successful deletion; false if any error
	 */
	static deleteStatsByUsername(username: string): boolean {
		if (!this.isLocalStorageAvailable()) {
			return false;
		}

		try {
			const key = this.getPlayerKey(username);
			localStorage.removeItem(key);

			// Update metadata
			const metadata = this.getMetadata();
			delete metadata.players[username.toLowerCase()];
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
	 * Get list of all stored usernames with metadata
	 */
	static getAllLocalStoragePlayers(): Array<{
		username: string;
		lastAccess: number;
		isStale: boolean;
	}> {
		const metadata = this.getMetadata();
		const now = Date.now();

		return Object.entries(metadata.players).map(([username, lastAccess]) => ({
			username,
			lastAccess,
			isStale: now - lastAccess > CONFIG.MAX_AGE_MS,
		}));
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
}
