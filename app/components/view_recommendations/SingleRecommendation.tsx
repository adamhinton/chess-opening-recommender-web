// =========================================
// Single Recommendation Component
//
// Displays one chess opening recommendation as a clickable item
// that links to the Lichess opening explorer.
//
// Minimal and elegant - shows opening name with external link icon.
// Leaves room for optional ranking display if needed later.
// =========================================

"use client";

import { generateLichessOpeningUrl } from "../../utils/lichessOpeningUrlGenerator";
import { ExternalLink } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface SingleRecommendationProps {
	/** e.g., "Sicilian Defense: Najdorf Variation" */
	openingName: string;
	eco: string;
	/** Optional rank number to display (1-indexed) */
	rank?: number;
}

// ============================================================================
// Component
// ============================================================================

const SingleRecommendation = ({
	openingName,
	eco,
	rank,
}: SingleRecommendationProps) => {
	// Overview of this opening
	const lichessUrl = generateLichessOpeningUrl(openingName);

	return (
		<a
			href={lichessUrl.toString()}
			target="_blank"
			rel="noopener noreferrer"
			className="group flex items-center gap-3 px-4 py-2.5 rounded-lg
				bg-gradient-to-r from-card to-card/80
				border border-border/50
				hover:border-primary/30 hover:from-primary/5 hover:to-transparent
				transition-all duration-200 ease-out"
		>
			{/* Optional rank badge */}
			{rank !== undefined && (
				<span
					className="flex-shrink-0 w-7 h-7 flex items-center justify-center
					rounded-full bg-primary/10 text-primary text-xs font-semibold"
				>
					{rank}
				</span>
			)}

			{/* Opening name */}
			<span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
				{openingName}
			</span>

			{/* ECO code badge */}
			<span
				className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-mono
				bg-muted text-muted-foreground"
			>
				{eco}
			</span>

			{/* External link icon */}
			<ExternalLink
				className="flex-shrink-0 w-4 h-4 text-muted-foreground 
				group-hover:text-primary transition-colors"
			/>
		</a>
	);
};

export default SingleRecommendation;
