"use client";

import { useState } from "react";

/**
 * Simple tooltip component with info icon that shows message on hover.
 */
const ToolTip = ({ message }: { message: string }) => {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className="relative inline-block">
			<button
				type="button"
				onMouseEnter={() => setIsVisible(true)}
				onMouseLeave={() => setIsVisible(false)}
				onFocus={() => setIsVisible(true)}
				onBlur={() => setIsVisible(false)}
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

			{isVisible && (
				<div
					className="absolute z-[100] w-60 px-5 py-4 text-sm font-medium text-foreground bg-slate-900 dark:bg-slate-100 dark:text-slate-900 border-2 border-slate-700 dark:border-slate-300 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none"
					style={{
						bottom: "calc(100% + 12px)",
						left: "50%",
						transform: "translateX(-50%)",
					}}
				>
					{message}
					{/* Arrow */}
					<div
						className="absolute w-4 h-4 bg-slate-900 dark:bg-slate-100 border-r-2 border-b-2 border-slate-700 dark:border-slate-300"
						style={{
							bottom: "-9px",
							left: "50%",
							transform: "translateX(-50%) rotate(45deg)",
						}}
					/>
				</div>
			)}
		</div>
	);
};

export default ToolTip;
