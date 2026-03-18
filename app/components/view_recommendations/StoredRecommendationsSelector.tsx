// =========================================
// Stored Recommendations Selector
//
// Displays a list of saved recommendation sets (username + color).
// User can select which one to view or delete saved recommendations.
//
// Folds up when a selection is made.
// Based on the SavedProgress component pattern.
// =========================================

"use client";

import { useState } from "react";
import { ChevronRight, Trash2, User, Crown } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Color } from "../../utils/types/stats";

// ============================================================================
// Types
// ============================================================================

interface StoredRecommendationsSelectorProps {
	storedRecommendations: StoredRecommendationData[];
	selectedRecommendation: StoredRecommendationData | null;
	onSelect: (recommendation: StoredRecommendationData) => void;
	onDelete: (username: string, color: Color) => void;
	/** Whether there's only one stored recommendation (affects UI)
	 * TODO can probably clean up this logic a bit
	 */
	isSingleRecommendation?: boolean;
}

interface RecommendationToDelete {
	username: string;
	color: Color;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(unixMs: number) {
	return new Date(unixMs).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/**Displays user's stored recommendations, with option to continue analysis, view completed inference, or delete saved items */
const StoredRecommendationsSelector = ({
	storedRecommendations,
	selectedRecommendation,
	onSelect,
	onDelete,
	isSingleRecommendation = false,
}: StoredRecommendationsSelectorProps) => {
	const [isExpanded, setIsExpanded] = useState(!selectedRecommendation);
	const [itemToDelete, setItemToDelete] =
		useState<RecommendationToDelete | null>(null);

	// Don't render if no recommendations
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
		if (!isSingleRecommendation) {
			setIsExpanded(false);
		}
	};

	return (
		<>
			<div className="bg-secondary/30 border border-border rounded-xl overflow-hidden">
				{/* Header - clickable to expand/collapse */}
				<Button
					type="button"
					variant="ghost"
					onClick={() => setIsExpanded(!isExpanded)}
					aria-expanded={isExpanded}
					className="h-auto w-full justify-between p-4 hover:bg-secondary/50 text-left"
				>
					<div className="flex items-center gap-3">
						<ChevronRight
							className={`w-4 h-4 text-muted-foreground transition-transform duration-200
								${isExpanded ? "rotate-90" : ""}`}
						/>
						<Crown className="w-5 h-5 text-primary" />
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
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span>
								Viewing: {selectedRecommendation.username} (
								{selectedRecommendation.color})
							</span>
						</div>
					)}
				</Button>

				{/* Content */}
				{isExpanded && (
					<div className="px-4 pb-4 space-y-2">
						{storedRecommendations.map((rec) => {
							const isSelected =
								selectedRecommendation?.username === rec.username &&
								selectedRecommendation?.color === rec.color;

							return (
								<RecommendationRow
									key={`${rec.username}-${rec.color}`}
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
							);
						})}
					</div>
				)}
			</div>

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

interface RecommendationRowProps {
	recommendation: StoredRecommendationData;
	isSelected: boolean;
	onSelect: () => void;
	onDelete: () => void;
}

const RecommendationRow = ({
	recommendation,
	isSelected,
	onSelect,
	onDelete,
}: RecommendationRowProps) => {
	const { username, color, savedAtUnixMS, recommendations } = recommendation;
	const openingCount = recommendations.recommendations.length;

	return (
		<div
			className={`flex items-center justify-between rounded-lg p-3 border transition-all
				${
					isSelected
						? "border-primary bg-primary/5"
						: "border-border bg-background hover:border-primary/30"
				}`}
		>
			{/* Clickable area for selection */}
			<Button
				type="button"
				variant="ghost"
				onClick={onSelect}
				className="flex-1 h-auto justify-start gap-3 px-0 py-0 font-normal hover:bg-transparent"
			>
				{/* User icon */}
				<User className="w-5 h-5 text-muted-foreground" />

				{/* Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="font-medium text-foreground truncate">
							{username}
						</span>
						<Badge variant={color === "white" ? "outline" : "secondary"}>
							{color === "white" ? "♙ White" : "♟ Black"}
						</Badge>
						{isSelected && (
							<span className="text-xs text-primary font-medium">
								✓ Selected
							</span>
						)}
					</div>
					<div className="text-xs text-muted-foreground mt-0.5">
						{openingCount} opening{openingCount !== 1 ? "s" : ""} •{" "}
						{formatDate(savedAtUnixMS)}
					</div>
				</div>
			</Button>

			{/* Delete button */}
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
				aria-label={`Delete recommendations for ${username}`}
			>
				<Trash2 className="w-4 h-4" />
			</Button>
		</div>
	);
};

export default StoredRecommendationsSelector;
