// =========================================
// ECO Number Section Component
//
// Collapsible section for openings under a specific ECO number
// (e.g., all A00 openings, all B90 openings).
//
// Contains SingleRecommendation items.
// Only displays if there are openings in this ECO number.
// =========================================

"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import SingleRecommendation from "./SingleRecommendation";
import { SingleOpeningRecommendation } from "../../utils/types/stats";

// ============================================================================
// Types
// ============================================================================

interface ECONumberSectionProps {
	/** e.g., "A00", "B90" */
	fullEcoPrefix: string;
	/** Openings under this ECO number */
	openings: SingleOpeningRecommendation[];
	/** Whether to show where it ranked by expected score; always false right now; TODO revisit */
	showRanks?: boolean;
	/** Starting rank offset (for continuous numbering across sections) */
	rankOffset?: number;
	/** Whether this section starts expanded */
	defaultExpanded?: boolean;
}

// ============================================================================
// Component
// ============================================================================

const ECONumberSection = ({
	fullEcoPrefix,
	openings,
	showRanks = false,
	rankOffset = 0,
	defaultExpanded = true,
}: ECONumberSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	return (
		<div className="ml-4">
			{/* Number header */}
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center gap-2 py-2 px-2 -ml-2 rounded-md
					hover:bg-accent/50 transition-colors w-full text-left"
			>
				<ChevronRight
					className={`w-4 h-4 text-muted-foreground transition-transform duration-200
						${isExpanded ? "rotate-90" : ""}`}
				/>
				<span className="font-mono text-sm font-semibold text-foreground/80">
					{fullEcoPrefix}
				</span>
				<span className="text-xs text-muted-foreground">
					({openings.length} opening{openings.length !== 1 ? "s" : ""})
				</span>
			</button>

			{/* Openings list */}
			{isExpanded && (
				<div className="ml-6 mt-1 space-y-1.5 pb-2">
					{openings.map((opening, idx) => (
						<SingleRecommendation
							key={opening.opening_name}
							openingName={opening.opening_name}
							eco={opening.eco}
							rank={showRanks ? rankOffset + idx + 1 : undefined}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default ECONumberSection;
