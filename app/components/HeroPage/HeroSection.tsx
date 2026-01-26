import Link from "next/link";
import { Badge } from "./Badge";
import { Subtext } from "./Subtext";

export function HeroSection() {
	return (
		<section className="w-full max-w-4xl mx-auto px-4 pt-8 sm:pt-12 pb-12 sm:pb-16">
			<div className="text-center space-y-6">
				{/* Headline */}
				<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
					AI-Powered Chess Opening
					<br />
					<span className="text-primary">Recommendations</span>
				</h1>

				{/* Value Proposition */}
				<div className="max-w-2xl mx-auto space-y-3">
					<p className="text-lg sm:text-xl text-foreground/90">
						Stop memorizing openings. Let AI find ones that match{" "}
						<span className="font-semibold text-primary">
							YOUR playing style
						</span>
						.
					</p>
					<Subtext size="lg" className="max-w-xl mx-auto">
						Analyzes your{" "}
						<a
							href="https://lichess.org"
							target="_blank"
							rel="noopener noreferrer"
							className="underline hover:text-foreground transition-colors"
						>
							Lichess
						</a>{" "}
						game history using a custom-built matrix factorization model to
						recommend{" "}
						<a
							href="https://en.wikipedia.org/wiki/Chess_opening"
							target="_blank"
							rel="noopener noreferrer"
							className="underline hover:text-foreground transition-colors"
						>
							chess openings
						</a>{" "}
						tailored to you.
					</Subtext>
				</div>

				{/* Technical Credibility Badges */}
				<div className="flex flex-wrap gap-3 justify-center items-center pt-4">
					<Badge label="Custom ML Model" variant="primary" size="md" />
					<Badge label="200K+ Games Analyzed" variant="primary" size="md" />
					<Badge label="Matrix Factorization" variant="primary" size="md" />
					<Badge label="Real-time Streaming" variant="primary" size="md" />
				</div>

				{/* CTAs */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
					<Link
						href="/recommend"
						className="
              w-full sm:w-auto
              px-8 py-3
              bg-primary text-primary-foreground
              rounded-lg font-semibold text-lg
              hover:bg-primary/90
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
            "
					>
						Analyze My Games
					</Link>
					<Link
						href="/view-recommendations"
						className="
              w-full sm:w-auto
              px-8 py-3
              bg-secondary text-secondary-foreground
              border-2 border-border
              rounded-lg font-semibold text-lg
              hover:border-primary/50 hover:bg-primary/5
              transition-all duration-200
              hover:scale-105
            "
					>
						View Example Results
					</Link>
				</div>
			</div>
		</section>
	);
}
