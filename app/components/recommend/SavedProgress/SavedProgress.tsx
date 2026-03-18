// ============================================================================
// Displays user analyses saved in localStorage, with options to resume or view stats.

// Displays both in-progress and completed anlayses

// Only renders if saved analyses exist
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import {
	StatsLocalStorageUtils,
	StoredPlayerData,
} from "../../../utils/rawOpeningStats/localStorage/statsLocalStorage";
import { Color } from "../../../utils/types/stats";
import { AllowedTimeControl } from "../../../utils/types/lichessTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

// ============================================================================
// Types
// ============================================================================

interface SavedProgressProps {
	/**
	 * Called when user clicks "Resume" on an ongoing player.
	 * Parent should populate form and auto-submit.
	 */
	onResumePlayer: (params: {
		username: string;
		color: Color;
		timeControls: AllowedTimeControl[];
	}) => void;
	/**
	 * Called when user clicks a finished player to view stats.
	 */
	onViewStats: (playerData: Readonly<StoredPlayerData>) => void;
	/** Disable interactions while form is submitting */
	isDisabled?: boolean;
}

interface PlayerToDelete {
	username: string;
	color: Color;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Displays saved player analyses from localStorage.
 *
 * Features:
 * - Invisible when no saved data exists
 * - Compact summary banner when saved data exists
 * - Sheet drawer entry point for saved analyses
 */
const SavedProgress = (props: SavedProgressProps) => {
	const { onResumePlayer, onViewStats, isDisabled = false } = props;
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [isOngoingExpanded, setIsOngoingExpanded] = useState(true);
	const [isFinishedExpanded, setIsFinishedExpanded] = useState(true);
	const [storedPlayers, setStoredPlayers] = useState<StoredPlayerData[]>([]);
	const [playerToDelete, setPlayerToDelete] = useState<PlayerToDelete | null>(
		null,
	);

	// Load saved players on mount
	useEffect(() => {
		refreshPlayers();
	}, []);

	const refreshPlayers = () => {
		const players = StatsLocalStorageUtils.getAllStoredPlayersFull();
		setStoredPlayers(players);
	};

	// Separate ongoing and finished players
	const ongoingPlayers = storedPlayers.filter((p) => !p.isComplete);
	const finishedPlayers = storedPlayers.filter((p) => p.isComplete);
	const summaryText = `${ongoingPlayers.length} in progress, ${finishedPlayers.length} completed`;

	// Don't render if no saved players
	if (storedPlayers.length === 0) {
		return null;
	}

	const handleDelete = () => {
		if (!playerToDelete) return;

		StatsLocalStorageUtils.deleteStatsByUsername(
			playerToDelete.username,
			playerToDelete.color,
		);
		setPlayerToDelete(null);
		refreshPlayers();
	};

	const handleResume = (player: StoredPlayerData) => {
		setIsSheetOpen(false);
		onResumePlayer({
			username: player.playerData.lichessUsername,
			color: player.playerData.color,
			timeControls: player.allowedTimeControls,
		});
	};

	const handleViewStats = (player: StoredPlayerData) => {
		setIsSheetOpen(false);
		onViewStats(player);
	};

	return (
		<>
			{/* Renders as just a quick banner that user can click to see details on saved progress */}
			<aside
				role="status"
				aria-live="polite"
				className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-border/70 border-l-4 border-l-accent-gold/60 bg-card/70 px-4 py-3 shadow-xs"
			>
				<div className="min-w-0">
					<p className="text-sm font-semibold text-foreground">
						Saved Progress
					</p>
					<p className="text-sm text-muted-foreground">{summaryText}</p>
				</div>
				<Button
					type="button"
					variant="outline"
					onClick={() => setIsSheetOpen(true)}
					disabled={isDisabled}
					className="transition-colors hover:border-accent-gold/70 hover:bg-accent-gold/10 hover:text-amber-800 dark:hover:text-amber-300"
				>
					View Saved
				</Button>
			</aside>

			{/* Side sheet that opens on click to display user's saved data */}
			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetContent side="right" className="w-full sm:max-w-md">
					<SheetHeader className="border-b border-border/60 pr-12">
						<div className="flex items-start justify-between gap-3">
							<div className="space-y-1">
								<SheetTitle>Your Saved Analyses</SheetTitle>
								<SheetDescription>
									Resume unfinished analyses or reopen completed ones from this
									drawer.
								</SheetDescription>
							</div>
							<Badge variant="secondary" className="shrink-0">
								{storedPlayers.length} total
							</Badge>
						</div>
					</SheetHeader>

					<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-2">
						<section
							aria-labelledby="saved-progress-overview-heading"
							className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4"
						>
							<h2
								id="saved-progress-overview-heading"
								className="text-sm font-semibold text-foreground"
							>
								Overview
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								{summaryText}
							</p>
						</section>

						{/* Ongoing analyses that can be resumed; resuming will continue streaming and accumulation of stats from lichess game history*/}
						<SavedPlayersSection
							title="In Progress"
							count={ongoingPlayers.length}
							isOpen={isOngoingExpanded}
							onOpenChange={setIsOngoingExpanded}
							emptyMessage="No unfinished analyses saved right now."
						>
							{ongoingPlayers.map((player, index) => (
								<PlayerListRow
									key={`${player.playerData.lichessUsername}-${player.playerData.color}`}
									player={player}
									variant="ongoing"
									isDisabled={isDisabled}
									onResume={() => handleResume(player)}
									onDelete={() =>
										setPlayerToDelete({
											username: player.playerData.lichessUsername,
											color: player.playerData.color,
										})
									}
									showSeparator={index < ongoingPlayers.length - 1}
								/>
							))}
						</SavedPlayersSection>

						{/* Analyses that are fully complete and have results available */}
						<SavedPlayersSection
							title="Completed"
							count={finishedPlayers.length}
							isOpen={isFinishedExpanded}
							onOpenChange={setIsFinishedExpanded}
							emptyMessage="Completed analyses will appear here once available."
						>
							{finishedPlayers.map((player, index) => (
								<PlayerListRow
									key={`${player.playerData.lichessUsername}-${player.playerData.color}`}
									player={player}
									variant="finished"
									isDisabled={isDisabled}
									onViewStats={() => handleViewStats(player)}
									onDelete={() =>
										setPlayerToDelete({
											username: player.playerData.lichessUsername,
											color: player.playerData.color,
										})
									}
									showSeparator={index < finishedPlayers.length - 1}
								/>
							))}
						</SavedPlayersSection>
					</div>
				</SheetContent>
			</Sheet>

			<AlertDialog
				open={playerToDelete !== null}
				onOpenChange={(open) => !open && setPlayerToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Saved Data</AlertDialogTitle>
						<AlertDialogDescription>
							{`Delete all saved analysis for "${playerToDelete?.username}" (${playerToDelete?.color})? This cannot be undone.`}
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
// Sub-components
// ============================================================================

interface SavedPlayersSectionProps {
	title: string;
	count: number;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	emptyMessage: string;
	children: React.ReactNode;
}

const SavedPlayersSection = ({
	title,
	count,
	isOpen,
	onOpenChange,
	emptyMessage,
	children,
}: SavedPlayersSectionProps) => {
	return (
		<section aria-label={title} className="rounded-lg border border-border/70">
			<Collapsible open={isOpen} onOpenChange={onOpenChange}>
				<CollapsibleTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						className="flex h-auto w-full items-center justify-between rounded-lg px-4 py-3 hover:bg-muted/30"
					>
						<span className="flex items-center gap-2 text-sm font-semibold text-foreground">
							{title}
							<Badge variant="outline">{count}</Badge>
						</span>
						<ChevronDown
							className={`size-4 text-muted-foreground transition-transform ${
								isOpen ? "rotate-180" : ""
							}`}
						/>
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<Separator />
					{count === 0 ? (
						<p className="px-4 py-4 text-sm text-muted-foreground">
							{emptyMessage}
						</p>
					) : (
						<ul className="px-4 py-2">{children}</ul>
					)}
				</CollapsibleContent>
			</Collapsible>
		</section>
	);
};

interface PlayerListRowProps {
	player: StoredPlayerData;
	variant: "ongoing" | "finished";
	isDisabled: boolean;
	onResume?: () => void;
	onViewStats?: () => void;
	onDelete: () => void;
	showSeparator: boolean;
}

/**Individual player's saved stats */
const PlayerListRow = ({
	player,
	variant,
	isDisabled,
	onResume,
	onViewStats,
	onDelete,
	showSeparator,
}: PlayerListRowProps) => {
	const { lichessUsername, color } = player.playerData;

	return (
		<li>
			<div className="flex items-center justify-between gap-3 py-3">
				<div className="min-w-0 flex items-center gap-2">
					<Badge variant={color === "white" ? "outline" : "secondary"}>
						{color === "white" ? "♙ White" : "♟ Black"}
					</Badge>
					<span className="truncate text-sm font-medium text-foreground">
						{lichessUsername}
					</span>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{variant === "ongoing" && onResume && (
						<Button
							type="button"
							size="sm"
							onClick={onResume}
							disabled={isDisabled}
						>
							Resume
						</Button>
					)}

					{variant === "finished" && onViewStats && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onViewStats}
							disabled={isDisabled}
						>
							View Stats
						</Button>
					)}

					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={onDelete}
						disabled={isDisabled}
						aria-label={`Delete ${lichessUsername}`}
						className="text-muted-foreground hover:text-destructive"
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			</div>
			{showSeparator && <Separator />}
		</li>
	);
};

export default SavedProgress;
