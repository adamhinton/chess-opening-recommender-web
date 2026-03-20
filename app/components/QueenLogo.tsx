// =========================================
// QueenLogo
//
// Shared queen icon used in the site header and empty states.
// Gold-tinted circle with a ♛ queen character — consistent with the
// gold-accent visual identity used throughout the app.
//
// Size variants match the two use-cases:
//   sm  — header logo (32px circle, text-lg)
//   lg  — hero/empty-state icon (80px circle, text-6xl)
// =========================================

interface QueenLogoProps {
	size?: "sm" | "lg";
	className?: string;
}

const SIZE_CLASSES = {
	sm: {
		container: "w-8 h-8",
		text: "text-lg",
	},
	lg: {
		container: "w-20 h-20",
		text: "text-6xl",
	},
};

export const QueenLogo = ({ size = "sm", className = "" }: QueenLogoProps) => {
	const { container, text } = SIZE_CLASSES[size];

	return (
		<div
			className={`${container} rounded-full bg-accent-gold/10 flex items-center justify-center shrink-0 ${className}`}
		>
			<span
				className={`flex items-center justify-center w-full h-full ${text} text-accent-gold select-none`}
				style={{ lineHeight: 1, transform: "translateY(-0.06em)" }}
				aria-hidden="true"
			>
				♛
			</span>
		</div>
	);
};
