import Link from "next/link";
import { Subtext } from "./Subtext";

interface Feature {
	title: string;
	description: string;
	placeholderText: string;
	link: string;
	linkText: string;
}

const features: Feature[] = [
	{
		title: "Interactive Analysis",
		description:
			"Enter a Lichess username and watch real-time progress as the system analyzes their games, processes patterns, and recommends powerful chess opening sequences.",
		placeholderText: "Screenshot: Game Analysis Interface",
		link: "/recommend",
		linkText: "Try It Now",
	},
	{
		title: "Beautiful Results Tree",
		description:
			"Explore personalized recommendations organized by ECO codes (A-E). Each opening links to detailed Lichess analysis.",
		placeholderText: "Screenshot: Recommendations Tree View",
		link: "/view-recommendations",
		linkText: "View Example",
	},
];

export function Features() {
	return (
		<section
			id="features"
			className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16"
		>
			<div className="text-center mb-10">
				<h2 className="text-3xl sm:text-4xl font-bold mb-3">Features</h2>
				<Subtext size="lg" className="max-w-2xl mx-auto">
					A polished interface designed for chess players and technical
					enthusiasts alike
				</Subtext>
			</div>

			<div className="space-y-8">
				{features.map((feature, index) => (
					<div
						key={index}
						className="
              bg-card border-2 border-border rounded-xl
              overflow-hidden
              hover:border-primary/50 hover:shadow-lg
              transition-all duration-200
            "
					>
						{/* Screenshot Placeholder */}
						<div className="bg-muted/30 border-b-2 border-border p-12 sm:p-16 flex items-center justify-center">
							<div className="text-center space-y-2">
								<div className="text-4xl">📸</div>
								<p className="text-sm font-mono text-muted-foreground">
									{feature.placeholderText}
								</p>
							</div>
						</div>

						{/* Content */}
						<div className="p-6 sm:p-8 space-y-4">
							<h3 className="text-2xl font-bold">{feature.title}</h3>
							<p className="text-foreground/90 leading-relaxed">
								{feature.description}
							</p>
							<Link
								href={feature.link}
								className="
                  inline-flex items-center gap-2
                  text-primary font-semibold
                  hover:underline
                  transition-all duration-200
                "
							>
								{feature.linkText}
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</Link>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
