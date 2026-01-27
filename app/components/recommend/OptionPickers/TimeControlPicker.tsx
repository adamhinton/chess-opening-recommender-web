"use client";

import { type AllowedTimeControl } from "@/app/utils/types/lichessTypes";
import ToolTip from "../../ToolTips/ToolTip";

type TimeControlPickerProps = {
	selectedTimeControls: AllowedTimeControl[];
	onTimeControlChange: (timeControls: AllowedTimeControl[]) => void;
	isDisabled: boolean;
};

/**
 * Time control picker with checkboxes for Blitz, Rapid, and Classical.
 *
 * Allows multiple selections.
 *
 * At least one must be selected.
 */
const TimeControlPicker = ({
	selectedTimeControls,
	onTimeControlChange,
	isDisabled,
}: TimeControlPickerProps) => {
	const allowedTimeControls: {
		value: AllowedTimeControl;
		label: string;
		tooltip: string;
	}[] = [
		{
			value: "blitz",
			label: "Blitz",
			tooltip: "Fast-paced games: 3-5 minutes per player",
		},
		{
			value: "rapid",
			label: "Rapid",
			tooltip: "Medium-speed games: 5-15 minutes per player",
		},
		{
			value: "classical",
			label: "Classical",
			tooltip: "Slower, thoughtful games: 15+ minutes per player",
		},
	];

	const handleToggle = (tc: AllowedTimeControl) => {
		if (isDisabled) return;

		const isSelected = selectedTimeControls.includes(tc);
		if (isSelected) {
			// Remove if already selected
			onTimeControlChange(selectedTimeControls.filter((t) => t !== tc));
		} else {
			// Add if not selected
			onTimeControlChange([...selectedTimeControls, tc]);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2 mb-1">
				<label className="block text-sm font-medium text-foreground">
					Time Controls
				</label>
				<ToolTip message="Select which game speeds you want to analyze. You can choose multiple." />
			</div>

			{allowedTimeControls.map((tc) => {
				const isSelected = selectedTimeControls.includes(tc.value);
				return (
					<label
						key={tc.value}
						className={`flex items-center gap-3 cursor-pointer ${
							isDisabled ? "opacity-50 cursor-not-allowed" : ""
						}`}
					>
						<input
							type="checkbox"
							checked={isSelected}
							onChange={() => handleToggle(tc.value)}
							disabled={isDisabled}
							className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
						/>
						<span className="text-sm text-foreground select-none">
							{tc.label}
						</span>
						<ToolTip message={tc.tooltip} />
					</label>
				);
			})}
		</div>
	);
};

export default TimeControlPicker;
