import { LichessGameAPIResponse } from "../../types/lichessTypes";

/**
 * Excludes games with ending that don't reflect a player's skill in the game,
 * such as cheat detected, game aborted, server crash etc
 */
const VALID_GAME_ENDING_STATUSES = new Set([
	"mate",
	"resign",
	"stalemate",
	"timeout",
	"outoftime",
	"draw",
]);

/**
 * Minimum number of plies (half-moves) required for a valid game
 *
 * > 6 moves means > 12 plies.
 */
const MIN_NUM_PLY = 12;

/**
 * Validates basic structural requirements of the game:
 * - Variant is standard
 * - Game has enough plies (not a quick abort/draw)
 * - Game finished with a valid status (not aborted/cheat)
 *
 * @param variant - The game variant (e.g., "standard")
 * @param clocks - Array of clock times, length indicates number of plies
 * @param status - The game completion status
 * @returns true if game structure is valid
 */
export function isValidGameStructure(
	variant: LichessGameAPIResponse["variant"],
	clocks: LichessGameAPIResponse["clocks"],
	status: LichessGameAPIResponse["status"],
): boolean {
	// Exclude chess variants like chess960, crazyhouse etc
	if (String(variant).toLowerCase() !== "standard") {
		return false;
	}

	// 2. Move count is above a certain threshold, or there are no moves
	if (!clocks || clocks.length < MIN_NUM_PLY) {
		return false;
	}

	// 3. Exclude weird endings like cheat detected or server error
	if (!VALID_GAME_ENDING_STATUSES.has(status)) {
		return false;
	}

	return true;
}
