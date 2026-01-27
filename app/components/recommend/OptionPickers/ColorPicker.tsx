"use client";

import { type Color } from "@/app/utils/types/stats";

type ColorPickerProps = {
	selectedColor: Color;
	onColorChange: (color: Color) => void;
	isDisabled: boolean;
};

/**
 * Color picker for selecting piece color (white or black).
 */
const ColorPicker = ({
	selectedColor,
	onColorChange,
	isDisabled,
}: ColorPickerProps) => {
	return (
		<div
			role="radiogroup"
			aria-label="Choose color"
			className="flex flex-col gap-3"
		>
			<label
				className={`
					flex items-center gap-3 px-4 py-2 rounded-md border-2 transition-all duration-200 cursor-pointer
					${
						selectedColor === "white"
							? "bg-primary/10 border-primary"
							: "bg-background border-border hover:border-primary/50"
					}
					${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
				`}
			>
				<input
					type="radio"
					name="color"
					value="white"
					checked={selectedColor === "white"}
					onChange={() => !isDisabled && onColorChange("white")}
					disabled={isDisabled}
					className="w-4 h-4 text-primary  focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed focus:outline-none"
				/>
				<span className="text-sm font-medium text-foreground select-none">
					White
				</span>
			</label>

			<label
				className={`
					flex items-center gap-3 px-4 py-2 rounded-md border-2 transition-all duration-200 cursor-pointer
					${
						selectedColor === "black"
							? "bg-primary/10 border-primary"
							: "bg-background border-border hover:border-primary/50"
					}
					${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
				`}
			>
				<input
					type="radio"
					name="color"
					value="black"
					checked={selectedColor === "black"}
					onChange={() => !isDisabled && onColorChange("black")}
					disabled={isDisabled}
					className="w-4 h-4 text-primary cursor-pointer disabled:cursor-not-allowed focus:outline-none"
				/>
				<span className="text-sm font-medium text-foreground select-none">
					Black
				</span>
			</label>
		</div>
	);
};

export default ColorPicker;
