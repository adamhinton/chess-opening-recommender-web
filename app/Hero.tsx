import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
      <header className="w-full py-8 flex justify-center items-center bg-primary text-primary-foreground shadow-lg">
        <h1 className="text-4xl font-bold tracking-tight">Chess Opening Recommender</h1>
      </header>
      <section className="hero mt-12 mb-8 px-4 py-12 rounded-2xl shadow-xl bg-gradient-to-r from-primary to-secondary w-full max-w-3xl text-center animate-fade-in">
        <h2 className="text-3xl font-semibold mb-4">Unlock Your Chess Potential</h2>
        <p className="text-lg mb-6">AI-powered recommendations tailored to your style, skill, and goals. Visualize, learn, and win more games.</p>
        <Button size="lg" className="hero-cta">Get Started</Button>
      </section>
      <section className="features w-full max-w-3xl px-4 py-8 mb-8 rounded-xl bg-card text-card-foreground shadow-md">
        <h3 className="text-2xl font-bold mb-4">Features</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <li className="p-4 rounded-lg bg-accent text-accent-foreground shadow-sm">
            <strong>🔍 Personalized Openings</strong><br />
            Get recommendations based on your play history and preferences.
          </li>
          <li className="p-4 rounded-lg bg-accent text-accent-foreground shadow-sm">
            <strong>📊 Win Rate Visualization</strong><br />
            See which openings perform best for you and your opponents.
          </li>
          <li className="p-4 rounded-lg bg-accent text-accent-foreground shadow-sm">
            <strong>🧠 Theory & Traps</strong><br />
            Learn key lines, traps, and strategies for every opening.
          </li>
          <li className="p-4 rounded-lg bg-accent text-accent-foreground shadow-sm">
            <strong>⚡ Fast, Free, Beautiful</strong><br />
            Modern UI, instant results, and no cost.
          </li>
        </ul>
      </section>
      <section className="about w-full max-w-3xl px-4 py-8 mb-8 rounded-xl bg-popover text-popover-foreground shadow-md">
        <h3 className="text-2xl font-bold mb-4">How It Works</h3>
        <ol className="list-decimal list-inside text-left space-y-2">
          <li>Upload or connect your chess games.</li>
          <li>Our AI analyzes your play style and strengths.</li>
          <li>Get a curated list of openings with explanations and win rates.</li>
          <li>Learn, practice, and track your progress.</li>
        </ol>
      </section>
      <footer className="w-full py-6 flex flex-col items-center bg-secondary text-secondary-foreground mt-auto">
        <p className="text-sm">Built with ShadCN, Tailwind, and Next.js. Responsive, accessible, and recruiter-ready.</p>
        <a href="https://github.com/a/chess-opening-recommender-web" className="underline mt-2">View source on GitHub</a>
      </footer>
    </main>
}
