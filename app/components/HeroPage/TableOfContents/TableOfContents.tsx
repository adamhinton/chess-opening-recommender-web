"use client";

import { TOCItem } from "./TOCItem";

export type TOCSection = {
	label: string;
	href: string;
	description?: string;
};

interface TableOfContentsProps {
	sections: TOCSection[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
	return (
		<div className="w-full max-w-4xl mx-auto px-4">
			<div className="bg-card/50 border-2 border-border rounded-xl p-6 sm:p-8 shadow-lg">
				<h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
					Explore This Project
				</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{sections.map((section) => (
						<TOCItem
							key={section.href}
							label={section.label}
							href={section.href}
							description={section.description}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
