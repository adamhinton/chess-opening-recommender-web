// ______
// Hero page section explaining the technical details of the project. Tech stack, ML architecture, data pipeline, and unique features.
// ______

import { Subtext } from "./Subtext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TechDetail {
	category: string;
	items: { label: string; description: string }[];
}

const techStack: TechDetail[] = [
	{
		category: "Machine Learning",
		items: [
			{
				label: "Matrix Factorization (Collaborative Filtering)",
				description:
					"Custom-built algorithm that decomposes user-opening interaction matrices to find latent patterns. Similar to Netflix recommendations but for chess openings.",
			},
			{
				label: "Training Data: 2,700 Openings",
				description:
					"Trained on extensive Lichess database with openings weighted by time control quality (Classical 3×, Rapid 2×, Blitz 1×).",
			},
			{
				label: "HuggingFace Spaces Deployment",
				description:
					"Model inference served via HuggingFace API with automatic cold start handling and backoff retry logic.",
			},
		],
	},
	{
		category: "Data Engineering",
		items: [
			{
				label: "Real-time Streaming Pipeline",
				description:
					"Streams Lichess ndjson game data via fetch API. Processes 200K+ games with memory-efficient chunked parsing.",
			},
			{
				label: "Smart Filtering & Validation",
				description:
					"Validates game quality (rated only, rating delta < 100pts), opening structure (valid ECO codes), and user relevance before processing.",
			},
			{
				label: "Local Storage Persistence",
				description:
					"Raw stats and recommendations cached in browser localStorage for instant retrieval and offline access.",
			},
		],
	},
	{
		category: "Frontend Architecture",
		items: [
			{
				label: "Next.js 15 + React 19",
				description:
					"Server and client components with App Router. Server-side rendering for SEO, client-side state for interactive features.",
			},
			{
				label: "TypeScript + Tailwind CSS",
				description:
					"Fully typed codebase with utility-first styling. Custom design system using CSS variables for dark mode support.",
			},
			{
				label: "Progressive Enhancement",
				description:
					"Graceful degradation with loading states, error boundaries, and background process management for long-running tasks.",
			},
		],
	},
];

const keyFeatures = [
	{
		title: "Custom Algorithm",
		detail:
			"Built from scratch—not a pre-trained model or third-party API. Full control over training, inference, and feature engineering.",
	},
	{
		title: "Production-Grade",
		detail:
			"Handles cold starts, network failures, rate limiting, and memory constraints with retry logic and streaming data processing.",
	},
	{
		title: "Scalable Design",
		detail:
			"Modular architecture allows easy addition of new features: ELO-based filtering, different time controls, positional analysis.",
	},
];

export function TechnicalDetails() {
	return (
		<section
			id="technical-details"
			className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16"
		>
			<div className="text-center mb-10">
				<h2 className="text-3xl sm:text-4xl font-bold mb-3">
					Technical Details
				</h2>
				<Subtext size="lg" className="max-w-2xl mx-auto">
					A deep dive into the machine learning architecture, data pipeline, and
					engineering decisions
				</Subtext>
			</div>

			{/* Tech Stack Breakdown */}
			<div className="space-y-8 mb-12">
				{techStack.map((section, index) => (
					<Card
						key={index}
						className="
              bg-card border-2 border-border rounded-xl
              hover:border-primary/50 hover:shadow-lg
              transition-all duration-200 py-6 sm:py-8
            "
					>
						<CardHeader className="px-6 sm:px-8 pb-0">
							<CardTitle className="text-2xl font-bold text-primary">
								{section.category}
							</CardTitle>
						</CardHeader>
						<CardContent className="px-6 sm:px-8 pt-6">
							<div className="space-y-5">
								{section.items.map((item, itemIndex) => (
									<div key={itemIndex}>
										<Badge
											variant="secondary"
											className="mb-2 border border-border/70 bg-muted/70 text-foreground"
										>
											{item.label}
										</Badge>
										<Subtext size="md">{item.description}</Subtext>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Key Features Highlight */}
			<Card className="bg-primary/5 border-2 border-primary/20 border-t-4 border-t-accent-gold rounded-xl py-6 sm:py-8">
				<CardHeader className="px-6 sm:px-8 pb-0">
					<CardTitle className="text-2xl font-bold text-center">
						What Makes This Unique
					</CardTitle>
				</CardHeader>
				<CardContent className="px-6 sm:px-8 pt-6">
					<div className="grid gap-6 sm:grid-cols-3">
						{keyFeatures.map((feature, index) => (
							<Card
								key={index}
								className="border border-border/70 bg-card/80 py-4"
							>
								<CardContent className="space-y-2 px-4 sm:px-5">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-accent-gold" />
										<h4 className="font-bold text-foreground">
											{feature.title}
										</h4>
									</div>
									<Subtext size="sm">{feature.detail}</Subtext>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Tech Stack Summary */}
			<div className="mt-10 text-center">
				<Subtext size="md" className="inline-block max-w-3xl">
					<span className="font-semibold text-foreground">Tech Stack:</span>{" "}
					Next.js 15, React 19, TypeScript, Tailwind CSS, HuggingFace Spaces,
					Lichess API, Custom Matrix Factorization, ndjson Streaming,
					LocalStorage Caching
				</Subtext>
			</div>
		</section>
	);
}
