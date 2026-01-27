"use client";

type DatePickerProps = {
	sinceDate: Date | null;
	onDateChange: (date: Date | null) => void;
	isDisabled: boolean;
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
}: DatePickerProps) => {
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
		<div className="w-full space-y-3">
			<label className="block text-sm font-medium text-foreground">
				Analyze games since
			</label>

			{sinceDate ? (
				<div className="space-y-3">
					<div className="px-4 py-3 bg-secondary/50 border border-border rounded-md">
						<div className="text-sm font-medium text-foreground">
							{sinceDate.toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</div>
					</div>

					{/* Date Selectors Grid */}
					<div className="grid grid-cols-3 gap-3">
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
								className="w-full px-2 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
								className="w-full px-2 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
								className="w-full px-2 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
					<button
						type="button"
						onClick={handleClearDate}
						disabled={isDisabled}
						className="w-full px-3 py-2 text-sm bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Use All Games (since 2019)
					</button>
				</div>
			) : (
				<div className="space-y-3">
					<div className="px-4 py-3 bg-primary/10 border border-primary/30 rounded-md">
						<div className="text-sm font-medium text-foreground mb-1">
							All games (since 2019)
						</div>
						<div className="text-xs text-muted-foreground">
							Using all-time data provides the best results for AI analysis
						</div>
					</div>

					<button
						type="button"
						onClick={() => onDateChange(new Date(2019, 0, 1))}
						disabled={isDisabled}
						className="w-full px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Select a specific date
					</button>
				</div>
			)}
		</div>
	);
};

export default DatePicker;
