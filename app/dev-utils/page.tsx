// // =========================================
// // Dev Utilities Page
// //
// // Development-only page to load dummy data for testing the UI.
// // Shouldn't be deployed to prod (TODO), but doesn't really matter if it is.
// // =========================================

// TODO get rid of this; just commented it out because I'm lazy

"use client";

import React from "react";

const DevUtilsPage = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-8">
			<p className="text-muted-foreground text-lg">
				Dev Utilities Page is currently disabled. How did you even find this?
			</p>
		</div>
	);
};

export default DevUtilsPage;

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
// 	generateDummyRecommendations,
// 	generateMultipleDummyRecommendationSets,
// } from "../utils/recommendations/dummyRecommendations";
// import { RecommendationsLocalStorageUtils } from "../utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";

// const DevUtilsPage = () => {
// 	if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
// 		return (
// 			<div className="min-h-screen flex items-center justify-center bg-background p-8">
// 				<p className="text-muted-foreground text-lg">
// 					This page is for deveopment testing only. How did you even find this?
// 				</p>
// 			</div>
// 		);
// 	}
// 	const router = useRouter();
// 	const [status, setStatus] = useState<string>("");

// 	const handleLoadSingleDummy = () => {
// 		const recommendations = generateDummyRecommendations(50, "white");
// 		const result = RecommendationsLocalStorageUtils.saveRecommendations(
// 			"testuser",
// 			"white",
// 			recommendations,
// 		);

// 		if (result.success) {
// 			setStatus(
// 				"✅ Loaded single dummy recommendation set for 'testuser' (white)",
// 			);
// 		} else {
// 			setStatus(`❌ Failed: ${result.error}`);
// 		}
// 	};

// 	const handleLoadMultipleDummy = () => {
// 		const sets = generateMultipleDummyRecommendationSets();

// 		for (const set of sets) {
// 			const result = RecommendationsLocalStorageUtils.saveRecommendations(
// 				set.username,
// 				set.color,
// 				set.recommendations,
// 			);
// 			if (!result.success) {
// 				setStatus(
// 					`❌ Failed to save ${set.username} (${set.color}): ${result.error}`,
// 				);
// 				return;
// 			}
// 		}

// 		setStatus(`✅ Loaded ${sets.length} dummy recommendation sets`);
// 	};

// 	const handleClearAll = () => {
// 		RecommendationsLocalStorageUtils.deleteAllStoredRecommendations();
// 		setStatus("🗑️ Cleared all recommendations from localStorage");
// 	};

// 	const handleGoToView = () => {
// 		router.push("/view-recommendations");
// 	};

// 	return (
// 		<div className="min-h-screen bg-background p-8">
// 			<div className="max-w-2xl mx-auto space-y-8">
// 				<div>
// 					<h1 className="text-2xl font-bold text-foreground mb-2">
// 						Dev Utilities
// 					</h1>
// 					<p className="text-muted-foreground text-sm">
// 						Development-only utilities for testing the recommendations display.
// 						<br />
// 						<strong className="text-destructive">
// 							Do not deploy this page to production.
// 						</strong>
// 					</p>
// 				</div>

// 				{/* Status message */}
// 				{status && (
// 					<div className="p-4 rounded-lg bg-secondary text-foreground">
// 						{status}
// 					</div>
// 				)}

// 				{/* Actions */}
// 				<div className="space-y-4">
// 					<h2 className="text-lg font-semibold text-foreground">
// 						Load Dummy Data
// 					</h2>

// 					<div className="grid gap-3">
// 						<button
// 							onClick={handleLoadSingleDummy}
// 							className="px-4 py-3 bg-primary text-primary-foreground rounded-lg
// 								hover:bg-primary/90 transition-colors text-left"
// 						>
// 							<div className="font-medium">Load Single Recommendation Set</div>
// 							<div className="text-sm opacity-80">
// 								Creates 50 recommendations for &quot;testuser&quot; (white)
// 							</div>
// 						</button>

// 						<button
// 							onClick={handleLoadMultipleDummy}
// 							className="px-4 py-3 bg-primary text-primary-foreground rounded-lg
// 								hover:bg-primary/90 transition-colors text-left"
// 						>
// 							<div className="font-medium">
// 								Load Multiple Recommendation Sets
// 							</div>
// 							<div className="text-sm opacity-80">
// 								Creates sets for magnuscarlsen, hikaru, gothamchess
// 							</div>
// 						</button>

// 						<button
// 							onClick={handleClearAll}
// 							className="px-4 py-3 bg-destructive text-destructive-foreground rounded-lg
// 								hover:bg-destructive/90 transition-colors text-left"
// 						>
// 							<div className="font-medium">Clear All Recommendations</div>
// 							<div className="text-sm opacity-80">
// 								Removes all saved recommendations from localStorage
// 							</div>
// 						</button>
// 					</div>
// 				</div>

// 				{/* Navigation */}
// 				<div className="pt-4 border-t border-border">
// 					<button
// 						onClick={handleGoToView}
// 						className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg
// 							hover:bg-secondary/80 transition-colors"
// 					>
// 						Go to View Recommendations →
// 					</button>
// 				</div>

// 				{/* Current Storage Status */}
// 				<div className="pt-4 border-t border-border">
// 					<h2 className="text-lg font-semibold text-foreground mb-3">
// 						Current Storage
// 					</h2>
// 					<StorageStatus />
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// const StorageStatus = () => {
// 	const [refreshKey, setRefreshKey] = useState(0);

// 	const stored = RecommendationsLocalStorageUtils.getAllStoredRecommendations();

// 	return (
// 		<div className="space-y-2">
// 			<button
// 				onClick={() => setRefreshKey((k) => k + 1)}
// 				className="text-xs text-muted-foreground hover:text-foreground"
// 				key={refreshKey}
// 			>
// 				↻ Refresh
// 			</button>

// 			{stored.length === 0 ? (
// 				<p className="text-sm text-muted-foreground">
// 					No recommendations stored.
// 				</p>
// 			) : (
// 				<div className="space-y-2">
// 					{stored.map((rec) => (
// 						<div
// 							key={`${rec.username}-${rec.color}`}
// 							className="p-3 rounded-lg bg-card border border-border text-sm"
// 						>
// 							<div className="font-medium">
// 								{rec.username} ({rec.color})
// 							</div>
// 							<div className="text-muted-foreground">
// 								{rec.recommendations.recommendations.length} openings •{" "}
// 								{new Date(rec.savedAtUnixMS).toLocaleString()}
// 							</div>
// 						</div>
// 					))}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default DevUtilsPage;
