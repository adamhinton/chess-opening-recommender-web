import React from "react";

export default function Hero() {
	return (
		<section className="hero">
			<h1 className="hero-title">Chess Opening Recommender</h1>
			<p className="hero-subtitle">
				Find the best chess openings for your style and skill level. Powered by
				AI, tailored for you.
			</p>
			<ul
				className="hero-features"
				style={{ listStyle: "none", padding: 0, margin: "1.5em 0" }}
			>
				<li>🔍 Personalized opening recommendations</li>
				<li>📊 Visualize opening win rates</li>
				<li>🧠 Learn theory and traps</li>
				<li>⚡ Fast, easy, and free</li>
			</ul>
			<div className="hero-cta">
				<button>Get Started</button>
				<a
					href="#how-it-works"
					className="hero-link"
					style={{ marginLeft: "1em", color: "#f4a261" }}
				>
					How It Works
				</a>
			</div>
		</section>
	);
}
