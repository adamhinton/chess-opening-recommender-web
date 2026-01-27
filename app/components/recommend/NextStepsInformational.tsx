/**
 * Shows information on what will happen after user submits a Lichess username for inference.
 */

const NextStepsInformational = ({
	isSubmitting,
}: {
	isSubmitting: boolean;
}) => {
	return (
		<section>
			<h2 className="text-lg font-semibold text-foreground mb-4">
				Generate Recommendations
			</h2>

			{/* What Happens Next Card */}
			{!isSubmitting && (
				<div className="mb-4 p-4 bg-muted/30 border border-muted rounded-md">
					<p className="text-sm font-medium text-foreground mb-3">
						What happens next:
					</p>
					<div className="space-y-2">
						<div className="flex items-start gap-2 text-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
									clipRule="evenodd"
								/>
							</svg>
							<div>
								<span className="text-foreground font-medium">
									Compile opening stats
								</span>
								<span className="text-muted-foreground">
									{" "}
									(~20 games/second, 3-10 minutes)
								</span>
							</div>
						</div>
						<div className="flex items-start gap-2 text-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
									clipRule="evenodd"
								/>
							</svg>
							<div>
								<span className="text-foreground font-medium">
									AI analyzes your patterns
								</span>
								<span className="text-muted-foreground"> (~10 seconds)</span>
							</div>
						</div>
						<div className="flex items-start gap-2 text-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
									clipRule="evenodd"
								/>
							</svg>
							<div>
								<span className="text-foreground font-medium">
									Get 30-50 personalized recommendations
								</span>
							</div>
						</div>
					</div>
					<p className="text-xs text-muted-foreground mt-3">
						Total time: 3-10 minutes. Progress auto-saves if you leave.
					</p>
				</div>
			)}
		</section>
	);
};

export default NextStepsInformational;
