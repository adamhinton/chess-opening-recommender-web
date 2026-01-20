// =========================================
// LocalStorage utility for managing chess opening recommendations
//
// Stores inference results (recommendations) separately from raw stats.
// Each recommendation set is keyed by "username:color".
//
// This is the RESULT of inference on raw stats
//
// STORAGE KEYS: All usernames normalized to lowercase for consistency
// - Keys: chess-opening-recommender:recommendations:{lowercase_username}:{color}
// - Metadata: chess-opening-recommender:recommendations-metadata
// =========================================

import { z } from "zod";
import {
	Color,
	ColorSchema,
	InferencePredictResponse,
	InferencePredictResponseSchema,
} from "@/app/utils/types/stats";

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
	LOCALSTORAGE_KEY_PREFIX: "chess-opening-recommender:recommendations",
	/** Key for metadata tracking all stored recommendations */
	LOCLASTORAGE_METADATA_KEY:
		"chess-opening-recommender:recommendations-metadata",
	/** Time window (ms) for "recently saved" detection */
	RECENT_SAVE_WINDOW_MS: 60_000,
	/** Schema version for future migrations */
	CURRENT_SCHEMA_VERSION: 1,
} as const;

// ============================================================================
// Storage Types
// ============================================================================

/**
 * Extended recommendation data with metadata for localStorage
 */
export const StoredRecommendationDataSchema = z.object({
	/** Lichess username */
	username: z.string(),
	color: ColorSchema,
	recommendations: InferencePredictResponseSchema,
	savedAtUnixMS: z.number(),
	/** Schema version for migrations */
	schemaVersion: z.literal(1),
});

export type StoredRecommendationData = z.infer<
	typeof StoredRecommendationDataSchema
>;

/**
 * Metadata tracking all stored recommendations.
 * Keys are in format "username:color" (e.g., "magnus:white")
 */
interface RecommendationsMetadata {
	/** Map of "username:color" to last save time */
	entries: Record<string, number>;
}

// ============================================================================
// Result Types (Tagged Unions)
// ============================================================================

export type GetRecommendationsResult =
	| { exists: true; data: StoredRecommendationData; isRecent: boolean }
	| { exists: false };

export type SaveRecommendationsResult =
	| { success: true }
	| { success: false; error: string };

// ============================================================================
// Storage Utilities
// ============================================================================

export class RecommendationsLocalStorageUtils {
	/**
	 * Generate storage key for a specific username and color.
	 */
	private static getKey(username: string, color: Color) {
		return `${
			CONFIG.LOCALSTORAGE_KEY_PREFIX
		}:${username.toLowerCase()}:${color}`;
	}

