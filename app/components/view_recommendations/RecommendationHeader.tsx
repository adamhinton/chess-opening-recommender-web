// =========================================
// Recommendation Header Component
//
// Displays the header section for viewing a recommendation set.
// Shows username, color, opening count, and navigation buttons.
// =========================================

"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { StoredRecommendationData } from "@/app/utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";

// ============================================================================
// Types
// ============================================================================

interface RecommendationHeaderProps {
	recommendation: StoredRecommendationData;
}

// ============================================================================
// Component
// ============================================================================

const RecommendationHeader = ({
	recommendation,
}: RecommendationHeaderProps) => {
	const { username, color, recommendations } = recommendation;
	const openingCount = recommendations.recommendations.length;

	return (
		<div className="space-y-4">
			{/* Navigation */}
			<div className="flex items-center justify-between">
				<Link
					href="/recommend"
					className="flex items-center gap-2 text-sm text-muted-foreground 
						hover:text-foreground transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					<span>Back to Analyzer</span>
				</Link>

				<Link
					href="/recommend"
					className="flex items-center gap-2 px-4 py-2 rounded-lg
						bg-primary text-primary-foreground text-sm font-medium
						hover:bg-primary/90 transition-colors"
				>
					<RotateCcw className="w-4 h-4" />
					<span>Analyze Another</span>
				</Link>
			</div>

			{/* Header content */}
			<div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					{/* User info */}
					<div>
						<h1 className="text-2xl font-bold text-foreground">
							Recommendations for{" "}
							<span className="text-primary">{username}</span>
						</h1>
						<div className="flex items-center gap-3 mt-2">
							<span
								className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
									${
										color === "white"
											? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
											: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
									}`}
							>
								{color === "white" ? "♔ " : "♚ "}
								Playing as {color}
							</span>
							<span className="text-sm text-muted-foreground">
								{openingCount} opening{openingCount !== 1 ? "s" : ""}{" "}
								recommended
							</span>
						</div>
					</div>

					{/* Stats summary (optional, can expand later) */}
					<div className="flex gap-4 text-center">
						<div className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/10">
							<div className="text-2xl font-bold text-primary">
								{openingCount}
							</div>
							<div className="text-xs text-muted-foreground">Openings</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecommendationHeader;
