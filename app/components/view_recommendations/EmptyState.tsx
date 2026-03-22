// =========================================
// Empty State Component
//
// Shown when there are no saved recommendations.
// Provides a friendly message and CTA to go analyze games.
// Also offers a demo button that seeds dummy recommendations in-place.
// =========================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueenLogo } from "@/app/components/logos/QueenLogo";
import { generateDummyRecommendations } from "../../utils/recommendations/dummyRecommendations";
import { RecommendationsLocalStorageUtils } from "../../utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import { Color } from "../../utils/types/stats";

// ============================================================================
// Types
// ============================================================================

interface EmptyStateProps {
	/** Called after demo data is seeded so the parent page can re-read localStorage and update state */
	onDemoLoad?: () => void;
}

// ============================================================================
// Component
// ============================================================================

const EmptyState = ({ onDemoLoad }: EmptyStateProps) => {
	const [isPending, setIsPending] = useState(false);

	/**
	 * Seed dummy recommendations into localStorage, then call onDemoLoad
	 * so the parent page re-reads state without a full navigation.
	 * This is good for recruiters who don't play chess and just want to see how the app works.
	 */
	const handleViewDemo = () => {
		if (isPending) return;
		setIsPending(true);

		const dummyUsername = "example-player";
		const dummyColor: Color = "white";
		const dummyRecommendations = generateDummyRecommendations(50, dummyColor);

		const saveResult = RecommendationsLocalStorageUtils.saveRecommendations(
			dummyUsername,
			dummyColor,
			dummyRecommendations,
		);

		if (saveResult.success) {
			// Small delay so the loading state is visible before the page transitions
			setTimeout(() => onDemoLoad?.(), 400);
		} else {
			console.error(`[Demo] Failed to save: ${saveResult.error}`);
			setIsPending(false);
		}
	};

	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="text-center max-w-md mx-auto px-4">
				{/* Icon */}
				<QueenLogo size="lg" className="mx-auto mb-6" />

				{/* Message */}
				<h2 className="text-2xl font-bold text-foreground mb-3">
					No Recommendations Yet
				</h2>
				<p className="text-muted-foreground mb-8">
					Analyze your Lichess games to get personalized opening recommendations
					based on your playing style and performance.
				</p>

				{/* CTAs */}
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button variant="default" asChild>
						<Link href="/recommend">
							<span>Get Your Recommendations</span>
							<ArrowRight className="w-4 h-4" />
						</Link>
					</Button>
					<Button
						variant="outline"
						onClick={handleViewDemo}
						disabled={isPending}
						aria-busy={isPending}
						className="cursor-pointer transition-all duration-150"
					>
						{isPending ? (
							<>
								<svg
									className="animate-spin h-4 w-4 mr-2"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									/>
								</svg>
								Loading...
							</>
						) : (
							"View Demo"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default EmptyState;