	/**
	 * Check if localStorage is available
	 */
	private static isLocalStorageAvailable() {
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
	 * Get or initialize metadata
	 */
	private static getMetadata(): RecommendationsMetadata {
		try {
			const raw = localStorage.getItem(CONFIG.LOCLASTORAGE_METADATA_KEY);
			if (raw) {
				return JSON.parse(raw) as RecommendationsMetadata;
			}
		} catch (error) {
			console.error("Error reading recommendations metadata:", error);
		}

		return { entries: {} };
	}

	/**
	 * Update metadata
	 */
	private static updateMetadata(username: string, color: Color): void {
		const metadata = this.getMetadata();
		const metadataKey = `${username.toLowerCase()}:${color}`;
		metadata.entries[metadataKey] = Date.now();

		try {
			localStorage.setItem(
				CONFIG.LOCLASTORAGE_METADATA_KEY,
				JSON.stringify(metadata),
			);
		} catch (error) {
			console.error("Error updating recommendations metadata:", error);
		}
	}

	/**
	 * Remove entry from metadata
	 */
	private static removeUsernameFromMetadata(
		username: string,
		color: Color,
	): void {
		const metadata = this.getMetadata();
		const metadataKey = `${username.toLowerCase()}:${color}`;
		delete metadata.entries[metadataKey];

		try {
			localStorage.setItem(
				CONFIG.LOCLASTORAGE_METADATA_KEY,
				JSON.stringify(metadata),
			);
		} catch (error) {
			console.error("Error updating recommendations metadata:", error);
		}
	}

	/**
	 * Save model-generated recommendations to localStorage
	 */
	static saveRecommendations(
		username: string,
		color: Color,
		recommendations: InferencePredictResponse,
	): SaveRecommendationsResult {
		if (!this.isLocalStorageAvailable()) {
			return { success: false, error: "localStorage is not available" };
		}

		const stored: StoredRecommendationData = {
			username,
			color,
			recommendations,
			savedAtUnixMS: Date.now(),
			schemaVersion: CONFIG.CURRENT_SCHEMA_VERSION,
		};

		const key = this.getKey(username, color);

		try {
			localStorage.setItem(key, JSON.stringify(stored));
			this.updateMetadata(username, color);
			return { success: true };
		} catch (error) {
			console.error("Error saving recommendations:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to save recommendations",
			};
		}
	}

	/**
	 * Retrieve stored recommendations for a username and color
	 */
	static getStoredRecommendations(
		username: string,
		color: Color,
	): GetRecommendationsResult {
		if (!this.isLocalStorageAvailable()) {
			return { exists: false };
		}

		const key = this.getKey(username, color);
		const raw = localStorage.getItem(key);

		if (!raw) {
			return { exists: false };
		}

		try {
			const parsed = JSON.parse(raw);
			const validation = StoredRecommendationDataSchema.safeParse(parsed);

			if (!validation.success) {
				console.warn(
					"Invalid stored recommendations, removing:",
					validation.error,
				);
				this.deleteRecommendations(username, color);
				return { exists: false };
			}

			const isRecent =
				Date.now() - validation.data.savedAtUnixMS <
				CONFIG.RECENT_SAVE_WINDOW_MS;

			return {
				exists: true,
				data: validation.data,
				isRecent,
			};
		} catch (error) {
			console.error("Error parsing stored recommendations:", error);
			this.deleteRecommendations(username, color);
			return { exists: false };
		}
	}

	/**
	 * Delete recommendations for a username and color
	 */
	static deleteRecommendations(username: string, color: Color): boolean {
		if (!this.isLocalStorageAvailable()) {
			return false;
		}

		try {
			const key = this.getKey(username, color);
			localStorage.removeItem(key);
			this.removeUsernameFromMetadata(username, color);
			return true;
		} catch (error) {
			console.error("Error deleting recommendations:", error);
			return false;
		}
	}

	/**
	 * Get all stored recommendations with full data
	 */
	static getAllStoredRecommendations(): StoredRecommendationData[] {
		if (!this.isLocalStorageAvailable()) {
			return [];
		}

		const results: StoredRecommendationData[] = [];

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (!key || !key.startsWith(CONFIG.LOCALSTORAGE_KEY_PREFIX + ":")) {
				continue;
			}
			// Skip the metadata key
			if (key === CONFIG.LOCLASTORAGE_METADATA_KEY) {
				continue;
			}

			try {
				const raw = localStorage.getItem(key);
				if (!raw) continue;

				const parsed = JSON.parse(raw);
				const validation = StoredRecommendationDataSchema.safeParse(parsed);

				if (!validation.success) {
					console.warn(`Skipping corrupted recommendations for key: ${key}`);
					continue;
				}

				results.push(validation.data);
			} catch (error) {
				console.warn(`Error parsing recommendations for key: ${key}`, error);
			}
		}

		// Sort by most recently saved first
		return results.sort((a, b) => b.savedAtUnixMS - a.savedAtUnixMS);
	}

	/**
	 * Get count of stored recommendations
	 */
	static getStoredCount() {
		const metadata = this.getMetadata();
		return Object.keys(metadata.entries).length;
	}

	/**
	 * Find the most recently saved recommendation (if within the recent window)
	 * This is used to auto-display when navigating from /recommend
	 */
	static getMostRecentRecommendation(): StoredRecommendationData | null {
		const all = this.getAllStoredRecommendations();
		if (all.length === 0) return null;

		const mostRecent = all[0]; // Already sorted by savedAtUnixMS desc
		const isRecent =
			Date.now() - mostRecent.savedAtUnixMS < CONFIG.RECENT_SAVE_WINDOW_MS;

		return isRecent ? mostRecent : null;
	}

	/**
	 * Delete all stored recommendations
	 */
	static deleteAllStoredRecommendations(): boolean {
		if (!this.isLocalStorageAvailable()) {
			return false;
		}

		try {
			const keysToDelete: string[] = [];

			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(CONFIG.LOCALSTORAGE_KEY_PREFIX)) {
					keysToDelete.push(key);
				}
			}

			keysToDelete.forEach((key) => localStorage.removeItem(key));
			return true;
		} catch (error) {
			console.error("Error deleting all stored recommendations:", error);
			return false;
		}
	}
}
