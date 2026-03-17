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
 * Uses shadcn RadioGroup for accessible, styled selection.
 * Large card-style items with chess piece emoji as visual anchor.
 */
const ColorPicker = ({
	selectedColor,
	onColorChange,
	isDisabled,
}: ColorPickerProps) => {
	const colors: { value: Color; label: string; emoji: string }[] = [
		{ value: "white", label: "White", emoji: "♙" },
		{ value: "black", label: "Black", emoji: "♟" },
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
									? "bg-primary/10 border-primary"
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
						<span className="text-2xl">{color.emoji}</span>
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
