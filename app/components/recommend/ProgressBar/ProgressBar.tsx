// A UI component displaying an approximation of how much time remains to stream all Lichess games and return inference on recommended openings.

type ProgressBarPropsStreaming = {
	numGamesStreamedSoFar: number;
	totalGamesNeeded: number;
	estimatedSecondsRemaining: number;
	stage: "Analyzing Games";
};

type ProgressBarPropsInference = {
	totalGamesNeeded: number;
	estimatedSecondsRemaining: number;
	stage: "Running AI Model";
};

type ProgressBarProps = ProgressBarPropsStreaming | ProgressBarPropsInference;

const formatTime = (seconds: number): string => {
	if (seconds < 60) return `${Math.round(seconds)}s`;
	const minutes = Math.floor(seconds / 60);
	const secs = Math.round(seconds % 60);
	return `${minutes}m ${secs}s`;
};

/**
 * Displays progress bar estimating time remaining for Lichess game streaming and inference.
 *
 * Accounts for games remaining to stream, streaming speed, and inference time.
 */
const ProgressBar = (props: ProgressBarProps) => {
	const progressPercentage =
		props.stage === "Analyzing Games"
			? (props.numGamesStreamedSoFar / props.totalGamesNeeded) * 100
			: 100; // Show full bar during inference

	return (
		<div className="w-full max-w-2xl mx-auto p-4 space-y-2">
			{/* Stage and time remaining */}
			<div className="flex justify-between items-center text-sm">
				<span className="font-medium text-foreground">{props.stage}</span>
				<span className="text-muted-foreground">
					~{formatTime(props.estimatedSecondsRemaining)} remaining
				</span>
			</div>

			{/* Progress bar */}
			<div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
				<div
					className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
					style={{ width: `${Math.min(progressPercentage, 100)}%` }}
				/>
			</div>

			{/* Games count (only during streaming) */}
			{props.stage === "Analyzing Games" && (
				<div className="text-xs text-muted-foreground text-center">
					{props.numGamesStreamedSoFar.toLocaleString()} / ~{" "}
					{props.totalGamesNeeded.toLocaleString()} games
				</div>
			)}
		</div>
	);
};

export default ProgressBar;
