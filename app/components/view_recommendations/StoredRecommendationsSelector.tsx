// =========================================
// Stored Recommendations Selector
//
// Displays a list of saved recommendation sets (username + color).
// User can select which one to view or delete saved recommendations.
//
// Folds up when a selection is made.
// =========================================

"use client";

import { useState } from "react";
import { ChevronRight, Crown } from "lucide-react";
import { StoredRecommendationData } from "../../utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Color } from "../../utils/types/stats";
import RecommendationRow from "./RecommendationRow";

// ============================================================================
// Types
// ============================================================================

interface StoredRecommendationsSelectorProps {
	storedRecommendations: StoredRecommendationData[];
	selectedRecommendation: StoredRecommendationData | null;
	onSelect: (recommendation: StoredRecommendationData) => void;
	onDelete: (username: string, color: Color) => void;
}

interface RecommendationToDelete {
	username: string;
	color: Color;
}

/**Displays user's stored recommendations, with option to continue analysis, view completed inference, or delete saved items */
const StoredRecommendationsSelector = ({
	storedRecommendations,
	selectedRecommendation,
	onSelect,
	onDelete,
}: StoredRecommendationsSelectorProps) => {
	const [isExpanded, setIsExpanded] = useState(!selectedRecommendation);
	const [itemToDelete, setItemToDelete] =
		useState<RecommendationToDelete | null>(null);

	// Don't render if no recommendations
	// Should never happen since parent component already checks that length > 1
	if (storedRecommendations.length === 0) {
		return null;
	}

	const handleDelete = () => {
		if (!itemToDelete) return;
		onDelete(itemToDelete.username, itemToDelete.color);
		setItemToDelete(null);
	};

	const handleSelect = (rec: StoredRecommendationData) => {
		onSelect(rec);
		// Collapse after selection (unless it's the only one)
		if (storedRecommendations.length > 1) {
			setIsExpanded(false);
		}
	};

	return (
		<>
			<Collapsible
				open={isExpanded}
				onOpenChange={setIsExpanded}
				className="bg-secondary/30 border border-border rounded-xl overflow-hidden"
			>
				{/* Header - clickable to expand/collapse */}
				<CollapsibleTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						className="h-auto w-full justify-between p-4 hover:bg-secondary/50 text-left"
					>
						<div className="flex items-center gap-3">
							<ChevronRight
								className={`w-4 h-4 text-muted-foreground transition-transform duration-200
								${isExpanded ? "rotate-90" : ""}`}
							/>
							<Crown className="w-5 h-5 text-accent-gold" />
							<div>
								<span className="text-sm font-medium text-foreground">
									Saved Recommendations
								</span>
								<span className="text-xs text-muted-foreground ml-2">
									({storedRecommendations.length} set
									{storedRecommendations.length !== 1 ? "s" : ""})
								</span>
							</div>
						</div>

						{/* Show selected indicator when collapsed */}
						{!isExpanded && selectedRecommendation && (
							<span className="flex items-center gap-2 text-xs text-muted-foreground">
								Viewing: {selectedRecommendation.username} (
								{selectedRecommendation.color})
							</span>
						)}
					</Button>
				</CollapsibleTrigger>

				{/* Content */}
				<CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2 data-[state=open]:fade-in data-[state=open]:duration-200">
					<ul className="px-4 pb-4 space-y-2 list-none">
						{storedRecommendations.map((rec) => {
							const isSelected =
								selectedRecommendation?.username === rec.username &&
								selectedRecommendation?.color === rec.color;

							return (
								<li key={`${rec.username}-${rec.color}`}>
									<RecommendationRow
										recommendation={rec}
										isSelected={isSelected}
										onSelect={() => handleSelect(rec)}
										onDelete={() =>
											setItemToDelete({
												username: rec.username,
												color: rec.color,
											})
										}
									/>
								</li>
							);
						})}
					</ul>
				</CollapsibleContent>
			</Collapsible>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={itemToDelete !== null}
				onOpenChange={(open) => !open && setItemToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Recommendations</AlertDialogTitle>
						<AlertDialogDescription>
							{`Delete saved recommendations for "${itemToDelete?.username}" (${itemToDelete?.color})? This cannot be undone.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={handleDelete}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

// ============================================================================
// Sub-component: RecommendationRow
// ============================================================================

export default StoredRecommendationsSelector;
