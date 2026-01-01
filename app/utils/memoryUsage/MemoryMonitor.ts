/**
 * Extends the Performance interface for Chrome's non-standard memory API.
 * This API is only available in Chromium-based browsers (Chrome, Edge, etc).
 */
interface PerformanceMemory {
	usedJSHeapSize: number;
	totalJSHeapSize: number;
	jsHeapSizeLimit: number;
}

declare global {
	interface Performance {
		memory?: PerformanceMemory;
	}
}

/**
 * Utility to track memory usage during long-running processes (like streaming thousands of games).
 *
 * GOAL: Ensure memory usage grows O(k) with number of unique openings (200-600),
 * NOT O(n) with number of games processed.
 *
 * If we see heap size growing linearly with games processed, we have a memory leak
 * (likely holding onto game objects instead of just accumulating stats).
 */
export class MemoryMonitor {
	private isEnabled: boolean;
	private sampleIntervalGames: number;

	constructor(isEnabled: boolean, sampleIntervalGames = 1000) {
		this.isEnabled = isEnabled;
		this.sampleIntervalGames = sampleIntervalGames;
	}

	/**
	 * Logs memory usage if enabled and the interval is met.
	 *
	 * @param gameCount - Total games processed so far
	 * @param openingCount - Number of unique openings stored (the 'k' in O(k))
	 */
	check(gameCount: number, openingCount: number) {
		// 1. Fast exit if disabled
		if (!this.isEnabled) return;

		// 2. Sampling: Only run every X games to avoid console spam and perf hits
		if (gameCount % this.sampleIntervalGames !== 0) return;

		// 3. Measure
		if (performance.memory) {
			const usedMB = Math.round(
				performance.memory.usedJSHeapSize / 1024 / 1024
			);
			const totalMB = Math.round(
				performance.memory.totalJSHeapSize / 1024 / 1024
			);
			const limitMB = Math.round(
				performance.memory.jsHeapSizeLimit / 1024 / 1024
			);

			console.log(
				`[Memory] Games: ${gameCount} | Openings: ${openingCount} | Used: ${usedMB}MB | Total: ${totalMB}MB | Limit: ${limitMB}MB`
			);
		}
	}
}
