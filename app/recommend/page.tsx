// ________________
// This is the form the user fills out to request AI analysis
// They enter their Lichess username and preferences for what games to analyze, then submit to start the process
// ________________

"use client";

// https://lichess.org/api#tag/Games/operation/apiGamesUser

import { processLichessUsername } from "./actions";
import { useState, useRef, useCallback } from "react";
import SavedProgress from "../components/recommend/SavedProgress/SavedProgress";
import RecommendForm from "../components/recommend/RecommendForm";
import { useBeforeUnloadWarning } from "../hooks/useBeforeUnloadWarning";
import { Color } from "../utils/types/stats";
import { AllowedTimeControl } from "../utils/types/lichessTypes";
import { useRouter } from "next/navigation";

const Recommend = () => {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [username, setUsername] = useState("");
	const [sinceDate, setSinceDate] = useState<Date | null>(null);
	const [selectedColor, setSelectedColor] = useState<Color>("white");
	const [selectedTimeControls, setSelectedTimeControls] = useState<
		AllowedTimeControl[]
	>(["blitz", "rapid", "classical"]);

	// Progress tracking
	const [progressState, setProgressState] = useState<
		| { stage: "Idle" }
		| {
				stage: "Analyzing Games";
				numGamesProcessed: number;
				totalGamesNeeded: number;
				estimatedSecondsRemaining: number;
		  }
		| {
				stage: "Running AI Model";
				totalGamesNeeded: number;
				estimatedSecondsRemaining: number;
		  }
	>({ stage: "Idle" });

	const startTimeRef = useRef<number>(0);
	/**Estimated duration of model inference phase */
	const INFERENCE_TIME_SECONDS = 10;
	// Key to force SavedProgress to refresh after submit completes
	const [savedProgressKey, setSavedProgressKey] = useState(0);

	// Warn user before leaving during processing
	useBeforeUnloadWarning(isSubmitting);

	/**
	 * Core submission logic - can be called from form submit or resume button.
	 * Takes explicit params so resume can pass saved values directly.
	 */
	const submitAnalysis = useCallback(
		async (params: {
			username: string;
			color: Color;
			timeControls: AllowedTimeControl[];
			sinceDate: Date | null;
		}) => {
			setIsSubmitting(true);
			// setResult(null);
			setProgressState({ stage: "Idle" });
			startTimeRef.current = Date.now();

			const formData = new FormData();
			formData.append("username", params.username);
			formData.append("color", params.color);
			formData.append("timeControls", JSON.stringify(params.timeControls));

			if (params.sinceDate) {
				formData.append("sinceDate", params.sinceDate.toISOString());
			}

			// Start with an initial progress state
			setProgressState({
				stage: "Analyzing Games",
				numGamesProcessed: 0,
				totalGamesNeeded: 1,
				estimatedSecondsRemaining: 0,
			});

			try {
				await processLichessUsername(
					formData,
					undefined, // onStatusUpdate - not using this yet
					(update) => {
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
					},
				);

				// Switch to inference stage
				setProgressState({
					stage: "Running AI Model",
					totalGamesNeeded: 1,
					estimatedSecondsRemaining: INFERENCE_TIME_SECONDS,
				});
				// setResult(response);
			} catch (error) {
				throw Error(
					"Analysis submission failed. ... did you forget to set up the prod secrets?",
				);
				console.error("Error during analysis submission:", error);
			} finally {
				setIsSubmitting(false);
				setProgressState({ stage: "Idle" });
				// Refresh SavedProgress to show updated data
				setSavedProgressKey((k) => k + 1);
			}
		},
		[INFERENCE_TIME_SECONDS],
	);

	/**
	 * Handle form submission from the form itself.
	 */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await submitAnalysis({
			username,
			color: selectedColor,
			timeControls: selectedTimeControls,
			sinceDate,
		});
		router.push("/view-recommendations");
	};

	/**
	 * Handle resume from SavedProgress component.
	 * Sets form state and immediately submits with saved values.
	 */
	const handleResumePlayer = useCallback(
		(params: {
			username: string;
			color: Color;
			timeControls: AllowedTimeControl[];
		}) => {
			// Update form state to reflect what we're resuming
			setUsername(params.username);
			setSelectedColor(params.color);
			setSelectedTimeControls(params.timeControls);
			setSinceDate(null); // Resume from where we left off, no date filter

			// Submit immediately with the saved values
			submitAnalysis({
				username: params.username,
				color: params.color,
				timeControls: params.timeControls,
				sinceDate: null,
			});
		},
		[submitAnalysis],
	);

	/**See saved stats for an already-analyzed player */
	const handleViewStats = () => {
		router.push("view-recommendations");
	};

	return (
		<main className="min-h-screen bg-background text-foreground px-4 py-10 sm:px-6 lg:px-8">
			<div className="max-w-2xl mx-auto space-y-6">
				<header>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Request Opening Recommendations
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Enter your Lichess username and preferences to get AI-powered
						opening suggestions.
					</p>
				</header>

				{/* Saved Progress - shows if there are saved players */}
				<SavedProgress
					key={savedProgressKey}
					onResumePlayer={handleResumePlayer}
					onViewStats={handleViewStats}
					isDisabled={isSubmitting}
				/>

				{/* Recommend Form - user requests inference here */}
				<RecommendForm
					username={username}
					setUsername={setUsername}
					sinceDate={sinceDate}
					setSinceDate={setSinceDate}
					selectedColor={selectedColor}
					setSelectedColor={setSelectedColor}
					selectedTimeControls={selectedTimeControls}
					setSelectedTimeControls={setSelectedTimeControls}
					isSubmitting={isSubmitting}
					progressState={progressState}
					onSubmit={handleSubmit}
				/>
			</div>
		</main>
	);
};

export default Recommend;
