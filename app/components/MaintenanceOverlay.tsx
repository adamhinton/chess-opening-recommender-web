import React from "react";
import Link from "next/link";

export const MaintenanceOverlay = () => {
	return (
		<div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background p-4 text-foreground">
			<div className="max-w-md text-center space-y-6">
				<h1 className="text-4xl font-bold tracking-tight">Under Maintenance</h1>
				<p className="text-xl text-muted-foreground">
					As of February 6, 2026, Chess Opening Recommender is currently down
					for a critical bug fix. The application will be back online soon.
				</p>

				<div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm mt-8">
					<p className="font-medium mb-3">
						In the meantime, check out my other project:
					</p>
					<Link
						href="https://mileagebuddy.vercel.app/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-2xl font-bold text-primary hover:underline block"
					>
						MileageBuddy
					</Link>
				</div>

				<p className="text-sm text-muted-foreground pt-8">February 6, 2026</p>
			</div>
		</div>
	);
};
