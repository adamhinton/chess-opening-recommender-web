"use client";

import { type Color } from "@/app/utils/types/stats";

type ColorPickerProps = {
	selectedColor: Color;
	onColorChange: (color: Color) => void;
	isDisabled: boolean;
};

/**Play as
 * Color picker for selecting piece color (white or black).
 * Simple text-based toggle buttons.
 */
const ColorPicker = ({
	selectedColor,
	onColorChange,
	isDisabled,
}: ColorPickerProps) => {
	return (
		<div className="flex items-center gap-2 w-fit">
			<button
				type="button"
				onClick={() => !isDisabled && onColorChange("white")}
				disabled={isDisabled}
				className={`
					px-3 py-1 text-sm rounded-md border transition-colors duration-200
					focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
					disabled:opacity-50 disabled:cursor-not-allowed
					${
						selectedColor === "white"
							? "bg-primary text-primary-foreground border-primary font-medium"
							: "bg-background text-foreground border-border hover:bg-secondary"
					}
				`}
				aria-label=" White"
				aria-pressed={selectedColor === "white"}
			>
				White
			</button>
			<button
				type="button"
				onClick={() => !isDisabled && onColorChange("black")}
				disabled={isDisabled}
				className={`
					px-3 py-1 text-sm rounded-md border transition-colors duration-200
					focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
					disabled:opacity-50 disabled:cursor-not-allowed
					${
						selectedColor === "black"
							? "bg-primary text-primary-foreground border-primary font-medium"
							: "bg-background text-foreground border-border hover:bg-secondary"
					}
				`}
				aria-label="Black Games"
				aria-pressed={selectedColor === "black"}
			>
				Black
			</button>
		</div>
	);
};

export default ColorPicker;
