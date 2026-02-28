import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Hero() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
      <header className="w-full py-8 flex justify-center items-center bg-primary text-primary-foreground shadow-lg">
        <Avatar>
          <AvatarImage src="/logo.png" alt="Chess Opening Recommender Logo" />
          <AvatarFallback>COR</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-bold tracking-tight ml-4">Chess Opening Recommender</h1>
      </header>
      <Card className="mt-12 mb-8 w-full max-w-3xl text-center animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl">Unlock Your Chess Potential</CardTitle>
          <CardDescription>AI-powered recommendations tailored to your style, skill, and goals. Visualize, learn, and win more games.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="hero-cta">Get Started</Button>
        </CardContent>
      </Card>
      <Separator className="my-8" />
      <Card className="features w-full max-w-3xl mb-8 text-left">
        <CardHeader>
          <CardTitle className="text-2xl">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <li><strong>🔍 Personalized Openings</strong><br />Get recommendations based on your play history and preferences.</li>
            <li><strong>📊 Win Rate Visualization</strong><br />See which openings perform best for you and your opponents.</li>
            <li><strong>🧠 Theory & Traps</strong><br />Learn key lines, traps, and strategies for every opening.</li>
            <li><strong>⚡ Fast, Free, Beautiful</strong><br />Modern UI, instant results, and no cost.</li>
          </ul>
        </CardContent>
      </Card>
      <Separator className="my-8" />
      <Card className="about w-full max-w-3xl mb-8 text-left">
        <CardHeader>
          <CardTitle className="text-2xl">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Upload or connect your chess games.</li>
            <li>Our AI analyzes your play style and strengths.</li>
            <li>Get a curated list of openings with explanations and win rates.</li>
            <li>Learn, practice, and track your progress.</li>
          </ol>
        </CardContent>
      </Card>
      <footer className="w-full py-6 flex flex-col items-center bg-secondary text-secondary-foreground mt-auto">
        <p className="text-sm">Built with ShadCN, Tailwind, and Next.js. Responsive, accessible, and recruiter-ready.</p>
        <a href="https://github.com/a/chess-opening-recommender-web" className="underline mt-2">View source on GitHub</a>
      </footer>
    </main>
  );
}
