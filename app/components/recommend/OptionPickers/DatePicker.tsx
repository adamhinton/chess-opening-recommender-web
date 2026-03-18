// ________________________
// Allows the user to pick a "since" date for which games to analyze (e.g. only analyze games since Jan 1, 2022).
// ________________________

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react";

type DatePickerProps = {
	sinceDate: Date | null;
	onDateChange: (date: Date | null) => void;
	isDisabled: boolean;
};

/**Lichess games before March 2018 lack needed data about number of moves; for simplicity we'll just start from 2019. Data that old won't be very relevant anyway. */
const START_YEAR = 2019;

/**
 * Date picker for selecting a "since" date (games from this date to present).
 * Uses shadcn Calendar in a Popover with year/month navigation for easier browsing.
 * User can only pick "since", not "until".
 */
const DatePicker = ({
	sinceDate,
	onDateChange,
	isDisabled,
}: DatePickerProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [displayMonth, setDisplayMonth] = useState(
		sinceDate || new Date(START_YEAR, 0, 1),
	);

	const handleClearDate = () => {
		onDateChange(null);
		setIsOpen(false);
	};

	const handleDateSelect = (date: Date | undefined) => {
		if (date) {
			onDateChange(date);
			setDisplayMonth(date);
			setIsOpen(false);
		}
	};

	const handlePrevMonth = () => {
		setDisplayMonth(
			new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1),
		);
	};

	const handleNextMonth = () => {
		setDisplayMonth(
			new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1),
		);
	};

	const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const year = parseInt(e.target.value, 10);
		setDisplayMonth(new Date(year, displayMonth.getMonth(), 1));
	};

	const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const month = parseInt(e.target.value, 10);
		setDisplayMonth(new Date(displayMonth.getFullYear(), month, 1));
	};

	const currentYear = displayMonth.getFullYear();
	const currentMonth = displayMonth.getMonth();

	const yearOptions = Array.from(
		{ length: new Date().getFullYear() - START_YEAR + 1 },
		(_, i) => START_YEAR + i,
	).reverse();

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const formattedDate = sinceDate
		? sinceDate.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: null;

	return (
		<div className="w-full space-y-3">
			<Label className="block text-sm font-medium">Analyze games since</Label>

			{/* Calendar date picker that pops up when clicking calendar icon */}
			<div className="space-y-2">
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant={sinceDate ? "default" : "outline"}
							disabled={isDisabled}
							className="w-full justify-start text-left font-normal"
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{formattedDate ? (
								<span>{formattedDate}</span>
							) : (
								<span className="text-muted-foreground">
									Click to select a start date
								</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-4" align="start" side="bottom">
						<div className="space-y-4">
							{/* Year and Month Navigation */}
							<div className="flex gap-2 items-center justify-between">
								<select
									value={currentYear}
									onChange={handleYearChange}
									className="px-2 py-1 border border-border rounded text-sm bg-background"
								>
									{yearOptions.map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>

								<select
									value={currentMonth}
									onChange={handleMonthChange}
									className="px-2 py-1 border border-border rounded text-sm bg-background flex-1"
								>
									{monthNames.map((month, idx) => (
										<option key={idx} value={idx}>
											{month}
										</option>
									))}
								</select>

								<div className="flex gap-1">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handlePrevMonth}
										className="h-8 w-8 p-0"
										disabled={currentYear === START_YEAR && currentMonth === 0}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleNextMonth}
										className="h-8 w-8 p-0"
										disabled={
											currentYear === new Date().getFullYear() &&
											currentMonth === new Date().getMonth()
										}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{/* Calendar */}
							<div className="w-full h-64 overflow-hidden">
								<Calendar
									mode="single"
									selected={sinceDate || undefined}
									onSelect={handleDateSelect}
									disabled={(date) => {
										const startDate = new Date(START_YEAR, 0, 1);
										return date > new Date() || date < startDate;
									}}
									month={displayMonth}
									onMonthChange={setDisplayMonth}
									initialFocus
									className="w-full"
								/>
							</div>

							{/* Clear Button */}
							{sinceDate && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleClearDate}
									disabled={isDisabled}
									className="w-full text-destructive hover:bg-destructive/10"
								>
									<X className="mr-2 h-4 w-4" />
									Clear (use all games since 2019)
								</Button>
							)}
						</div>
					</PopoverContent>
				</Popover>

				{/* Info Box - only shown when no date selected */}
				{!sinceDate && (
					<div className="px-3 py-2 bg-muted/40 border border-border/50 rounded-md text-xs text-muted-foreground">
						<span>
							Goes back as early as 2019. Older games are missing critical
							analysis data.
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default DatePicker;
