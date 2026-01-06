"use client";

import { type AllowedTimeControl } from "@/app/utils/types/lichess";

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
	const allowedTimeControls: AllowedTimeControl[] = [
		"blitz",
		"rapid",
		"classical",
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

	const capitalize = (str: string) =>
		str.charAt(0).toUpperCase() + str.slice(1);

	return (
		<div className="flex flex-col gap-0.25">
			{allowedTimeControls.map((tc) => {
				const isSelected = selectedTimeControls.includes(tc);
				return (
					<label
						key={tc}
						className={`flex items-center gap-2 cursor-pointer ${
							isDisabled ? "opacity-50 cursor-not-allowed" : ""
						}`}
					>
						<input
							type="checkbox"
							checked={isSelected}
							onChange={() => handleToggle(tc)}
							disabled={isDisabled}
							className="w-4 h- rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
						/>
						<span className="text-sm text-foreground select-none">
							{capitalize(tc)}
						</span>
					</label>
				);
			})}
		</div>
	);
};

export default TimeControlPicker;
