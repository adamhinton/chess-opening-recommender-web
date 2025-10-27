import type { Config } from "tailwindcss";

export default {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./lib/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				/* Primary color: Soft blue */
				primary: {
					50: "hsl(var(--primary-50))",
					100: "hsl(var(--primary-100))",
					200: "hsl(var(--primary-200))",
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				/* Secondary color: Soft orange */
				secondary: {
					50: "hsl(var(--secondary-50))",
					100: "hsl(var(--secondary-100))",
					200: "hsl(var(--secondary-200))",
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				/* Accent color: Soft green */
				accent: {
					50: "hsl(var(--accent-50))",
					100: "hsl(var(--accent-100))",
					200: "hsl(var(--accent-200))",
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				/* Neutral color: Light gray background */
				neutral: {
					DEFAULT: "hsl(var(--neutral))",
				},
				"neutral-text": {
					DEFAULT: "hsl(var(--neutral-text))",
				},
				/* Background System */
				background: {
					// Main app background
					base: "hsl(var(--background-base))",
					// Elevated components like cards
					elevated: "hsl(var(--background-elevated))",
					// Header, navigation areas
					header: "hsl(var(--background-header))",
					// Sidebar, secondary navigation
					sidebar: "hsl(var(--background-sidebar))",
					// Highlighted sections, focus areas
					highlight: "hsl(var(--background-highlight))",
					// Default background
					DEFAULT: "hsl(var(--background))",
				},
				foreground: {
					DEFAULT: "hsl(var(--foreground))",
				},
				/* Additional shadcn/ui compatible colors */
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				border: "hsl(var(--border))",
			},
		},
	},
	plugins: [],
	darkMode: "class",
} satisfies Config;
