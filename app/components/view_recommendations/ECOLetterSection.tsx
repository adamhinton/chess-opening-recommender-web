// =========================================
// ECO Letter Section Component
//
// Collapsible section for a single ECO letter (A, B, C, D, or E).
// Displays all openings within this letter category.
//
// Only displays if there are openings in this letter category.
// =========================================

"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import SingleRecommendation from "./SingleRecommendation";
import {
	SingleOpeningRecommendation,
	ECOLetter,
} from "../../utils/types/stats";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ============================================================================
// Types
// ============================================================================

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
} as const;

/** Left border color for the openings list — matched to each ECO letter's theme */
const ECO_BORDER_COLORS: Record<ECOLetter, string> = {
	A: "border-l-emerald-500/40",
	B: "border-l-blue-500/40",
	C: "border-l-amber-500/40",
	D: "border-l-purple-500/40",
	E: "border-l-rose-500/40",
} as const;

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
	const borderColorClass = ECO_BORDER_COLORS[letter];
	const details = ECO_DETAILS[letter];

	return (
		<Collapsible
			open={isExpanded}
			onOpenChange={setIsExpanded}
			className="rounded-xl border border-border bg-card/50 overflow-hidden transition-all duration-200 hover:border-border/80"
		>
			{/* Letter header — trigger + info button as siblings in a flex row to avoid nested <button> */}
			<div className="flex items-center w-full hover:bg-muted/30 transition-colors">
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="flex items-center gap-3 flex-1 p-4 text-left"
					>
						<ChevronRight
							className={`w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
								isExpanded ? "rotate-90" : ""
							}`}
							aria-hidden="true"
						/>

						{/* Letter badge */}
						<span
							className={`shrink-0 w-12 h-12 flex items-center justify-center
					rounded-lg border text-xl font-bold ${colorClasses}`}
						>
							{letter}
						</span>

						{/* Title and count */}
						<div className="flex-1 min-w-0">
							<span className="font-semibold text-foreground text-lg">
								{details.title}
							</span>
							<Badge variant="secondary" className="text-xs block w-fit mt-0.5">
								{openings.length} opening{openings.length !== 1 ? "s" : ""}
							</Badge>
						</div>
					</button>
				</CollapsibleTrigger>

				{/* Info tooltip — sibling of the trigger button, not nested inside it */}
				<div className="pr-4 shrink-0">
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
								aria-label="More information"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="w-3 h-3"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</TooltipTrigger>
						<TooltipContent side="top" className="max-w-xs">
							{details.description}
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			{/* Openings list */}
			<CollapsibleContent className="animate-in slide-in-from-top-2 fade-in duration-200">
				<div className="px-4 pb-4">
					<div
						className={`ml-15 space-y-2 border-l-2 ${borderColorClass} pl-4 py-1`}
					>
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
			</CollapsibleContent>
		</Collapsible>
	);
};

export default ECOLetterSection;
