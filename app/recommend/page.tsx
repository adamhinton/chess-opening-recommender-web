"use client";

import { processLichessUsername } from "./actions";
import { useState } from "react";

const Recommend = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [result, setResult] = useState<{
		success: boolean;
		message: string;
		username?: string;
	} | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setResult(null);

		const formData = new FormData(e.currentTarget);

		try {
			const response = await processLichessUsername(formData);
			setResult(response);
		} catch (error) {
			setResult({
				success: false,
				message: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsSubmitting(false);
		}
	};
	return (
		<div className="min-h-screen bg-background text-foreground p-8">
			<div className="max-w-md mx-auto">
				<h1 className="text-2xl font-bold mb-6 text-foreground">
					Chess Opening Recommender
				</h1>

				<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-foreground mb-2"
							>
								Lichess Username
							</label>
							<input
								type="text"
								id="username"
								name="username"
								placeholder="Enter your Lichess username"
								className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
								required
								disabled={isSubmitting}
							/>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Processing..." : "Get Opening Recommendations"}
						</button>
					</form>

					{result && (
						<div
							className={`mt-4 p-4 rounded-md ${
								result.success
									? "bg-secondary text-secondary-foreground"
									: "bg-destructive/10 text-destructive"
							}`}
						>
							<p>{result.message}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Recommend;
