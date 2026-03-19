"use client";

import { TOCItem } from "./TOCItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
			<Card className="border-2 border-border bg-card/50 shadow-lg py-6 sm:py-8">
				<CardHeader className="px-6 sm:px-8 pb-0">
					<CardTitle className="text-2xl sm:text-3xl font-bold text-center">
						Explore This Project
					</CardTitle>
				</CardHeader>
				<CardContent className="px-6 sm:px-8 pt-6">
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
				</CardContent>
			</Card>
		</div>
	);
}
