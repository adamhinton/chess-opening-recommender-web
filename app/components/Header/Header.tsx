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

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Github, Linkedin, User, LogIn } from "lucide-react";

export const Header: React.FC = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
	const authMenuRef = useRef<HTMLDivElement>(null);

	// Mock auth state - replace with real auth later
	const isLoggedIn = false; // Placeholder for auth implementation

	// Close auth menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				authMenuRef.current &&
				!authMenuRef.current.contains(event.target as Node)
			) {
				setIsAuthMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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

					{/* Dark mode toggle placeholder */}
					<div className="flex items-center space-x-2">
						<span className="text-sm text-muted-foreground">Dark</span>
						<div className="w-10 h-6 bg-muted rounded-full p-1 cursor-pointer">
							<div className="w-4 h-4 bg-background rounded-full shadow-sm transition-transform duration-200"></div>
						</div>
					</div>

					{/* Auth section placeholder */}
					<div className="relative" ref={authMenuRef}>
						{isLoggedIn ? (
							// Logged in state placeholder
							<button
								onClick={() => setIsAuthMenuOpen(!isAuthMenuOpen)}
								className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200"
							>
								<User className="h-5 w-5" />
								<span className="hidden sm:inline">Profile</span>
							</button>
						) : (
							// Not logged in state placeholder
							<Link
								href="#"
								className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200"
							>
								<LogIn className="h-5 w-5" />
								<span className="hidden sm:inline">Sign In</span>
							</Link>
						)}

						{/* Auth dropdown placeholder */}
						{isLoggedIn && isAuthMenuOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-1 z-50">
								<Link
									href="#"
									className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-200"
								>
									Profile
								</Link>
								<Link
									href="#"
									className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-200"
								>
									Settings
								</Link>
								<hr className="my-1 border-border" />
								<button
									className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-200"
									onClick={() => {
										// Placeholder for sign out logic
										console.log("Sign out clicked");
									}}
								>
									Sign Out
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};
