"use client";

interface TOCItemProps {
	label: string;
	href: string;
	description?: string;
}

export function TOCItem({ label, href, description }: TOCItemProps) {
	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		const element = document.querySelector(href);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<a
			href={href}
			onClick={handleClick}
			className="
        group block
        bg-card border border-border rounded-lg
        p-4 sm:p-5
        transition-all duration-200
        hover:border-primary/50 hover:shadow-lg hover:scale-[1.02]
        hover:bg-primary/5
        cursor-pointer
      "
		>
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
						{label}
					</h3>
					{description && (
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					)}
				</div>
				<div className="ml-4 text-muted-foreground group-hover:text-primary transition-colors">
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</div>
			</div>
		</a>
	);
}
