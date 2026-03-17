// ________________
// This is the form the user fills out to request AI analysis
// They enter their Lichess username and preferences for what games to analyze, then submit to start the process
// ________________

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import ProgressBar from "./ProgressBar/ProgressBar";
import DatePicker from "./OptionPickers/DatePicker";
import TimeControlPicker from "./OptionPickers/TimeControlPicker";
import ColorPicker from "./OptionPickers/ColorPicker";
import SeeExampleSection from "./SeeExampleSection";
import NextStepsInformational from "./NextStepsInformational";
import { Color } from "../../utils/types/stats";
import { AllowedTimeControl } from "../../utils/types/lichessTypes";

/**
 * Base props shared across all RecommendForm states.
 * All form state and handlers that don't change based on progress stage.
 * @internal - Use only as part of discriminated union below
 */
interface RecommendFormProps {
	username: string;
	setUsername: (value: string) => void;
	sinceDate: Date | null;
	setSinceDate: (date: Date | null) => void;
	selectedColor: Color;
	setSelectedColor: (color: Color) => void;
	selectedTimeControls: AllowedTimeControl[];
	setSelectedTimeControls: (controls: AllowedTimeControl[]) => void;
	isSubmitting: boolean;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	progressState: ProgressState;
}

/**
 * Discriminated union for progressState.
 * Only fields relevant to each stage are included.
 */
type ProgressState =
	// Waiting for user to complete and submit form
	| { stage: "Idle" }
	// Frontend is getting Lichess games and assembling stats
	| {
			stage: "Analyzing Games";
			numGamesProcessed: number;
			totalGamesNeeded: number;
			estimatedSecondsRemaining: number;
	  }
	// Huggingface space has all data and is running the AI model to generate recommendations
	| {
			stage: "Running AI Model";
			totalGamesNeeded: number;
			estimatedSecondsRemaining: number;
	  };

/**Page where user enters in their lichess username and preferences for what sort of forms to be analyzed.
 *
 * In props, progressState is a discriminated union based on three stages:
 *
 * 1. Idle (user is filling out form, no progress to show)
 * 2. Analyzing Games (frontend is streaming user's lichess games, processing them, and assembling opening stats - show progress based on number of games processed so far vs total needed)
 * 3. Running AI Model (frontend has sent all data to Huggingface space and is waiting for it to run the AI model and return recommendations - show progress based on estimated time remaining)
 */
const RecommendForm = ({
	username,
	setUsername,
	sinceDate,
	setSinceDate,
	selectedColor,
	setSelectedColor,
	selectedTimeControls,
	setSelectedTimeControls,
	isSubmitting,
	progressState,
	onSubmit,
}: RecommendFormProps) => {
	return (
		<div className="w-full space-y-6">
			{/* Saved Progress section is handled by parent */}

			{/* Section: See Example First */}
			<SeeExampleSection isDisabled={isSubmitting} />

			<Separator />

			<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
				<form onSubmit={onSubmit} className="space-y-5">
					{/* Section: Your Lichess Account */}
					<section>
						<div className="flex items-center gap-2 mb-2">
							<Label htmlFor="username" className="text-base font-semibold">
								Lichess Username
							</Label>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
										aria-label="More information"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="w-3 h-3"
										>
											<path
												fillRule="evenodd"
												d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</TooltipTrigger>
								<TooltipContent>
									Lichess is the world&apos;s most popular 100% free (and
									ad-free) open source chess platform
								</TooltipContent>
							</Tooltip>
						</div>
						<Input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Hikaru"
							required
							disabled={isSubmitting}
						/>
					</section>

					<Separator />

					{/* Section: Analysis Settings */}
					<section>
						<h2 className="text-base font-semibold mb-4">Analysis Settings</h2>

						{/* Date Picker */}
						<div className="mb-6">
							<DatePicker
								sinceDate={sinceDate}
								onDateChange={setSinceDate}
								isDisabled={isSubmitting}
							/>
						</div>

						<Separator />

						{/* Color Picker and Time Control Picker in single column */}
						<div className="space-y-6">
							<div>
								<div className="flex items-center gap-2 mb-3">
									<Label className="text-sm font-medium">
										Play as (choose one)
									</Label>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
												aria-label="More information"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													className="w-3 h-3"
												>
													<path
														fillRule="evenodd"
														d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
														clipRule="evenodd"
													/>
												</svg>
											</button>
										</TooltipTrigger>
										<TooltipContent>
											Openings differ for White (who moves first) vs Black (who
											responds). Choose which color you want to improve.
										</TooltipContent>
									</Tooltip>
								</div>
								<ColorPicker
									selectedColor={selectedColor}
									onColorChange={setSelectedColor}
									isDisabled={isSubmitting}
								/>
							</div>

							<Separator />

							<div>
								<TimeControlPicker
									selectedTimeControls={selectedTimeControls}
									onTimeControlChange={setSelectedTimeControls}
									isDisabled={isSubmitting}
								/>
							</div>
						</div>
					</section>

					<Separator />

					{/* Displays info about what happens after submitting: 1. Compile opening stats, 2. AI analyzes your patterns, 3. Get personalized recommendations */}
					<NextStepsInformational isSubmitting={isSubmitting} />

					<Button
						type="submit"
						disabled={
							isSubmitting ||
							selectedTimeControls.length === 0 ||
							!username.trim()
						}
						className="w-full py-6 text-base font-semibold"
						size="lg"
					>
						{isSubmitting ? (
							<>
								<svg
									className="animate-spin h-4 w-4 mr-2"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									/>
								</svg>
								Analyzing...
							</>
						) : (
							"Get AI Opening Suggestions"
						)}
					</Button>

					{selectedTimeControls.length === 0 && !isSubmitting && (
						<p className="text-sm text-destructive mt-2">
							Please select at least one time control
						</p>
					)}
				</form>

				{/* Progress Bar */}
				{progressState.stage !== "Idle" && (
					<div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
						<Alert className="mt-3">
							<AlertDescription className="flex gap-2 items-start">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 shrink-0 text-amber-500 mt-0.5"
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
							</AlertDescription>
						</Alert>
					</div>
				)}
			</div>
		</div>
	);
};

export default RecommendForm;
