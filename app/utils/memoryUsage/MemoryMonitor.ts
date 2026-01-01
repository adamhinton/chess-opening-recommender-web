// __________________
// Util to run in dev

// Purpose: Ensure that browser memory usage does not increase with the number of Lichess games streamed

// We've architected it so that memory only increases with the number of unique openings (200-600), leveling off as fewer new openings are revealed

// Update: After running this utility, it appears we've succeeded in the above goal. See stats below from the console in testing, which show that processing more games does not increase memory usage.

// [Memory] Games: 500 | Openings: 111 | Used: 63MB | Total: 66MB | Limit: 4096MB
// [Memory] Games: 1000 | Openings: 149 | Used: 66MB | Total: 68MB | Limit: 4096MB
// [Memory] Games: 1500 | Openings: 167 | Used: 66MB | Total: 69MB | Limit: 4096MB
// [Memory] Games: 2000 | Openings: 178 | Used: 67MB | Total: 69MB | Limit: 4096MB

// __________________

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
