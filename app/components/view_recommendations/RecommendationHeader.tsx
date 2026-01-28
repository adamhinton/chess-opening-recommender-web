// =========================================
// Recommendation Header Component
//
// Displays the header section for viewing a recommendation set.
// Shows username, color, opening count, and navigation buttons.
// =========================================

"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, CheckCircle2, Sparkles } from "lucide-react";
import {
	RecommendationsLocalStorageUtils,
	StoredRecommendationData,
} from "@/app/utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import { Subtext } from "@/app/components/HeroPage/Subtext";

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
		<div className="space-y-6">
			{/* Navigation */}
			<div className="flex items-center justify-between">
				{/* Only show this link if there are other recommendations */}
				{RecommendationsLocalStorageUtils.getStoredCount() > 1 && (
					<Link
						href="/view-recommendations"
						className="flex items-center gap-2 text-sm text-muted-foreground 
						hover:text-foreground transition-colors group"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						<span>My other recommendations</span>
					</Link>
				)}

				<Link
					href="/recommend"
					className="flex items-center gap-2 px-4 py-2 rounded-lg
						bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium
						transition-colors"
				>
					<RotateCcw className="w-4 h-4" />
					<span>Analyze Another</span>
				</Link>
			</div>

			{/* Hero / Header content */}
			<div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card/50 to-background shadow-sm">
				{/* Background decorative elements */}
				<div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
					<Sparkles className="w-48 h-48 text-primary" />
				</div>

				<div className="relative p-8 flex flex-col gap-6">
					{/* Status Badge */}
					<div className="flex items-center gap-2 text-primary font-medium text-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
						<div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
							<CheckCircle2 className="w-4 h-4" />
						</div>
						<span>AI Analysis Complete</span>
					</div>

					<div className="space-y-4 max-w-2xl">
						<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
							Personalized Recommendations for{" "}
							<span className="text-primary">{username}</span>
						</h1>

						<Subtext size="lg" className="text-muted-foreground/90">
							Our model has analyzed {username}&apos;s games and identified{" "}
							{openingCount} openings where this their playstyle indicates a
							high probability of success. These are optimized for their {color}{" "}
							repertoire.
						</Subtext>
					</div>

					{/* Metadata Badges */}
					<div className="flex flex-wrap gap-3 mt-2">
						<span
							className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border
								${
									color === "white"
										? "bg-amber-100/50 text-amber-900 border-amber-200 dark:bg-amber-900/20 dark:text-amber-100 dark:border-amber-800"
										: "bg-slate-200/50 text-slate-900 border-slate-300 dark:bg-slate-800/50 dark:text-slate-100 dark:border-slate-700"
								}`}
						>
							<span className="text-lg leading-none pb-0.5">
								{color === "white" ? "♔" : "♚"}
							</span>
							Playing as {color}
						</span>

						<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
							<Sparkles className="w-3.5 h-3.5" />
							{openingCount} recommended openings
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecommendationHeader;
