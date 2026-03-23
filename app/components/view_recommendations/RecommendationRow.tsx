// _____________
// This is a child component of StoredRecommendationsSelector
// It renders a single stored recommendation entry in the list
// _____________

import { StoredRecommendationData } from "@/app/utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trash2, User } from "lucide-react";

interface RecommendationRowProps {
	recommendation: StoredRecommendationData;
	isSelected: boolean;
	onSelect: () => void;
	onDelete: () => void;
}

/**
 * Renders a single recommendation entry in the stored recommendations list, showing username, color, and number of openings. Also has options to select (view) or delete the recommendation set.
 */
const RecommendationRow = ({
	recommendation,
	isSelected,
	onSelect,
	onDelete,
}: RecommendationRowProps) => {
	const { username, color, recommendations } = recommendation;
	const openingCount = recommendations.recommendations.length;

	// Colored left accent strip — zinc values are theme-independent for reliable contrast
	const leftAccentClass =
		color === "white"
			? "border-l-zinc-300 dark:border-l-zinc-600"
			: "border-l-zinc-700 dark:border-l-zinc-400";

	return (
		<article
			className={`flex items-center justify-between rounded-lg p-3 border border-l-4 ${leftAccentClass} transition-all
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
						{/* Queen chip + color label. Chip uses theme-independent zinc for contrast in both light/dark */}
						<Badge
							variant={color === "white" ? "outline" : "secondary"}
							className="gap-1.5"
						>
							{color === "white" ? (
								<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-900 text-zinc-50 text-[10px] leading-none">
									♕
								</span>
							) : (
								<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-100 border border-zinc-400 text-zinc-900 text-[10px] leading-none">
									♛
								</span>
							)}
							{color === "white" ? "White" : "Black"}
						</Badge>
						{isSelected && (
							<CheckCircle2 className="w-4 h-4 text-accent-gold" />
						)}
					</div>
					<p className="text-xs text-muted-foreground mt-0.5">
						{openingCount} opening{openingCount !== 1 ? "s" : ""}
					</p>
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
		</article>
	);
};

export default RecommendationRow;
