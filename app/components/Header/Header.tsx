// ______________________________________________________________________________
// Header component for Chess Opening Recommender
// 		Contains logo placeholder, navigation, dark mode toggle placeholder, and auth placeholder
// 		Includes social links (LinkedIn, GitHub) in a clean, responsive layout
// 		Built with Tailwind CSS following the project's design system conventions
//
// Features:
// - Responsive design with mobile hamburger menu
// - Dark mode ready (placeholder for now)
// - Authentication placeholder for future implementation
// - Social links (LinkedIn: adamhinton, GitHub: chess-opening-recommender-web)
// - Clean, maintainable code structure
// ______________________________________________________________________________

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Github, Linkedin } from "lucide-react";

export const Header: React.FC = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<header className="bg-background border-b border-border shadow-sm">
			<div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
				{/* Logo and title section */}
				<div className="flex items-center justify-between">
					<Link href="/" className="flex items-center space-x-3 group">
						{/* Logo placeholder */}
						<div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
							<span className="text-primary-foreground font-bold text-sm">
								♟
							</span>
						</div>
						<span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
							Chess Opening Recommender
						</span>
					</Link>

					{/* Mobile menu hamburger button */}
					<button
						onClick={toggleMobileMenu}
						className="sm:hidden p-2 rounded-md hover:bg-accent text-foreground"
						aria-label="Toggle mobile menu"
					>
						{isMobileMenuOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>

				{/* Navigation and controls section */}
				<div
					className={`${
						isMobileMenuOpen ? "flex" : "hidden"
					} sm:flex flex-col sm:flex-row items-center mt-4 sm:mt-0 space-y-4 sm:space-y-0 sm:space-x-6`}
				>
					{/* Page navigation links */}
					<nav className="flex items-center space-x-4">
						<Link
							href="/"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
						>
							About
						</Link>
						<Link
							href="/recommend"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
						>
							Analyze
						</Link>
						<Link
							href="/view-recommendations"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
						>
							Recommendations
						</Link>
					</nav>

					{/* Social links */}
					<div className="flex items-center space-x-3">
						<Link
							href="https://www.linkedin.com/in/adam-hinton"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground hover:text-primary transition-colors duration-200"
							aria-label="LinkedIn profile"
						>
							<Linkedin className="h-5 w-5" />
						</Link>
						<Link
							href="https://github.com/adamhinton/chess-opening-recommender-web"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground hover:text-primary transition-colors duration-200"
							aria-label="GitHub repository"
						>
							<Github className="h-5 w-5" />
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
};
