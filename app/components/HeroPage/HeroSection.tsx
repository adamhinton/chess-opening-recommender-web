"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subtext } from "./Subtext";

export function HeroSection() {
	const router = useRouter();
	const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

	const handleNav = (e: React.MouseEvent, href: string) => {
		e.preventDefault();
		if (navigatingTo) return;
		setNavigatingTo(href);
		setTimeout(() => router.push(href), 160);
	};

	return (
		<section className="w-full max-w-4xl mx-auto px-4 pt-8 sm:pt-12 pb-12 sm:pb-16">
			<div className="text-center space-y-6">
				{/* Headline */}
				<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
					AI-Powered Chess Opening
					<br />
					<span className="relative inline-block text-foreground">
						Recommendations
						<span
							aria-hidden="true"
							className="absolute -bottom-1 left-0 h-2 w-full rounded-sm bg-accent-gold/70 sm:-bottom-1.5"
						/>
					</span>
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
					<Badge
						variant="outline"
						className="border-accent-gold/70 text-accent-gold bg-background/75 px-3 py-1"
					>
						Custom ML Model
					</Badge>
					<Badge
						variant="outline"
						className="border-accent-gold/70 text-accent-gold bg-background/75 px-3 py-1"
					>
						200K+ Games Analyzed
					</Badge>
					<Badge
						variant="outline"
						className="border-accent-gold/70 text-accent-gold bg-background/75 px-3 py-1"
					>
						Matrix Factorization
					</Badge>
					<Badge
						variant="outline"
						className="border-accent-gold/70 text-accent-gold bg-background/75 px-3 py-1"
					>
						Real-time Streaming
					</Badge>
				</div>

				{/* CTAs */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
					<Button
						asChild
						size="lg"
						className={`
							w-full sm:w-auto px-8
							bg-accent-gold text-black hover:bg-accent-gold/90
							font-semibold text-lg
							shadow-md shadow-accent-gold/20
							transition-all duration-150
							${
								navigatingTo === "/recommend"
									? "scale-95 opacity-75 shadow-inner"
									: "hover:scale-105 hover:shadow-lg hover:shadow-accent-gold/35"
							}
						`}
					>
						<a href="/recommend" onClick={(e) => handleNav(e, "/recommend")}>
							{navigatingTo === "/recommend" ? (
								<>
									<svg
										className="animate-spin h-4 w-4"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
										/>
									</svg>
									Loading...
								</>
							) : (
								"Analyze My Games"
							)}
						</a>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className={`
							w-full sm:w-auto px-8
							font-semibold text-lg
							border-2 border-accent-gold/65 text-foreground bg-background/85
							transition-all duration-150
							${
								navigatingTo === "/view-recommendations"
									? "scale-95 opacity-75"
									: "hover:border-accent-gold hover:bg-accent-gold/12 hover:scale-105"
							}
						`}
					>
						<a
							href="/view-recommendations"
							onClick={(e) => handleNav(e, "/view-recommendations")}
						>
							{navigatingTo === "/view-recommendations" ? (
								<>
									<svg
										className="animate-spin h-4 w-4"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
										/>
									</svg>
									Loading...
								</>
							) : (
								"View Example Results"
							)}
						</a>
					</Button>
				</div>
			</div>
		</section>
	);
}
