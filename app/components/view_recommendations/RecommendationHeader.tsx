// =========================================
// Recommendation Header Component
//
// Displays the header section for viewing a recommendation set.
// Shows username, color, opening count, and navigation buttons.
// =========================================

"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import {
	RecommendationsLocalStorageUtils,
	StoredRecommendationData,
} from "@/app/utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import { Subtext } from "@/app/components/HeroPage/Subtext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
				<Button variant="outline" asChild className="gap-2">
					<Link href="/recommend">
						<RotateCcw className="w-4 h-4" />
						Analyze Another
					</Link>
				</Button>
			</div>

			{/* Hero / Header content — hero-queen-watermark applies the faded queen background from globals.css */}
			<div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card via-card/50 to-background shadow-sm">
				<div className="relative p-8 flex flex-col gap-6">
					{/* Status Badge */}
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
						<Badge className="gap-2 border-accent-gold text-accent-gold bg-accent-gold/10 hover:bg-accent-gold/10">
							<CheckCircle2 className="w-3.5 h-3.5" />
							AI Analysis Complete
						</Badge>
					</div>

					<div className="space-y-4 max-w-2xl">
						<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
							Personalized Recommendations for{" "}
							<span className="text-accent-gold">{username}</span>
						</h1>

						<Subtext size="lg" className="text-muted-foreground/90">
							Our model has analyzed {username}&apos;s games and identified{" "}
							{openingCount} openings where their playstyle indicates a high
							probability of success. These are optimized for their {color}{" "}
							repertoire.
						</Subtext>
					</div>

					{/* Metadata Badges — using queen chip convention for piece color (theme-independent zinc) */}
					<div className="flex flex-wrap gap-3 mt-2">
						{/* Piece color badge: queen chip + label */}
						<Badge
							variant="outline"
							className={`gap-2 px-3 py-1.5 text-sm font-medium ${
								color === "white"
									? "border-accent-gold text-accent-gold"
									: "border-border text-foreground"
							}`}
						>
							{color === "white" ? (
								<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-900 text-zinc-50 text-[10px] leading-none shrink-0">
									♕
								</span>
							) : (
								<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-100 border border-zinc-400 text-zinc-900 text-[10px] leading-none shrink-0">
									♛
								</span>
							)}
							Playing as {color}
						</Badge>

						<Badge
							variant="secondary"
							className="gap-2 px-3 py-1.5 text-sm font-medium"
						>
							{openingCount} recommended openings
						</Badge>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecommendationHeader;
