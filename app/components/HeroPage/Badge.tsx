interface BadgeProps {
	label: string;
	variant?: "primary" | "secondary" | "accent";
	size?: "sm" | "md" | "lg";
}

/**Shows items we want to emphasize to the user */
export function Badge({ label, variant = "primary", size = "md" }: BadgeProps) {
	const variantStyles = {
		primary: "bg-primary/10 border-primary/30 text-primary",
		secondary: "bg-secondary/50 border-border text-secondary-foreground",
		accent: "bg-accent/50 border-accent-foreground/20 text-accent-foreground",
	};

	const sizeStyles = {
		sm: "px-3 py-1 text-xs",
		md: "px-4 py-1.5 text-sm",
		lg: "px-5 py-2 text-base",
	};

	return (
		<span
			className={`
        inline-flex items-center justify-center
        rounded-full border-2 font-semibold
        transition-all duration-200
        hover:scale-105 hover:shadow-md
        ${variantStyles[variant]}
        ${sizeStyles[size]}
      `}
		>
			{label}
		</span>
	);
}
