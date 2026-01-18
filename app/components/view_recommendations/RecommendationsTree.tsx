// =========================================
// Recommendations Tree Container
//
// The main container that organizes model-generated opening recommendations into
// a hierarchical tree structure: Letter (A-E) >> Number (00-99) >> Opening
//
// Only displays letters/numbers that have recommendations.
// =========================================

"use client";

import { useMemo } from "react";
import ECOLetterSection, { ECOLetter } from "./ECOLetterSection";
import { SingleOpeningRecommendation } from "../../utils/types/stats";

// ============================================================================
// Types
// ============================================================================

interface RecommendationsTreeProps {
	recommendations: SingleOpeningRecommendation[];
	/** Whether to show rank numbers on individual openings; always off right now; there's a TODO to revisit this */
	showRanks?: boolean;
}

// ============================================================================
// Helper Types and Functions
// ============================================================================

/**
 * Parsed ECO code structure
 */
interface ParsedECO {
	letter: ECOLetter;
	number: string; // Keep as string to preserve leading zeros
	// TODO need to make all ECONumbers strings
}

/**
 * Parse an ECO code into its letter and number components
 * @example "B90" -> { letter: "B", number: "90" }
 * @example "A00" -> { letter: "A", number: "00" }
 */
function parseECO(eco: string): ParsedECO | null {
	if (!eco || eco.length < 2) return null;

	const letter = eco.charAt(0).toUpperCase();
	const number = eco.slice(1).padStart(2, "0"); // Ensure 2 digits

	// Validate letter is A-E
	if (!["A", "B", "C", "D", "E"].includes(letter)) {
		console.warn(`Invalid ECO letter: ${letter} in ${eco}`);
		return null;
	}

	// Validate number is numeric
	if (!/^\d+$/.test(number)) {
		console.warn(`Invalid ECO number: ${number} in ${eco}`);
		return null;
	}

	return {
		letter: letter as ECOLetter,
		number: number.slice(0, 2), // Only keep first 2 digits
	};
}

/**
 * Organize recommendations into a nested structure:
 * Letter -> Number -> Openings[]
 */
function organizeByECO(
	recommendations: SingleOpeningRecommendation[]
): Map<ECOLetter, Map<string, SingleOpeningRecommendation[]>> {
	const result = new Map<
		ECOLetter,
		Map<string, SingleOpeningRecommendation[]>
	>();

	for (const rec of recommendations) {
		const parsed = parseECO(rec.eco);
		if (!parsed) continue;

		// Initialize letter map if needed
		if (!result.has(parsed.letter)) {
			result.set(parsed.letter, new Map());
		}

		const letterMap = result.get(parsed.letter)!;

		// Initialize number array if needed
		if (!letterMap.has(parsed.number)) {
			letterMap.set(parsed.number, []);
		}

		letterMap.get(parsed.number)!.push(rec);
	}

	return result;
}

// ============================================================================
// Component
// ============================================================================

const RecommendationsTree = ({
	recommendations,
	showRanks = false,
}: RecommendationsTreeProps) => {
	// Organize recommendations into the tree structure
	// TODO not sure I needed to memoize here
	const organizedData = useMemo(
		() => organizeByECO(recommendations),
		[recommendations]
	);

	// Get letters that have recommendations, sorted A-E
	const lettersWithData = useMemo(() => {
		const letters: ECOLetter[] = ["A", "B", "C", "D", "E"];
		return letters.filter((letter) => organizedData.has(letter));
	}, [organizedData]);

	if (recommendations.length === 0) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<p>No recommendations to display.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Summary */}
			<div className="flex items-center justify-between text-sm text-muted-foreground px-1">
				<span>
					{recommendations.length} opening
					{recommendations.length !== 1 ? "s" : ""} across{" "}
					{lettersWithData.length} ECO categor
					{lettersWithData.length !== 1 ? "ies" : "y"}
				</span>
			</div>

			{/* Tree sections */}
			<div className="space-y-3">
				{lettersWithData.map((letter) => (
					<ECOLetterSection
						key={letter}
						letter={letter}
						numberGroups={organizedData.get(letter)!}
						showRanks={showRanks}
						defaultExpanded={true} // TODO revisit default expanded behavior
					/>
				))}
			</div>
		</div>
	);
};

export default RecommendationsTree;
