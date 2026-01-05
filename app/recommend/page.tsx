"use client";

// https://lichess.org/api#tag/Games/operation/apiGamesUser

import { processLichessUsername } from "./actions";
import { useState, useRef } from "react";
import ProgressBar from "../components/recommend/ProgressBar/ProgressBar";
import DatePicker from "../components/recommend/DatePicker";
import ColorPicker from "../components/recommend/ColorPicker";
import TimeControlPicker from "../components/recommend/TimeControlPicker";
import { useBeforeUnloadWarning } from "../hooks/useBeforeUnloadWarning";
import { Color } from "../utils/types/stats";
import { AllowedTimeControl } from "../utils/types/lichess";

const Recommend = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [sinceDate, setSinceDate] = useState<Date | null>(null);
	const [isDatePickerExpanded, setIsDatePickerExpanded] = useState(false);
	const [selectedColor, setSelectedColor] = useState<Color>("white");
	const [selectedTimeControls, setSelectedTimeControls] = useState<
		AllowedTimeControl[]
	>(["blitz", "rapid", "classical"]);

	// Todo clean this up with tagged unions; just doing this for testing
	const [result, setResult] = useState<{
		success: boolean;
		gameData?: unknown;
		message?: string;
	} | null>(null);

	// Progress tracking
	const [progressState, setProgressState] = useState<{
		stage: "Analyzing Games" | "Running AI Model";
		numGamesProcessed: number;
		totalGamesNeeded: number;
		estimatedSecondsRemaining: number;
	} | null>(null);

	const startTimeRef = useRef<number>(0);
	const INFERENCE_TIME_SECONDS = 60; // Estimating duration of model inference phase

	// Warn user before leaving during processing
	useBeforeUnloadWarning(isSubmitting);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setResult(null);
		setProgressState(null);
		setIsDatePickerExpanded(false);
		startTimeRef.current = Date.now();

		const formData = new FormData();
		formData.append(
			"username",
			(e.currentTarget.elements.namedItem("username") as HTMLInputElement).value
		);
		formData.append("color", selectedColor);
		formData.append("timeControls", JSON.stringify(selectedTimeControls));

		if (sinceDate) {
			formData.append("sinceDate", sinceDate.toISOString());
		}

		// Start with an initial progress state; the action will quickly set a better
		// denominator once it fetches the user profile.
		setProgressState({
			stage: "Analyzing Games",
			numGamesProcessed: 0,
			totalGamesNeeded: 1,
			estimatedSecondsRemaining: 0,
		});

		try {
			const response = await processLichessUsername(
				formData,
				undefined, // onStatusUpdate - not using this yet
				(update) => {
					// Handle progress updates from the action
					const { numGamesProcessed, totalGamesNeeded } = update;
					const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
					const gamesPerSecond = numGamesProcessed / elapsedSeconds || 0;
					const gamesRemaining = totalGamesNeeded - numGamesProcessed;
					const estimatedStreamingTimeRemaining =
						gamesPerSecond > 0 ? gamesRemaining / gamesPerSecond : 0;

					setProgressState({
						stage: "Analyzing Games",
						numGamesProcessed,
						totalGamesNeeded,
						estimatedSecondsRemaining:
							estimatedStreamingTimeRemaining + INFERENCE_TIME_SECONDS,
					});
				}
			);

			// Switch to inference stage
			setProgressState((prev) =>
				prev
					? {
							...prev,
							stage: "Running AI Model",
							estimatedSecondsRemaining: INFERENCE_TIME_SECONDS,
					  }
					: null
			);

			setResult(response);
		} catch (error) {
			setResult({
				success: false,
				message: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsSubmitting(false);
			setProgressState(null);
		}
	};
	return (
		<div className="min-h-screen bg-background text-foreground p-8">
			<div className="max-w-md mx-auto">
				<h1 className="text-2xl font-bold mb-6 text-foreground">
					Chess Opening Recommender
				</h1>

				<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-6">
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

						{/* Divider */}
						<div className="h-[2px] bg-muted-foreground/20" />

						{/* Date Picker */}
						<DatePicker
							sinceDate={sinceDate}
							onDateChange={setSinceDate}
							isDisabled={isSubmitting}
							isExpanded={isDatePickerExpanded}
							onToggleExpanded={setIsDatePickerExpanded}
						/>

						{/* Divider */}
						<div className="h-[2px] bg-muted-foreground/20" />

						{/* Color Picker and Time Control Picker */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-foreground mb-2">
									Color
								</label>
								<ColorPicker
									selectedColor={selectedColor}
									onColorChange={setSelectedColor}
									isDisabled={isSubmitting}
								/>
							</div>

							<div>
								<TimeControlPicker
									selectedTimeControls={selectedTimeControls}
									onTimeControlChange={setSelectedTimeControls}
									isDisabled={isSubmitting}
								/>
							</div>
						</div>

						{/* Divider */}
						<div className="h-[2px] bg-muted-foreground/20" />

						<button
							type="submit"
							disabled={isSubmitting || selectedTimeControls.length === 0}
							className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Processing..." : "Get AI Opening Suggestions"}
						</button>
						{selectedTimeControls.length === 0 && !isSubmitting && (
							<p className="text-sm text-destructive mt-2">
								Please select at least one time control
							</p>
						)}
					</form>

					{/* Progress Bar */}
					{progressState && (
						<div className="mt-6">
							{progressState.stage === "Analyzing Games" ? (
								<ProgressBar
									stage="Analyzing Games"
									numGamesStreamedSoFar={progressState.numGamesProcessed}
									totalGamesNeeded={progressState.totalGamesNeeded}
									estimatedSecondsRemaining={
										progressState.estimatedSecondsRemaining
									}
								/>
							) : (
								<ProgressBar
									stage="Running AI Model"
									totalGamesNeeded={progressState.totalGamesNeeded}
									estimatedSecondsRemaining={
										progressState.estimatedSecondsRemaining
									}
								/>
							)}

							{/* Warn that closing the page will pause analysis, though user can resume later*/}
							<div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 flex-shrink-0 text-amber-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>
									Closing this page will pause analysis. Your progress is saved
									automatically—you can resume anytime.
								</span>
							</div>
						</div>
					)}

					{result && (
						<div
							className={`mt-4 p-4 rounded-md ${
								result.success
									? "bg-secondary text-secondary-foreground"
									: "bg-destructive/10 text-destructive"
							}`}
						>
							<p>{result.message}</p>
							{result.success && !!result.gameData && (
								<p className="text-sm mt-2 opacity-80">
									Ready to analyze your games and recommend openings!
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Recommend;
