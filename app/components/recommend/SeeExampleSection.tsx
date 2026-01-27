"use client";

import { useRouter } from "next/navigation";
import { generateDummyRecommendations } from "../../utils/recommendations/dummyRecommendations";
import { RecommendationsLocalStorageUtils } from "../../utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import { Color } from "../../utils/types/stats";

type SeeExampleSectionProps = {
	isDisabled: boolean;
};

/**
 * Section that allows users to see a demo with example recommendations.
 * Perfect for recruiters or anyone who wants to see how the app works without having a Lichess account.
 */
const SeeExampleSection = ({ isDisabled }: SeeExampleSectionProps) => {
	const router = useRouter();

	/**
	 * Handle demo button click
	 *
	 * Generate dummy recommendations and show them to the user
	 *
	 * Great for e.g. recruiters who don't care about chess and just want to see how this works
	 */
	const handleViewDemo = () => {
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
			// Redirect to view-recommendations page
			router.push("/view-recommendations");
		} else {
			console.error(`[Demo] Failed to save: ${saveResult.error}`);
		}
	};

	return (
		<section className="mb-6 bg-secondary/30 border border-secondary rounded-lg p-4">
			<h2 className="text-lg font-semibold text-foreground mb-2">
				See Example First
			</h2>
			<p className="text-sm text-muted-foreground mb-3">
				Perfect if you don&apos;t play chess—no signup needed. See what
				AI-generated opening recommendations look like.
			</p>
			<button
				onClick={handleViewDemo}
				disabled={isDisabled}
				className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2"
			>
				Try Example
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					className="w-4 h-4"
				>
					<path
						fillRule="evenodd"
						d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
						clipRule="evenodd"
					/>
				</svg>
			</button>
		</section>
	);
};

export default SeeExampleSection;
