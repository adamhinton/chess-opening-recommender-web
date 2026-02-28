/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

// https://lichess.org/api#tag/Games/operation/apiGamesUser

import { processLichessUsername } from "./actions";
import { useState, useRef, useCallback } from "react";
import { useBeforeUnloadWarning } from "../hooks/useBeforeUnloadWarning";
import { Color } from "../utils/types/stats";
import { AllowedTimeControl } from "../utils/types/lichessTypes";
import { StoredPlayerData } from "../utils/rawOpeningStats/localStorage/statsLocalStorage";
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

	// Todo can delete `result` I think; just commented it out for now
	// const [result, setResult] = useState<{
	// 	success: boolean;
	// 	gameData?: unknown;
	// 	message?: string;
	// } | null>(null);

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
			// setResult(null);
			setProgressState(null);
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
				setProgressState((prev) =>
					prev
						? {
								...prev,
								stage: "Running AI Model",
								estimatedSecondsRemaining: INFERENCE_TIME_SECONDS,
							}
						: null,
				);

				// setResult(response);
			} catch (error) {
				throw Error(
					"Analysis submission failed. ... did you forget to set up the prod secrets?",
				);
				console.error("Error during analysis submission:", error);
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

	return <div>Placeholder</div>;
};

export default Recommend;
