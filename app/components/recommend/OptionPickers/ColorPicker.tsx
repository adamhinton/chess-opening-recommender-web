// ________________________
// Allows the user to pick which piece color they want to analyze (white or black).
// ________________________

"use client";

import { type Color } from "@/app/utils/types/stats";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type ColorPickerProps = {
	selectedColor: Color;
	onColorChange: (color: Color) => void;
	isDisabled: boolean;
};

/**
 * Color picker for selecting piece color (white or black).
 * Large card-style items with chess piece emoji as visual anchor.
 */
const ColorPicker = ({
	selectedColor,
	onColorChange,
	isDisabled,
}: ColorPickerProps) => {
	const colors: {
		value: Color;
		label: string;
		pieceClassName: string;
	}[] = [
		{
			value: "white",
			label: "White",
			pieceClassName: "bg-slate-900 text-white border border-slate-700",
		},
		{
			value: "black",
			label: "Black",
			pieceClassName:
				"bg-white text-slate-900 border border-slate-300 shadow-sm dark:border-slate-500",
		},
	];

	return (
		<RadioGroup
			value={selectedColor}
			onValueChange={(value) => {
				if (!isDisabled) {
					onColorChange(value as Color);
				}
			}}
			disabled={isDisabled}
			className="space-y-3"
		>
			{colors.map((color) => (
				<div key={color.value}>
					<Label
						htmlFor={color.value}
						className={`
							flex items-center gap-4 px-4 py-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
							${
								selectedColor === color.value
									? "border-primary bg-primary/10"
									: "bg-background border-border hover:border-primary/50"
							}
							${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
						`}
					>
						<RadioGroupItem
							value={color.value}
							id={color.value}
							disabled={isDisabled}
							className="h-5 w-5"
						/>
						<span
							className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-xl ${color.pieceClassName}`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-4 w-4"
								aria-hidden="true"
							>
								<path d="M12 3a3 3 0 0 0-1.76 5.43A4.98 4.98 0 0 0 8 12.5c0 1.09.35 2.1.95 2.93C7.18 16.12 6 17.47 6 19v1h12v-1c0-1.53-1.18-2.88-2.95-3.57.6-.83.95-1.84.95-2.93a4.98 4.98 0 0 0-2.24-4.07A3 3 0 0 0 12 3Z" />
							</svg>
						</span>
						<span className="text-sm font-medium text-foreground">
							{color.label}
						</span>
					</Label>
				</div>
			))}
		</RadioGroup>
	);
};

export default ColorPicker;
