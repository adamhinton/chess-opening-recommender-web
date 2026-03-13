// A UI component displaying an approximation of how much time remains to stream all Lichess games and return inference on recommended openings.
"use client";

import { useState, useEffect, useRef } from "react";

/**
 * While games are being streamed from Lichess and compiled in to opening stats
 *
 * This is the vast majority of the time taken
 */
type ProgressBarPropsStreaming = {
	numGamesStreamedSoFar: number;
	totalGamesNeeded: number;
	estimatedSecondsRemaining: number;
	stage: "Analyzing Games";
};

/**While inference is currently running
 *
 * This is very quick, takes a couple seconds in dev, not sure about prod yet
 */
type ProgressBarPropsInference = {
	numGamesStreamedSoFar?: never; // avoids confusion between this and the streaming stage where this value is relevant
	totalGamesNeeded: number;
	estimatedSecondsRemaining: number;
	stage: "Running AI Model";
};

type ProgressBarProps = ProgressBarPropsStreaming | ProgressBarPropsInference;

const formatTime = (seconds: number) => {
	if (seconds < 60) return `${Math.round(seconds)}s`;
	const minutes = Math.floor(seconds / 60);
	const secs = Math.round(seconds % 60);
	return `${minutes}m ${secs}s`;
};

/**
 * Displays progress bar estimating time remaining for Lichess game streaming and inference.
 *
 * Throttles displayed text values to update at most every 500ms to avoid jarring flicker.
 * The bar fill still transitions smoothly via CSS.
 */
const ProgressBar = (props: ProgressBarProps) => {
	// Displayed values are throttled — they lag behind props by up to 500ms
	const [displayedGames, setDisplayedGames] = useState(
		props.stage === "Analyzing Games" ? props.numGamesStreamedSoFar : 0,
	);
	const [displayedSeconds, setDisplayedSeconds] = useState(
		props.estimatedSecondsRemaining,
	);
	// Keep a ref so the interval closure always reads the latest props
	const propsRef = useRef(props);
	propsRef.current = props;

	useEffect(() => {
		const interval = setInterval(() => {
			const current = propsRef.current;
			if (current.stage === "Analyzing Games") {
				setDisplayedGames(current.numGamesStreamedSoFar);
			}
			setDisplayedSeconds(current.estimatedSecondsRemaining);
		}, 500);
		return () => clearInterval(interval);
	}, []);

	// Bar fill uses actual (live) props so it animates continuously via CSS transition
	const progressPercentage =
		props.stage === "Analyzing Games"
			? (props.numGamesStreamedSoFar / props.totalGamesNeeded) * 100
			: 100;

	return (
		<div className="w-full max-w-2xl mx-auto p-4 space-y-2">
			{/* Stage and time remaining */}
			<div className="flex justify-between items-center text-sm">
				<span className="font-medium text-foreground">{props.stage}</span>
				<span
					key={displayedSeconds}
					className="text-muted-foreground tabular-nums animate-number-update"
				>
					~{formatTime(displayedSeconds)} remaining
				</span>
			</div>

			{/* Progress bar */}
			<div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
				<div
					className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
					style={{ width: `${Math.min(progressPercentage, 100)}%` }}
				/>
			</div>

			{/* Games count (only during streaming) */}
			{props.stage === "Analyzing Games" && (
				<div className="text-xs text-muted-foreground text-center tabular-nums overflow-hidden">
					<span key={displayedGames} className="inline animate-number-update">
						{displayedGames.toLocaleString()}
					</span>{" "}
					/ ~ {props.totalGamesNeeded.toLocaleString()} games
				</div>
			)}
		</div>
	);
};

export default ProgressBar;
