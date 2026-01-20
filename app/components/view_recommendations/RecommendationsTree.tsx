// =========================================
// Recommendations Tree Container
//
// The main container that organizes model-generated opening recommendations into
// a hierarchical tree structure: Letter (A-E) >> Opening
//
// Only displays letters that have recommendations.
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
}

/**
 * Parse an ECO code to extract its letter component
 * @example "B90" -> { letter: "B" }
 * @example "A00" -> { letter: "A" }
 */
function parseECO(eco: string): ParsedECO | null {
	if (!eco || eco.length < 2) return null;

	const letter = eco.charAt(0).toUpperCase();

	const validateEcoLetter = (l: string): l is ECOLetter => {
		return ["A", "B", "C", "D", "E"].includes(l);
	};

	// It has some letter that's not A-E
	// This should never happen
	if (!validateEcoLetter(letter)) return null;

	return { letter };
}

/**
 * Organize recommendations by ECO letter
 * Letter -> Openings[]
 */
function organizeByECO(
	recommendations: SingleOpeningRecommendation[],
): Map<ECOLetter, SingleOpeningRecommendation[]> {
	const result = new Map<ECOLetter, SingleOpeningRecommendation[]>();

	for (const rec of recommendations) {
		const parsed = parseECO(rec.eco);
		if (!parsed) continue;

		// Initialize letter array if needed
		if (!result.has(parsed.letter)) {
			result.set(parsed.letter, []);
		}

		result.get(parsed.letter)!.push(rec);
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
		[recommendations],
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
						openings={organizedData.get(letter)!}
						key={letter}
						letter={letter}
						showRanks={showRanks}
						defaultExpanded={false} // TODO revisit default expanded behavior
					/>
				))}
			</div>
		</div>
	);
};

export default RecommendationsTree;
