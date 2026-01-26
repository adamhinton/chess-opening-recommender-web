import { HeroSection } from "./components/HeroPage/HeroSection";
import {
	TableOfContents,
	TOCSection,
} from "./components/HeroPage/TableOfContents/TableOfContents";
import { HowItWorks } from "./components/HeroPage/HowItWorks";
import { Features } from "./components/HeroPage/Features";
import { TechnicalDetails } from "./components/HeroPage/TechnicalDetails";

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

export default function Home() {
	return (
		<main className="min-h-screen pb-16">
			<HeroSection />

			{/* Divider */}
			<div className="w-full max-w-4xl mx-auto px-4 py-8">
				<div className="h-[2px] bg-gradient-to-r from-transparent via-border to-transparent" />
			</div>

			<div className="py-8">
				<TableOfContents sections={tocSections} />
			</div>

			{/* Divider */}
			<div className="w-full max-w-4xl mx-auto px-4 py-8">
				<div className="h-[2px] bg-gradient-to-r from-transparent via-border to-transparent" />
			</div>

			<HowItWorks />

			{/* Divider */}
			<div className="w-full max-w-4xl mx-auto px-4 py-8">
				<div className="h-[2px] bg-gradient-to-r from-transparent via-border to-transparent" />
			</div>

			<Features />

			{/* Divider */}
			<div className="w-full max-w-4xl mx-auto px-4 py-8">
				<div className="h-[2px] bg-gradient-to-r from-transparent via-border to-transparent" />
			</div>

			<TechnicalDetails />
		</main>
	);
}
