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
import {
	RecommendationsLocalStorageUtils,
	StoredRecommendationData,
} from "../utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import { type Color } from "../utils/types/stats";

import RecommendationHeader from "../components/view_recommendations/RecommendationHeader";
import RecommendationsTree from "../components/view_recommendations/RecommendationsTree";
import StoredRecommendationsSelector from "../components/view_recommendations/StoredRecommendationsSelector";
import EmptyState from "../components/view_recommendations/EmptyState";
import { StoredPlayerData } from "../utils/rawOpeningStats/localStorage/statsLocalStorage";
import { Button } from "@/components/ui/button";

const ViewRecommendationsPage = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [storedRecommendations, setStoredRecommendations] = useState<
		StoredRecommendationData[]
	>([]);
	const [selectedRecommendation, setSelectedRecommendation] =
		useState<StoredRecommendationData | null>(null);

	// Extracted so it can be called on mount AND after demo data is seeded
	const loadRecommendations = useCallback(() => {
		const allRecommendations =
			RecommendationsLocalStorageUtils.getAllStoredRecommendations();
		setStoredRecommendations(allRecommendations);

		if (allRecommendations.length === 0) {
			setIsLoading(false);
			return;
		}

		// If there's only one stored recommendation, display it immediately
		if (allRecommendations.length === 1) {
			setSelectedRecommendation(allRecommendations[0]);
		} else {
			// Multiple sets - check for recent one
			const mostRecent =
				RecommendationsLocalStorageUtils.getMostRecentRecommendation();
			if (mostRecent) {
				// User has come here immediately after getting a recommendation set -
				// 	display that new one by default
				setSelectedRecommendation(mostRecent);
			}
			// Otherwise, user will pick from the selector
		}

		setIsLoading(false);
	}, []);

	// Load recommendations on mount
	useEffect(() => {
		loadRecommendations();
	}, [loadRecommendations]);

	const handleSelect = useCallback((rec: StoredRecommendationData) => {
		setSelectedRecommendation(rec);
	}, []);

	const handleDelete = useCallback(
		(
			username: StoredPlayerData["playerData"]["lichessUsername"],
			color: Color,
		) => {
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
		return (
			<main className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div
						className="w-8 h-8 border-2 border-primary border-t-transparent 
						rounded-full animate-spin mx-auto mb-4"
					/>
					<p className="text-muted-foreground">Loading recommendations...</p>
				</div>
			</main>
		);
	}

	// None saved
	if (storedRecommendations.length === 0) {
		return (
			<main className="min-h-screen bg-background">
				<EmptyState onDemoLoad={loadRecommendations} />
			</main>
		);
	}

	// Now we know user has at least one recommendation
	return (
		<main className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
				{/* Selector for multiple recommendation sets */}
				{storedRecommendations.length > 1 && (
					<StoredRecommendationsSelector
						storedRecommendations={storedRecommendations}
						selectedRecommendation={selectedRecommendation}
						onSelect={handleSelect}
						onDelete={handleDelete}
					/>
				)}

				{/* Main content - show when a recommendation is selected */}
				{selectedRecommendation ? (
					<>
						{/* Header with user info and navigation */}
						<RecommendationHeader recommendation={selectedRecommendation} />

						{/* The recommendation tree */}
						<RecommendationsTree
							recommendations={
								selectedRecommendation.recommendations.recommendations
							}
							showRanks={false}
						/>
					</>
				) : (
					// No selection yet - prompt to select
					<p className="text-center py-12 text-muted-foreground">
						Select a recommendation set above to view.
					</p>
				)}

				{/* Single recommendation - show delete option */}
				{storedRecommendations.length === 1 && selectedRecommendation && (
					<footer className="pt-4 border-t border-border">
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								handleDelete(
									selectedRecommendation.username,
									selectedRecommendation.color,
								)
							}
							className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
						>
							Delete this recommendation set
						</Button>
					</footer>
				)}
			</div>
		</main>
	);
};

export default ViewRecommendationsPage;
