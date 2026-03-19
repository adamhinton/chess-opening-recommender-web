// _________________
// Hero page section describing how the AI model works.
// _________________

import { Subtext } from "./Subtext";
import { Card, CardContent } from "@/components/ui/card";

interface Step {
	number: number;
	title: string;
	description: string;
	technicalDetail: string;
}

const steps: Step[] = [
	{
		number: 1,
		title: "Data Collection",
		description:
			"Streams your Lichess games via API. Validates quality (rating delta < 100 pts, rated games only).",
		technicalDetail:
			"Smart filtering ensures only relevant games inform recommendations",
	},
	{
		number: 2,
		title: "Feature Engineering",
		description:
			"Extracts opening patterns, ECO codes, win rates. Weights by time control quality.",
		technicalDetail:
			"Classical games count 3× more than blitz—longer games reveal true style",
	},
	{
		number: 3,
		title: "AI Model",
		description:
			"Custom matrix factorization model (collaborative filtering). Trained on 2,700 openings.",
		technicalDetail:
			"Built from scratch—not a pre-trained model. Finds patterns across thousands of players. Deployed on HuggingFace Spaces.",
	},
	{
		number: 4,
		title: "Personalized Results",
		description:
			"Returns 30-50 openings ranked by predicted success for YOUR play style.",
		technicalDetail:
			"Organized by ECO classification system for easy navigation",
	},
];

// Hero page section describing how the AI model works. */
export function HowItWorks() {
	return (
		<section
			id="how-it-works"
			className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16"
		>
			<div className="text-center mb-10">
				<h2 className="text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
				<Subtext size="lg" className="max-w-2xl mx-auto">
					A 4-step pipeline combining data engineering, machine learning, and
					personalized recommendations
				</Subtext>
			</div>

			<div className="space-y-6">
				{steps.map((step, index) => (
					<Card
						key={step.number}
						className={`
              bg-card border-2 rounded-xl
              transition-all duration-200
              hover:shadow-lg
              ${
								step.number === 3
									? "border-accent-gold hover:border-accent-gold/80"
									: "border-border hover:border-primary/50"
							}
            `}
					>
						<CardContent className="p-6 sm:p-8">
							<div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
								{/* Step Number */}
								<div className="relative shrink-0 sm:min-w-14">
									<div
										className={`
                    w-12 h-12 sm:w-14 sm:h-14
                    rounded-full
                    flex items-center justify-center
                    text-xl sm:text-2xl font-bold
                    ${
											step.number === 3
												? "bg-primary text-primary-foreground ring-4 ring-primary/30"
												: "bg-primary/10 text-primary"
										}
                  `}
									>
										{step.number}
									</div>
									{index < steps.length - 1 && (
										<div
											aria-hidden="true"
											className="hidden sm:block absolute left-1/2 top-14 h-[calc(100%+1.75rem)] w-px -translate-x-1/2 bg-border/60"
										/>
									)}
								</div>

								{/* Content */}
								<div className="flex-1 space-y-2">
									<h3
										className={`text-xl sm:text-2xl font-bold ${
											step.number === 3 ? "text-primary" : ""
										}`}
									>
										{step.title}
									</h3>
									<p className="text-foreground/90 leading-relaxed">
										{step.description}
									</p>
									<Subtext size="sm" className="pt-1">
										{step.technicalDetail}
									</Subtext>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
}
