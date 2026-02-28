// =========================================
// View Recommendations Page
//
// Main page for viewing saved chess opening recommendations.
//
// Data Flow:
// 1. On load, check localStorage for saved recommendations
// 2. If none exist, redirect to /recommend
// 3. If one exists, display it automatically
// 4. If multiple exist, show selector (auto-display most recent if < 30s old)
//
// The page uses a tree structure to organize recommendations by ECO code:
// Letter (A-E) >> Number (00-99) >> Opening
// =========================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
	RecommendationsLocalStorageUtils,
	StoredRecommendationData,
} from "../utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import { Color } from "../utils/types/stats";

const ViewRecommendationsPage = () => {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [storedRecommendations, setStoredRecommendations] = useState<
		StoredRecommendationData[]
	>([]);
	const [selectedRecommendation, setSelectedRecommendation] =
		useState<StoredRecommendationData | null>(null);

	// Load recommendations on mount
	useEffect(() => {
		const loadRecommendations = () => {
			const allRecommendations =
				RecommendationsLocalStorageUtils.getAllStoredRecommendations();
			setStoredRecommendations(allRecommendations);

			if (allRecommendations.length === 0) {
				setIsLoading(false);
				return;
			}

			if (allRecommendations.length === 1) {
				// Only one set - auto-select it
				setSelectedRecommendation(allRecommendations[0]);
			} else {
				// Multiple sets - check for recent one
				const mostRecent =
					RecommendationsLocalStorageUtils.getMostRecentRecommendation();
				if (mostRecent) {
					// Recent recommendation exists - auto-select it
					setSelectedRecommendation(mostRecent);
				}
				// Otherwise, user will pick from the selector
			}

			setIsLoading(false);
		};

		loadRecommendations();
	}, [router]);

	const handleSelect = useCallback((rec: StoredRecommendationData) => {
		setSelectedRecommendation(rec);
	}, []);

	const handleDelete = useCallback(
		(username: string, color: Color) => {
			RecommendationsLocalStorageUtils.deleteRecommendations(username, color);

			// Refresh the list
			const updated =
				RecommendationsLocalStorageUtils.getAllStoredRecommendations();
			setStoredRecommendations(updated);

			// If deleted the selected one, clear selection or select another
			if (
				selectedRecommendation?.username === username &&
				selectedRecommendation?.color === color
			) {
				setSelectedRecommendation(updated.length > 0 ? updated[0] : null);
			}
		},
		[selectedRecommendation],
	);

	if (isLoading) {
		return <div>Placeholder view-recommendations: loading</div>;
	}

	// None saved
	if (storedRecommendations.length === 0) {
		return <div>Placeholder view-recommendations: none saved</div>;
	}

	return <div>Placeholder view-recommendations</div>;
};

export default ViewRecommendationsPage;
