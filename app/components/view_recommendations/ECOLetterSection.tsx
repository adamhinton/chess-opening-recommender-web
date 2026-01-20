// =========================================
// ECO Letter Section Component
//
// Collapsible section for a single ECO letter (A, B, C, D, or E).
// Displays all openings within this letter category.
//
// Only displays if there are openings in this letter category.
//
// TODO default collapse behavior is weird; work on that
// =========================================

"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import SingleRecommendation from "./SingleRecommendation";
import { SingleOpeningRecommendation } from "../../utils/types/stats";

// ============================================================================
// Types
// ============================================================================

export type ECOLetter = "A" | "B" | "C" | "D" | "E";

/** Description of what each ECO letter category covers */
const ECO_LETTER_DESCRIPTIONS: Record<ECOLetter, string> = {
	A: "Flank Openings",
	B: "Semi-Open Games",
	C: "Open Games",
	D: "Closed Games",
	E: "Indian Defenses",
};

/** Colors for each ECO letter (for visual distinction) */
const ECO_LETTER_COLORS: Record<ECOLetter, string> = {
	A: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
	B: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
	C: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
	D: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
	E: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

interface ECOLetterSectionProps {
	letter: ECOLetter;
	/** All openings in this letter category */
	openings: SingleOpeningRecommendation[];
	/** Whether to show rank numbers on individual openings - may add this feature later (TODO?) */
	showRanks?: boolean;
	defaultExpanded?: boolean;
}

// ============================================================================
// Component
// ============================================================================

const ECOLetterSection = ({
	letter,
	openings,
	showRanks = false,
	defaultExpanded = true,
}: ECOLetterSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	const colorClasses = ECO_LETTER_COLORS[letter];
	const description = ECO_LETTER_DESCRIPTIONS[letter];

	return (
		<div className="rounded-xl border border-border bg-card/30 overflow-hidden">
			{/* Letter header */}
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center gap-3 w-full p-4 
					hover:bg-accent/30 transition-colors text-left"
			>
				<ChevronRight
					className={`w-5 h-5 text-muted-foreground transition-transform duration-200
						${isExpanded ? "rotate-90" : ""}`}
				/>

				{/* Letter badge */}
				<span
					className={`flex-shrink-0 w-10 h-10 flex items-center justify-center
						rounded-lg border text-xl font-bold ${colorClasses}`}
				>
					{letter}
				</span>

				{/* Description and count */}
				<div className="flex-1 min-w-0">
					<div className="font-semibold text-foreground">{description}</div>
					<div className="text-xs text-muted-foreground">
						{openings.length} opening{openings.length !== 1 ? "s" : ""}
					</div>
				</div>
			</button>

			{/* Openings list */}
			{isExpanded && (
				<div className="px-4 pb-4 space-y-2">
					{openings.map((opening, idx) => (
						<SingleRecommendation
							key={opening.opening_name}
							openingName={opening.opening_name}
							eco={opening.eco}
							rank={showRanks ? idx + 1 : undefined}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default ECOLetterSection;
