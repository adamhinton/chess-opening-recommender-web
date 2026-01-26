interface SubtextProps {
	children: React.ReactNode;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function Subtext({
	children,
	size = "md",
	className = "",
}: SubtextProps) {
	const sizeStyles = {
		sm: "text-xs",
		md: "text-sm",
		lg: "text-base",
	};

	return (
		<p
			className={`
        text-muted-foreground leading-relaxed
        ${sizeStyles[size]}
        ${className}
      `}
		>
			{children}
		</p>
	);
}
