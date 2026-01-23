"use client";

import { useState } from "react";

type DatePickerProps = {
	sinceDate: Date | null;
	onDateChange: (date: Date | null) => void;
	isDisabled: boolean;
	isExpanded?: boolean;
	onToggleExpanded?: (expanded: boolean) => void;
};

const CURRENT_YEAR = new Date().getFullYear();
// Lichess games before March 2018 lack needed data about number of moves; for simplicity we'll just start from 2019. Data that old won't be very relevant anyway.
const START_YEAR = 2019;

const MONTHS = [
	{ value: 0, label: "January" },
	{ value: 1, label: "February" },
	{ value: 2, label: "March" },
	{ value: 3, label: "April" },
	{ value: 4, label: "May" },
	{ value: 5, label: "June" },
	{ value: 6, label: "July" },
	{ value: 7, label: "August" },
	{ value: 8, label: "September" },
	{ value: 9, label: "October" },
	{ value: 10, label: "November" },
	{ value: 11, label: "December" },
];

const getDaysInMonth = (year: number, month: number): number => {
	return new Date(year, month + 1, 0).getDate();
};

/**
 * Date picker for selecting a "since" date (games from this date to present).
 * Allows user to fold/unfold the picker.
 * Users can select year, month, and day via dropdowns or typing.
 */
const DatePicker = ({
	sinceDate,
	onDateChange,
	isDisabled,
	isExpanded: controlledIsExpanded,
	onToggleExpanded,
}: DatePickerProps) => {
	const [internalIsExpanded, setInternalIsExpanded] = useState(false);

	// Use controlled state if provided, otherwise use internal state
	const isExpanded = controlledIsExpanded ?? internalIsExpanded;
	const setIsExpanded = onToggleExpanded ?? setInternalIsExpanded;

	// Extract current values from sinceDate or use defaults
	const selectedYear = sinceDate?.getFullYear() ?? 2019;
	const selectedMonth = sinceDate?.getMonth() ?? 0;
	const selectedDay = sinceDate?.getDate() ?? 1;

	const handleYearChange = (year: number) => {
		const daysInMonth = getDaysInMonth(year, selectedMonth);
		const validDay = Math.min(selectedDay, daysInMonth);
		onDateChange(new Date(year, selectedMonth, validDay));
	};

	const handleMonthChange = (month: number) => {
		const daysInMonth = getDaysInMonth(selectedYear, month);
		const validDay = Math.min(selectedDay, daysInMonth);
		onDateChange(new Date(selectedYear, month, validDay));
	};

	const handleDayChange = (day: number) => {
		onDateChange(new Date(selectedYear, selectedMonth, day));
	};

	const handleClearDate = () => {
		onDateChange(null);
	};

	const toggleExpanded = () => {
		if (!isDisabled) {
			setIsExpanded(!isExpanded);
		}
	};

	const yearOptions = Array.from(
		{ length: CURRENT_YEAR - START_YEAR + 1 },
		(_, i) => CURRENT_YEAR - i,
	);

	const daysInCurrentMonth = getDaysInMonth(selectedYear, selectedMonth);
	const dayOptions = Array.from(
		{ length: daysInCurrentMonth },
		(_, i) => i + 1,
	);

	return (
		<div className="w-full space-y-2">
			{/* Toggle Button */}
			<button
				type="button"
				onClick={toggleExpanded}
				disabled={isDisabled}
				className="w-full flex items-center justify-between px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<span className="text-sm font-medium">
					{sinceDate
						? `Games since: ${sinceDate.toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}`
						: `Since: ${new Date(
								selectedYear,
								selectedMonth,
								selectedDay,
							).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}`}
				</span>
				<svg
					className={`w-4 h-4 transition-transform ${
						isExpanded ? "rotate-180" : ""
					}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{/* Expanded Date Selection */}
			{isExpanded && (
				<div className="p-4 bg-card border border-border rounded-md space-y-4">
					<div className="text-sm text-muted-foreground mb-3">
						Select games from a specific date to present. Leave empty for all
						available games.
					</div>

					{/* Date Selectors Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						{/* Year Selector */}
						<div className="space-y-1">
							<label
								htmlFor="year-select"
								className="block text-xs font-medium text-foreground"
							>
								Year
							</label>
							<select
								id="year-select"
								value={selectedYear}
								onChange={(e) => handleYearChange(Number(e.target.value))}
								disabled={isDisabled}
								className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{yearOptions.map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>

						{/* Month Selector */}
						<div className="space-y-1">
							<label
								htmlFor="month-select"
								className="block text-xs font-medium text-foreground"
							>
								Month
							</label>
							<select
								id="month-select"
								value={selectedMonth}
								onChange={(e) => handleMonthChange(Number(e.target.value))}
								disabled={isDisabled}
								className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{MONTHS.map((month) => (
									<option key={month.value} value={month.value}>
										{month.label}
									</option>
								))}
							</select>
						</div>

						{/* Day Selector */}
						<div className="space-y-1">
							<label
								htmlFor="day-select"
								className="block text-xs font-medium text-foreground"
							>
								Day
							</label>
							<select
								id="day-select"
								value={selectedDay}
								onChange={(e) => handleDayChange(Number(e.target.value))}
								disabled={isDisabled}
								className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{dayOptions.map((day) => (
									<option key={day} value={day}>
										{day}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Clear Button */}
					{sinceDate && (
						<button
							type="button"
							onClick={handleClearDate}
							disabled={isDisabled}
							className="w-full px-3 py-2 text-sm bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Clear Date Filter
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default DatePicker;
