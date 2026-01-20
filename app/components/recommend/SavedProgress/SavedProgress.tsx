"use client";

import { useEffect, useState } from "react";
import {
	StatsLocalStorageUtils,
	StoredPlayerData,
} from "../../../utils/rawOpeningStats/localStorage/statsLocalStorage";
import { Color } from "../../../utils/types/stats";
import { AllowedTimeControl } from "../../../utils/types/lichessTypes";
import ConfirmationDialog from "../../ConfirmationDialog";

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
	onViewStats: (playerData: StoredPlayerData) => void;
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
 * - Foldable section
 * - Separates ongoing (isComplete=false) vs finished (isComplete=true) players
 * - Resume button for ongoing players
 * - Click finished players to view stat
 * - Delete with confirmation dialog
 */
const SavedProgress = ({
	onResumePlayer,
	onViewStats,
	isDisabled = false,
}: SavedProgressProps) => {
	const [isExpanded, setIsExpanded] = useState(true);
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
		onResumePlayer({
			username: player.playerData.lichessUsername,
			color: player.playerData.color,
			timeControls: player.allowedTimeControls,
		});
	};

	return (
		<>
			<div className="bg-secondary/30 border border-border rounded-lg mb-6 overflow-hidden">
				{/* Header - clickable to expand/collapse */}
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					disabled={isDisabled}
					className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors disabled:opacity-50"
				>
					<div className="flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className={`h-4 w-4 text-muted-foreground transition-transform ${
								isExpanded ? "rotate-90" : ""
							}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
						<span className="text-sm font-medium text-foreground">
							Saved Progress
						</span>
						<span className="text-xs text-muted-foreground">
							({storedPlayers.length} player
							{storedPlayers.length !== 1 ? "s" : ""})
						</span>
					</div>
				</button>

				{/* Content */}
				{isExpanded && (
					<div className="px-4 pb-4 space-y-4">
						{/* Ongoing Players */}
						{ongoingPlayers.length > 0 && (
							<div>
								<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
									In Progress
								</h4>
								<div className="space-y-2">
									{ongoingPlayers.map((player) => (
										<PlayerRow
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
										/>
									))}
								</div>
							</div>
						)}

						{/* Finished Players */}
						{finishedPlayers.length > 0 && (
							<div>
								<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
									Completed
								</h4>
								<div className="space-y-2">
									{finishedPlayers.map((player) => (
										<PlayerRow
											key={`${player.playerData.lichessUsername}-${player.playerData.color}`}
											player={player}
											variant="finished"
											isDisabled={isDisabled}
											onViewStats={() => onViewStats(player)}
											onDelete={() =>
												setPlayerToDelete({
													username: player.playerData.lichessUsername,
													color: player.playerData.color,
												})
											}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDialog
				isOpen={playerToDelete !== null}
				title="Delete Saved Data"
				message={`Delete all saved analysis for "${playerToDelete?.username}" (${playerToDelete?.color})? This cannot be undone.`}
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleDelete}
				onCancel={() => setPlayerToDelete(null)}
			/>
		</>
	);
};

// ============================================================================
// Sub-components
// ============================================================================

interface PlayerRowProps {
	player: StoredPlayerData;
	variant: "ongoing" | "finished";
	isDisabled: boolean;
	onResume?: () => void;
	onViewStats?: () => void;
	onDelete: () => void;
}

const PlayerRow = ({
	player,
	variant,
	isDisabled,
	onResume,
	onViewStats,
	onDelete,
}: PlayerRowProps) => {
	const { lichessUsername, color } = player.playerData;

	return (
		<div className="flex items-center justify-between bg-background rounded-md p-3 border border-border">
			{/* Player info */}
			<div className="flex items-center gap-2">
				{/* Color indicator */}
				<span
					className={`text-lg ${
						color === "white" ? "text-amber-100" : "text-gray-800"
					}`}
					title={color}
				>
					{color === "white" ? "White" : "Black"}
				</span>
				<span className="font-medium text-foreground">{lichessUsername}</span>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-2">
				{variant === "ongoing" && onResume && (
					<button
						type="button"
						onClick={onResume}
						disabled={isDisabled}
						className="px-3 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
					>
						Resume
					</button>
				)}

				{variant === "finished" && onViewStats && (
					<button
						type="button"
						onClick={onViewStats}
						disabled={isDisabled}
						className="px-3 py-1 text-xs font-medium rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
					>
						View Stats
					</button>
				)}

				{/* Delete button */}
				<button
					type="button"
					onClick={onDelete}
					disabled={isDisabled}
					className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
					aria-label={`Delete ${lichessUsername}`}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default SavedProgress;
