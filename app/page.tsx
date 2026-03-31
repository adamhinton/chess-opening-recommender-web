// ________________________
// Main landing page
// Hero section ,tech stack, table of contents, etc.
// ________________________

import { HeroSection } from "./components/HeroPage/HeroSection";
import {
	TableOfContents,
	TOCSection,
} from "./components/HeroPage/TableOfContents/TableOfContents";
import { HowItWorks } from "./components/HeroPage/HowItWorks";
import { Features } from "./components/HeroPage/Features";
import { TechnicalDetails } from "./components/HeroPage/TechnicalDetails";
import { Separator } from "@/components/ui/separator";

const tocSections: TOCSection[] = [
	{
		label: "How It Works",
		href: "#how-it-works",
		description: "The 4-step AI pipeline",
	},
	{
		label: "Features",
		href: "#features",
		description: "Interface & visualization",
	},
	{
		label: "Technical Details",
		href: "#technical-details",
		description: "ML architecture deep dive",
	},
];

/**Landing/hero page */
export default function Home() {
	return (
		// hero-queen-watermark class adds a repeated decorative chess queen backdrop on the hero page
		<main className="hero-queen-watermark min-h-screen pb-16">
			<HeroSection />

			{/* Divider */}
			<Separator className="h-0.5 bg-linear-to-r from-transparent via-border to-transparent" />

			<div className="py-8">
				<TableOfContents sections={tocSections} />
			</div>

			{/* Divider */}
			<Separator className="h-0.5 bg-linear-to-r from-transparent via-border to-transparent" />

			<HowItWorks />

			{/* Divider */}
			<div className="w-full max-w-4xl mx-auto px-4 py-8">
				<Separator className="h-0.5 bg-linear-to-r from-transparent via-border to-transparent" />
			</div>

			{/* Project features */}
			<Features />

			{/* Divider */}
			<Separator className="h-0.5 bg-linear-to-r from-transparent via-border to-transparent" />

			{/* Tech stack details */}
			<TechnicalDetails />
		</main>
	);
}
