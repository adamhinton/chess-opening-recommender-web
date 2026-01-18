// =========================================
// Empty State Component
//
// Shown when there are no saved recommendations.
// Provides a friendly message and CTA to go analyze games.
// =========================================

"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

// ============================================================================
// Component
// ============================================================================

const EmptyState = () => {
	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="text-center max-w-md mx-auto px-4">
				{/* Icon */}
				<div
					className="w-20 h-20 mx-auto mb-6 rounded-full 
					bg-primary/10 flex items-center justify-center"
				>
					<Sparkles className="w-10 h-10 text-primary" />
				</div>

				{/* Message */}
				<h2 className="text-2xl font-bold text-foreground mb-3">
					No Recommendations Yet
				</h2>
				<p className="text-muted-foreground mb-8">
					Analyze your Lichess games to get personalized opening recommendations
					based on your playing style and performance.
				</p>

				{/* CTA */}
				<Link
					href="/recommend"
					className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
						bg-primary text-primary-foreground font-medium
						hover:bg-primary/90 transition-colors"
				>
					<span>Get Your Recommendations</span>
					<ArrowRight className="w-4 h-4" />
				</Link>
			</div>
		</div>
	);
};

export default EmptyState;
