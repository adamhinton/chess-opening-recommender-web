// _________________________
// Offers to show a demo with dummy recommendations

// Great for e.g. recruiters who want to check out my projects but don't play chess.
// _________________________

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateDummyRecommendations } from "../../utils/recommendations/dummyRecommendations";
import { RecommendationsLocalStorageUtils } from "../../utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import { Color } from "../../utils/types/stats";
import { Button } from "@/components/ui/button";

type SeeExampleSectionProps = {
	isDisabled: boolean;
};

/**
 * Compact banner for users who don't have a Lichess account.
 * Sits above the form — obvious enough to catch the eye, slim enough not to dominate.
 * Perfect for recruiters or anyone who wants to see how the app works without signing up.
 */
const SeeExampleSection = ({ isDisabled }: SeeExampleSectionProps) => {
	const router = useRouter();
	// Brief pending state so the navigation feels intentional rather than jarring
	const [isPending, setIsPending] = useState(false);

	/**
	 * Handle demo button click
	 *
	 * Generate dummy recommendations and show them to the user
	 *
	 * Great for e.g. recruiters who don't care about chess and just want to see how this works
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
			console.log(
				`[Demo] Saved dummy recommendations for ${dummyUsername} (${dummyColor})`,
			);
			// Small delay so the button's loading state is visible before navigation
			setTimeout(() => router.push("/view-recommendations"), 400);
		} else {
			console.error(`[Demo] Failed to save: ${saveResult.error}`);
			setIsPending(false);
		}
	};

	return (
		<div className="flex items-center gap-3 rounded-lg border border-amber-400/60 bg-amber-50 dark:bg-amber-950/25 dark:border-amber-600/40 px-4 py-2.5">
			{/* Lightbulb icon */}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400"
				aria-hidden="true"
			>
				<path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.044a1 1 0 001 1h2a1 1 0 001-1v-.044c0-1.013.763-1.957 1.815-2.825A6 6 0 0010 1zM9.5 16.5v.5a.5.5 0 001 0v-.5h-1z" />
			</svg>

			{/* Responsive: short label on mobile, fuller copy on wider screens */}
			<p className="flex-1 text-sm text-amber-900 dark:text-amber-200">
				<span className="sm:hidden">No Lichess account?</span>
				<span className="hidden sm:inline">
					No Lichess account? <span className="font-medium">Skip the form</span>{" "}
					and see a live demo.
				</span>
			</p>

			<Button
				variant="outline"
				size="sm"
				className="shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/40 transition-all"
				onClick={handleViewDemo}
				disabled={isDisabled || isPending}
				aria-busy={isPending}
			>
				{isPending ? (
					<>
						<svg
							className="animate-spin h-3.5 w-3.5 mr-1"
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
					<>
						Try Demo
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="w-3.5 h-3.5"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
								clipRule="evenodd"
							/>
						</svg>
					</>
				)}
			</Button>
		</div>
	);
};

export default SeeExampleSection;
