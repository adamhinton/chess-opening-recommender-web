// ________________
// This is the form the user fills out to request AI analysis
// They enter their Lichess username and preferences for what games to analyze, then submit to start the process
// ________________

"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
 *
 * 2. Analyzing Games (frontend is streaming user's lichess games, processing them, and assembling opening stats - show progress based on number of games processed so far vs total needed)
 *
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
	const progressCardRef = useRef<HTMLDivElement>(null);

	// Scroll to the progress card whenever analysis kicks off (form submit or resume)
	useEffect(() => {
		if (progressState.stage !== "Idle") {
			progressCardRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
			});
		}
	}, [progressState.stage]);

	return (
		<div className="w-full space-y-5">
			{/* Saved Progress section is handled by parent */}

			{/* Section: See Example First — compact amber banner */}
			<SeeExampleSection isDisabled={isSubmitting} />

			{/* Main form card */}
			<Card>
				<CardHeader className="pb-2 border-b border-border">
					<CardTitle className="text-xl font-bold">
						Configure Your Analysis
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Fill in the fields below to generate personalized opening
						recommendations.
					</p>
				</CardHeader>
				<CardContent className="pt-6">
					<form onSubmit={onSubmit} noValidate>
						{/* ─── Step 1: Lichess Account ─────────────────────────────── */}
						<section
							aria-labelledby="step-username-heading"
							className="space-y-3"
						>
							<StepHeader step={1} title="Lichess Account" />

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="username" className="text-sm font-medium">
										Lichess Username
									</Label>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
												aria-label="About Lichess"
											>
												<InfoIcon />
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
									placeholder="e.g. Hikaru"
									autoComplete="off"
									autoCapitalize="none"
									spellCheck={false}
									required
									disabled={isSubmitting}
									aria-required="true"
								/>
							</div>
						</section>

						<Separator className="my-6" />

						{/* ─── Step 2: Date Range ──────────────────────────────────── */}
						<section aria-labelledby="step-date-heading" className="space-y-3">
							<StepHeader step={2} title="Date Range" />
							<DatePicker
								sinceDate={sinceDate}
								onDateChange={setSinceDate}
								isDisabled={isSubmitting}
							/>
						</section>

						<Separator className="my-6" />

						{/* ─── Step 3: Piece Color ─────────────────────────────────── */}
						<fieldset className="space-y-3 border-none p-0 m-0">
							<legend className="w-full">
								<div className="flex items-center gap-2">
									<StepHeader step={3} title="Piece Color" />
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
												aria-label="Why piece color matters"
											>
												<InfoIcon />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											Openings differ for White (who moves first) vs Black (who
											responds). Choose the color you want to improve.
										</TooltipContent>
									</Tooltip>
								</div>
							</legend>
							<ColorPicker
								selectedColor={selectedColor}
								onColorChange={setSelectedColor}
								isDisabled={isSubmitting}
							/>
						</fieldset>

						<Separator className="my-6" />

						{/* ─── Step 4: Time Controls ───────────────────────────────── */}
						<fieldset className="space-y-3 border-none p-0 m-0">
							<legend className="w-full">
								<StepHeader step={4} title="Time Controls" />
							</legend>
							<TimeControlPicker
								selectedTimeControls={selectedTimeControls}
								onTimeControlChange={setSelectedTimeControls}
								isDisabled={isSubmitting}
								showLabel={false}
							/>
							{selectedTimeControls.length === 0 && !isSubmitting && (
								<p
									className="text-sm text-destructive"
									role="alert"
									aria-live="polite"
								>
									Select at least one time control to continue.
								</p>
							)}
						</fieldset>

						<Separator className="my-6" />

						{/* Displays info about what happens after submitting: 1. Compile opening stats, 2. AI analyzes your patterns, 3. Get personalized recommendations */}
						<NextStepsInformational isSubmitting={isSubmitting} />

						{/* Submit button — gold accent, full width, prominent */}
						<Button
							type="submit"
							disabled={
								isSubmitting ||
								selectedTimeControls.length === 0 ||
								!username.trim()
							}
							className="mt-4 w-full py-6 text-base font-semibold bg-accent-gold text-white hover:bg-accent-gold/90 focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2"
							size="lg"
							aria-busy={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<svg
										className="animate-spin h-4 w-4 mr-2"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										aria-hidden="true"
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
					</form>
				</CardContent>
			</Card>

			{/* Progress Bar — appears below the form card when analysis is running */}
			{progressState.stage !== "Idle" && (
				<Card
					ref={progressCardRef}
					className="animate-in fade-in slide-in-from-bottom-2 duration-500"
				>
					<CardContent className="pt-6">
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
					</CardContent>
				</Card>
			)}
		</div>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// Local helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Numbered section header used to delineate each form step.
 * The circle badge gives the form a clear scan path without heavy boxing.
 */
const StepHeader = ({ step, title }: { step: number; title: string }) => (
	<div className="flex items-center gap-3 mb-1">
		<span
			className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-gold text-xs font-bold text-white"
			aria-hidden="true"
		>
			{step}
		</span>
		<h2 className="text-base font-semibold text-foreground">{title}</h2>
	</div>
);

/** Reusable info ⓘ SVG to avoid repeating the path string everywhere */
const InfoIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		className="w-3 h-3"
		aria-hidden="true"
	>
		<path
			fillRule="evenodd"
			d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
			clipRule="evenodd"
		/>
	</svg>
);

export default RecommendForm;
