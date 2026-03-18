// ________________________
// Allows the user to pick which time controls they want to analyze (Blitz, Rapid, Classical).
// ________________________

"use client";

import { type AllowedTimeControl } from "@/app/utils/types/lichessTypes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Zap, Rabbit, Turtle } from "lucide-react";

type TimeControlPickerProps = {
	selectedTimeControls: AllowedTimeControl[];
	onTimeControlChange: (timeControls: AllowedTimeControl[]) => void;
	isDisabled: boolean;
	/** Pass false when a parent fieldset/legend already labels this group */
	showLabel?: boolean;
};

/**
 * Time control picker with ToggleGroup for Blitz, Rapid, and Classical.
 * Uses shadcn ToggleGroup for accessible multi-select with pill-style visual feedback.
 * Allows multiple selections. At least one must be selected.
 */
const TimeControlPicker = ({
	selectedTimeControls,
	onTimeControlChange,
	isDisabled,
	showLabel = true,
}: TimeControlPickerProps) => {
	const allowedTimeControls: {
		value: AllowedTimeControl;
		label: string;
		Icon: React.ComponentType<{ className?: string }>;
		tooltip: string;
	}[] = [
		{
			value: "blitz",
			label: "Blitz",
			Icon: Zap,
			tooltip: "Fast-paced games: 3-5 minutes per player",
		},
		{
			value: "rapid",
			label: "Rapid",
			Icon: Rabbit,
			tooltip: "Medium-speed games: 5-15 minutes per player",
		},
		{
			value: "classical",
			label: "Classical",
			Icon: Turtle,
			tooltip: "Slower, thoughtful games: 15+ minutes per player",
		},
	];

	return (
		<div className="flex flex-col gap-3">
			{showLabel && (
				<div className="flex items-center gap-2">
					<Label className="text-sm font-medium">Time Controls</Label>
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
								aria-label="More information"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="w-3 h-3"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</TooltipTrigger>
						<TooltipContent>
							Select which game speeds you want to analyze. You can choose
							multiple.
						</TooltipContent>
					</Tooltip>
				</div>
			)}

			<ToggleGroup
				type="multiple"
				value={selectedTimeControls}
				onValueChange={(values) => {
					if (!isDisabled) {
						onTimeControlChange(values as AllowedTimeControl[]);
					}
				}}
				disabled={isDisabled}
				className="justify-start gap-2"
			>
				{allowedTimeControls.map((tc) => {
					const isSelected = selectedTimeControls.includes(tc.value);
					return (
						<Tooltip key={tc.value}>
							<TooltipTrigger asChild>
								<ToggleGroupItem
									value={tc.value}
									disabled={isDisabled}
									className={`px-4 py-2 text-sm font-medium gap-2 transition-colors ${
										isSelected
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
									}`}
									aria-label={tc.label}
									aria-pressed={isSelected}
								>
									<tc.Icon className="w-4 h-4" />
									{tc.label}
								</ToggleGroupItem>
							</TooltipTrigger>
							<TooltipContent>{tc.tooltip}</TooltipContent>
						</Tooltip>
					);
				})}
			</ToggleGroup>
		</div>
	);
};

export default TimeControlPicker;
