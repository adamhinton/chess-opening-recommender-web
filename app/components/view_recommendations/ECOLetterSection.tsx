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
import ToolTip from "../ToolTips/ToolTip";

// ============================================================================
// Types
// ============================================================================

export type ECOLetter = "A" | "B" | "C" | "D" | "E";

/** Description of what each ECO letter category covers - with friendly explanations */
const ECO_DETAILS: Record<ECOLetter, { title: string; description: string }> = {
	A: {
		title: "Flank Openings",
		description:
			"Unconventional first moves (excluding 1.e4 and 1.d4) that allow you to control the center from the sides. Ideal for players who like flexibility and surprise.",
	},
	B: {
		title: "Semi-Open Games",
		description:
			"Responses to White's 1.e4 other than 1...e5. These lead to unbalanced, fighting positions (e.g. Sicilian, French) where both sides have chances to win.",
	},
	C: {
		title: "Open Games",
		description:
			"Classic games starting with 1.e4 e5. These often lead to sharp tactical battles and rapid piece development. Good for learning fundamentals.",
	},
	D: {
		title: "Closed Games",
		description:
			"Games starting with 1.d4 d5. These tend to be more strategic and positional, focusing on long-term maneuvering rather than immediate tactics.",
	},
	E: {
		title: "Indian Defenses",
		description:
			"Modern responses to 1.d4 (usu. 1...Nf6). Black allows White to take the center to counter-attack it later. Complex and dynamic.",
	},
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
	/** Whether to show rank numbers on individual openings */
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
	const details = ECO_DETAILS[letter];

	return (
		<div className="rounded-xl border border-border bg-card/50 overflow-hidden transition-all duration-200 hover:border-border/80">
			{/* Letter header */}
			<div
				className="flex items-center gap-3 w-full p-4 
					cursor-pointer hover:bg-muted/30 transition-colors"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<button
					type="button"
					className={`p-1 rounded-md text-muted-foreground hover:bg-muted/50 transition-colors duration-200
						${isExpanded ? "rotate-90" : ""}`}
				>
					<ChevronRight className="w-5 h-5" />
				</button>

				{/* Letter badge */}
				<span
					className={`flex-shrink-0 w-12 h-12 flex items-center justify-center
						rounded-lg border text-xl font-bold ${colorClasses}`}
				>
					{letter}
				</span>

				{/* Description and count */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-foreground text-lg">
							{details.title}
						</span>
						{/* Info Tooltip Icon */}
						<div onClick={(e) => e.stopPropagation()}>
							<ToolTip message={details.description} />
						</div>
					</div>
					<div className="text-sm text-muted-foreground">
						{openings.length} opening{openings.length !== 1 ? "s" : ""}
					</div>
				</div>
			</div>

			{/* Openings list */}
			{isExpanded && (
				<div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
					<div className="ml-[3.75rem] space-y-2 border-l-2 border-border/50 pl-4 py-1">
						{openings.map((opening, idx) => (
							<SingleRecommendation
								key={opening.opening_name}
								openingName={opening.opening_name}
								eco={opening.eco}
								rank={showRanks ? idx + 1 : undefined}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default ECOLetterSection;
