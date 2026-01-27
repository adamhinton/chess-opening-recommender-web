"use client";

// https://lichess.org/api#tag/Games/operation/apiGamesUser

import { processLichessUsername } from "./actions";
import { useState, useRef, useCallback } from "react";
import ProgressBar from "../components/recommend/ProgressBar/ProgressBar";
import DatePicker from "../components/recommend/OptionPickers/DatePicker";
import TimeControlPicker from "../components/recommend/OptionPickers/TimeControlPicker";
import SavedProgress from "../components/recommend/SavedProgress/SavedProgress";
import { useBeforeUnloadWarning } from "../hooks/useBeforeUnloadWarning";
import { Color } from "../utils/types/stats";
import { AllowedTimeControl } from "../utils/types/lichessTypes";
import { StoredPlayerData } from "../utils/rawOpeningStats/localStorage/statsLocalStorage";
import ColorPicker from "../components/recommend/OptionPickers/ColorPicker";
import { useRouter } from "next/navigation";
import { generateDummyRecommendations } from "../utils/recommendations/dummyRecommendations";
import { RecommendationsLocalStorageUtils } from "../utils/recommendations/recommendationsLocalStorage/recommendationsLocalStorage";
import ToolTip from "../components/ToolTips/ToolTip";
import NextStepsInformational from "../components/recommend/NextStepsInformational";

const Recommend = () => {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [username, setUsername] = useState("");
	const [sinceDate, setSinceDate] = useState<Date | null>(null);
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
			setResult(null);
			setProgressState(null);

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
				const response = await processLichessUsername(
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
				setProgressState((prev) =>
					prev
						? {
								...prev,
								stage: "Running AI Model",
								estimatedSecondsRemaining: INFERENCE_TIME_SECONDS,
							}
						: null,
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

	/**
	 * Handle viewing stats for a finished player.
	 */
	const handleViewStats = (playerData: StoredPlayerData) => {
		console.log("View stats for:", playerData.playerData.lichessUsername);
		router.push("view-recommendations");
	};

	/**
	 * Handle demo button click
	 *
	 * Generate dummy recommendations and show them to the user
	 *
	 * Great for e.g. recruiters who don't care about chess and just want to see how this works
	 */
	const handleViewDemo = () => {
		const dummyUsername = "example-player";
		const dummyColor: Color = "white";
		const dummyRecommendations = generateDummyRecommendations(50, dummyColor);

		const saveResult = RecommendationsLocalStorageUtils.saveRecommendations(
			dummyUsername,
			dummyColor,
			dummyRecommendations,
		);

		if (saveResult.success) {
			console.log(
				`[Demo] Saved dummy recommendations for ${dummyUsername} (${dummyColor})`,
			);
			// Redirect to view-recommendations page
			router.push("/view-recommendations");
		} else {
			console.error(`[Demo] Failed to save: ${saveResult.error}`);
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground p-8">
			<div className="max-w-md mx-auto">
				<h1 className="text-2xl font-bold mb-6 text-foreground">
					Chess Opening Recommender
				</h1>

				{/* Saved Progress - shows if there are saved players */}
				<SavedProgress
					key={savedProgressKey}
					onResumePlayer={handleResumePlayer}
					onViewStats={handleViewStats}
					isDisabled={isSubmitting}
				/>
				<Divider />

				{/* Section: See Example First */}
				<section className="mb-6 bg-secondary/30 border border-secondary rounded-lg p-4">
					<h2 className="text-lg font-semibold text-foreground mb-2">
						See Example First
					</h2>
					<p className="text-sm text-muted-foreground mb-3">
						Perfect if you don't play chess—no signup needed. See what
						AI-generated opening recommendations look like.
					</p>
					<button
						onClick={handleViewDemo}
						disabled={isSubmitting}
						className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2"
					>
						Try Example
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="w-4 h-4"
						>
							<path
								fillRule="evenodd"
								d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</section>

				<Divider />

				<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Section: Your Lichess Account */}
						<section>
							<div className="flex items-center gap-2 mb-3">
								<h2 className="text-lg font-semibold text-foreground">
									Lichess Username
									<ToolTip message="Lichess is the world's most popular 100% free (and ad-free) open source chess platform" />
								</h2>
							</div>
							<div>
								<div className="flex items-center gap-2 mb-2"></div>
								<input
									type="text"
									id="username"
									name="username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Hikaru"
									className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
									required
									disabled={isSubmitting}
								/>
							</div>
						</section>

						<Divider />

						{/* Section: Analysis Settings */}
						<section>
							<h2 className="text-lg font-semibold text-foreground mb-4">
								Analysis Settings
							</h2>

							{/* Date Picker */}
							<div className="mb-6">
								<DatePicker
									sinceDate={sinceDate}
									onDateChange={setSinceDate}
									isDisabled={isSubmitting}
								/>
							</div>

							<Divider />

							{/* Color Picker and Time Control Picker in single column */}
							<div className="space-y-6">
								<div>
									<div className="flex items-center gap-2 mb-3">
										<label className="block text-sm font-medium text-foreground">
											Play as (choose one)
										</label>
										<ToolTip message="Openings differ for White (who moves first) vs Black (who responds). Choose which color you want to improve." />
									</div>
									<ColorPicker
										selectedColor={selectedColor}
										onColorChange={setSelectedColor}
										isDisabled={isSubmitting}
									/>
								</div>

								<Divider />

								<div>
									<TimeControlPicker
										selectedTimeControls={selectedTimeControls}
										onTimeControlChange={setSelectedTimeControls}
										isDisabled={isSubmitting}
									/>
								</div>
							</div>
						</section>

						<Divider />

						{/* Displays info about what happens after submitting: 1. Compile opening stats, 2. AI analyzes your patterns, 3. Get personalized recommendations */}
						<NextStepsInformational isSubmitting={isSubmitting} />

						<button
							type="submit"
							disabled={
								isSubmitting ||
								selectedTimeControls.length === 0 ||
								!username.trim()
							}
							className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
				</div>
			</div>
		</div>
	);
};

export default Recommend;

/**Vertical dividing line between sections */
const Divider = () => <div className="h-[2px] bg-muted-foreground/50 my-6" />;
