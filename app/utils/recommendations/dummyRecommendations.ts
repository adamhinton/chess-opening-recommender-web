// =========================================
// Dummy Recommendations Generator
//
// Generates plausible test recommendations so we can develop and test
// the recommendations display UI without running the full inference pipeline.
//
// Uses real opening names from our model artifacts.
//
// This isn't intended to go to prod, but it's not a big deal if it does.
//
// TODO can delete this, along with /dev-utils, after testing and development
// =========================================

import {
	Color,
	InferencePredictResponse,
	SingleOpeningRecommendation,
} from "../types/stats";

/**
 * A curated list of 50 plausible opening names with ECO codes
 * Selected to represent a variety of ECO categories (A-E)
 */
const DUMMY_OPENINGS: Array<{ name: string; eco: string }> = [
	// A openings (Flank openings)
	{ name: "English Opening: King's English Variation", eco: "A20" },
	{ name: "English Opening: Symmetrical Variation", eco: "A30" },
	{ name: "Réti Opening: Advance Variation", eco: "A09" },
	{ name: "Bird Opening: Dutch Variation", eco: "A03" },
	{ name: "Nimzo-Larsen Attack: Classical Variation", eco: "A01" },
	{ name: "Polish Opening: King's Indian Variation", eco: "A00" },
	{ name: "Hungarian Opening: Catalan Formation", eco: "A00" },
	{ name: "English Opening: Anglo-Indian Defense", eco: "A15" },
	{ name: "Réti Opening: Anglo-Slav Variation", eco: "A12" },
	{ name: "King's Indian Attack: Yugoslav Variation", eco: "A07" },

	// B openings (Sicilian, etc.)
	{ name: "Sicilian Defense: Najdorf Variation", eco: "B90" },
	{ name: "Sicilian Defense: Dragon Variation", eco: "B70" },
	{ name: "Sicilian Defense: Scheveningen Variation", eco: "B80" },
	{ name: "Caro-Kann Defense: Classical Variation", eco: "B18" },
	{ name: "Pirc Defense: Austrian Attack", eco: "B09" },
	{ name: "Alekhine Defense: Modern Variation", eco: "B04" },
	{ name: "Scandinavian Defense: Modern Variation", eco: "B01" },
	{ name: "Sicilian Defense: Accelerated Dragon", eco: "B35" },
	{ name: "Sicilian Defense: Taimanov Variation", eco: "B46" },
	{ name: "Modern Defense: Standard Line", eco: "B06" },

	// C openings (Open games, French, Ruy Lopez)
	{ name: "Ruy Lopez: Berlin Defense", eco: "C65" },
	{ name: "Italian Game: Giuoco Piano", eco: "C53" },
	{ name: "French Defense: Winawer Variation", eco: "C15" },
	{ name: "Scotch Game: Classical Variation", eco: "C45" },
	{ name: "King's Gambit Accepted: Bishop's Gambit", eco: "C33" },
	{ name: "Vienna Game: Vienna Gambit", eco: "C29" },
	{ name: "Ruy Lopez: Marshall Attack", eco: "C89" },
	{ name: "French Defense: Advance Variation", eco: "C02" },
	{ name: "Italian Game: Two Knights Defense", eco: "C55" },
	{ name: "Ruy Lopez: Closed, Breyer Defense", eco: "C94" },

	// D openings (Queen's Gambit, Slav)
	{ name: "Queen's Gambit Declined: Orthodox Defense", eco: "D60" },
	{ name: "Slav Defense: Czech Variation", eco: "D17" },
	{ name: "Queen's Gambit Accepted: Classical Defense", eco: "D26" },
	{ name: "Grünfeld Defense: Exchange Variation", eco: "D85" },
	{ name: "Semi-Slav Defense: Meran Variation", eco: "D47" },
	{ name: "Tarrasch Defense: Classical Variation", eco: "D34" },
	{ name: "Queen's Gambit Declined: Cambridge Springs Defense", eco: "D52" },
	{ name: "London System", eco: "D02" },
	{ name: "Catalan Opening: Closed", eco: "D38" },
	{ name: "Neo-Grünfeld Defense: Classical Variation", eco: "D78" },

	// E openings (Indian defenses)
	{ name: "King's Indian Defense: Classical Variation", eco: "E92" },
	{ name: "Nimzo-Indian Defense: Classical Variation", eco: "E32" },
	{ name: "Queen's Indian Defense: Fianchetto Variation", eco: "E15" },
	{ name: "Bogo-Indian Defense: Exchange Variation", eco: "E11" },
	{ name: "King's Indian Defense: Sämisch Variation", eco: "E80" },
	{ name: "Nimzo-Indian Defense: Sämisch Variation", eco: "E24" },
	{ name: "King's Indian Defense: Four Pawns Attack", eco: "E76" },
	{ name: "King's Indian Defense: Fianchetto Variation", eco: "E60" },
	{ name: "Nimzo-Indian Defense: Hübner Variation", eco: "E41" },
	{ name: "Catalan Opening: Open Defense", eco: "E04" },
];

/**
 * Generate a random predicted score between 0.4 and 0.7
 * (reasonable range for opening recommendations)
 */
function randomScore() {
	return Math.random() * 0.3 + 0.4; // 0.4 to 0.7
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/**
 * Generate dummy recommendations for testing
 *
 * @param count Number of recommendations to generate (default 50, max 50)
 * @param color Optional color to include in metadata
 */
export function generateDummyRecommendations(
	count: number = 50,
	color: Color = "white"
): InferencePredictResponse {
	const numToGenerate = Math.min(count, DUMMY_OPENINGS.length);

	// Shuffle and take the first N openings
	const selectedOpenings = shuffleArray(DUMMY_OPENINGS).slice(0, numToGenerate);

	// Generate recommendations with random scores
	const recommendations: SingleOpeningRecommendation[] = selectedOpenings.map(
		(opening) => ({
			opening_name: opening.name,
			eco: opening.eco,
			predicted_score: randomScore(),
		})
	);

	// Sort by predicted score (highest first)
	recommendations.sort((a, b) => b.predicted_score - a.predicted_score);

	// Calculate stats
	const scores = recommendations.map((r) => r.predicted_score);
	const minScore = Math.min(...scores);
	const maxScore = Math.max(...scores);
	const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;

	return {
		request_id: `dummy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		side: color,
		recommendations,
		stats: {
			num_openings_total: numToGenerate,
			num_openings_played: Math.floor(numToGenerate * 0.6), // Assume 60% played
			num_openings_unplayed: Math.ceil(numToGenerate * 0.4),
			predicted_min: minScore,
			predicted_max: maxScore,
			predicted_mean: meanScore,
		},
		model_loaded: true,
		model_version: "dummy-1.0.0",
	};
}

/**
 * Generate multiple sets of dummy recommendations for different "users"
 * Useful for testing the recommendations selector UI
 */
export function generateMultipleDummyRecommendationSets(): Array<{
	username: string;
	color: Color;
	recommendations: InferencePredictResponse;
}> {
	return [
		{
			username: "magnuscarlsen",
			color: "white",
			recommendations: generateDummyRecommendations(35, "white"),
		},
		{
			username: "magnuscarlsen",
			color: "black",
			recommendations: generateDummyRecommendations(40, "black"),
		},
		{
			username: "hikaru",
			color: "white",
			recommendations: generateDummyRecommendations(45, "white"),
		},
		{
			username: "gothamchess",
			color: "black",
			recommendations: generateDummyRecommendations(30, "black"),
		},
	];
}
