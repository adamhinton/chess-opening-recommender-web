# Overview

- I am sprucing up the styling and UI/UX for this application.

- I am transitioning away from custom tailwind to ShadCN components.

- We will use ShadCN heavily for this migration. If you're writing (or keeping) much custom Tailwind at all, you're doing it wrong.

## Theming

- Take in to account both light mode and dark mode

- We're mostly retaining the original colors we made in #index.css et al

## Component installs

- You have full authority to install any and every ShadCN component you need.

- That said, first check /components/ui to make sure we don't already have it.

## Responsiveness

- The current app is responsive across all screen sizes. You have authority to make adjustments as needed to keep it that way.

- Most ShadCN components are responsive out of the box but we'll add breakpoints etc where needed to help it along; the defaults only go so far.

## Process for each page/component redesign

1. Make a plan
   - What components do we need to install?
   - What components do we already have that we can reuse?
   - What do we need to change about the page to make it more beautiful?

2. Implement the plan
   - Install any new components
   - Refactor the page to use the new components and styling
   - Make sure all TS logic, functions etc are hooked in to the UI the same way
   - **Before marking any step done: resolve all TypeScript/editor errors introduced by that step**

3. Test the page
   - Make sure all functionality is working as expected
   - Make sure the page looks good in both light and dark mode
   - Make sure the page is responsive and looks good on all screen sizes

---

# Page: /recommend — Styling Revolution

Throw out the current design entirely. Goal: bold, beautiful, accessible, responsive.

- **Layout:** Two-column on desktop (form left, SavedProgress panel right). Single column stacked on mobile. Max-width widened from `max-w-md`.
- **Theming:** Add a rich chess-gold/amber accent color to `globals.css` CSS variables (both light and dark), making the UI pop without losing the existing neutral palette.
- **Typography:** Heavier weights, clearer hierarchy.
- **Component philosophy:** shadcn primitives everywhere. Minimal custom Tailwind — if you're writing lots of Tailwind, you're doing it wrong.

## Step 0 — Enhance globals.css Theming

- [ ] Add a `--gold` / `--accent-gold` CSS variable (amber/chess-gold tone) to both `:root` and `.dark` in `globals.css`
- [ ] Register it in the `@theme inline` block as `--color-accent-gold`
- [ ] Adjust `--primary` in dark mode to be slightly warmer (instead of pure white `0 0% 98%`) to give the UI more character
- [ ] Verify existing color references are unaffected

## Step 1 — Install shadcn Components

Install all of the following (none currently exist in `/components/ui`):

- [ ] `button`
- [ ] `input`
- [ ] `label`
- [ ] `radio-group`
- [ ] `toggle-group`
- [ ] `calendar`
- [ ] `popover`
- [ ] `tooltip` (replaces `ToolTips/ToolTip.tsx`)
- [ ] `alert-dialog` (replaces `ConfirmationDialog.tsx`)
- [ ] `progress` (replaces `ProgressBar/ProgressBar.tsx` internals)
- [ ] `card`
- [ ] `badge`
- [ ] `separator` (replaces inline `Divider` component)
- [ ] `alert` (for the "closing will pause analysis" warning)

## Step 2 — Extract Form to RecommendForm Component

- [ ] Create `app/components/recommend/RecommendForm.tsx`
- [ ] Move all form JSX out of `page.tsx` into `RecommendForm`
- [ ] Props: all state values + handlers (username, sinceDate, selectedColor, selectedTimeControls, isSubmitting, progressState, onSubmit)
- [ ] `page.tsx` becomes thin: only state declarations, handlers, and `<RecommendForm ... />`

## Step 3 — Rip Out & Replace: Input + Label

- [ ] Replace raw `<input type="text">` (username field) with shadcn `Input` + `Label`
- [ ] Delete any custom Tailwind classes on the input

## Step 4 — Rip Out & Replace: DatePicker

- [ ] Delete `app/components/recommend/OptionPickers/DatePicker.tsx` (current: three `<select>` dropdowns in a collapsible)
- [ ] Rewrite using shadcn `Popover` + `Calendar` (`react-day-picker` under the hood)
- [ ] Trigger: a `Button` showing selected date or "All time (no filter)"
- [ ] Clear button inside Popover or inline next to trigger
- [ ] Preserve all logic: `sinceDate` state, `onDateChange` callback, `isDisabled` prop, min date constraint (2019)

## Step 5 — Rip Out & Replace: ColorPicker

- [ ] Delete `app/components/recommend/OptionPickers/ColorPicker.tsx` (current: custom radio labels with manual border classes)
- [ ] Rewrite using shadcn `RadioGroup` + `RadioGroupItem`
- [ ] Large card-style items with chess piece emoji (♙ White / ♟ Black) as the visual anchor
- [ ] Preserve: `selectedColor` state, `onColorChange` callback, `isDisabled` prop

## Step 6 — Rip Out & Replace: TimeControlPicker

- [ ] Delete `app/components/recommend/OptionPickers/TimeControlPicker.tsx` (current: checkboxes)
- [ ] Rewrite using shadcn `ToggleGroup` in multi-select mode
- [ ] Pill-style chips: Blitz ⚡ / Rapid 🕐 / Classical ♟ — visually clear active vs inactive state
- [ ] Preserve: `selectedTimeControls` state, `onTimeControlChange` callback, `isDisabled` prop, "at least one required" validation

## Step 7 — Rip Out & Replace: ProgressBar

- [ ] Rewrite `ProgressBar.tsx` internals using shadcn `Progress` component
- [ ] Stage-aware color: amber/gold during "Analyzing Games", primary during "Running AI Model"
- [ ] Replace the inline warning `<div>` with shadcn `Alert` component
- [ ] Preserve: throttled display logic, `estimatedSecondsRemaining`, game count text, `stage` prop discriminated union

## Step 8 — Rip Out & Replace: Tooltip

- [ ] Delete `app/components/ToolTips/ToolTip.tsx`
- [ ] Replace all usages with shadcn `Tooltip` / `TooltipContent` / `TooltipTrigger`
- [ ] Usages: username field, ColorPicker label (in page.tsx)

## Step 9 — Rip Out & Replace: ConfirmationDialog

- [ ] Delete `app/components/ConfirmationDialog.tsx`
- [ ] Replace usage in `SavedProgress.tsx` with shadcn `AlertDialog`
- [ ] Preserve: destructive variant, confirm/cancel callbacks, dynamic title/message

## Step 10 — Rip Out & Replace: SavedProgress PlayerRows

- [ ] Refactor `SavedProgress.tsx` to use shadcn `Card` for each player row
- [ ] Use `Badge` for color indicator (white/black) instead of plain text
- [ ] Replace raw `<button>` elements with shadcn `Button` (variant="default" for Resume, variant="outline" for View Stats, variant="ghost" + destructive icon for Delete)
- [ ] Preserve: all localStorage logic, `onResumePlayer`, `onViewStats`, `onDelete` handlers

## Step 11 — Rip Out & Replace: SeeExampleSection

- [ ] Refactor `SeeExampleSection.tsx` using shadcn `Card` + `Button`
- [ ] Style as a visually distinct "try before you sign up" callout — consider accent-gold border
- [ ] Preserve: `handleViewDemo` logic, router push, `isDisabled` prop

## Step 12 — Rip Out & Replace: NextStepsInformational

- [ ] Refactor using shadcn `Card` or `Alert` for the 3-step info block
- [ ] Make it visually lighter/secondary so it doesn't compete with the submit button
- [ ] Preserve: `isSubmitting` prop and conditional rendering

## Step 13 — Page Layout Overhaul (page.tsx / RecommendForm)

- [ ] Implement two-column layout: form left, SavedProgress right (desktop); stacked (mobile)
- [ ] Replace `Divider` component with shadcn `Separator`
- [ ] Replace all raw `<button>` / submit button with shadcn `Button`
- [ ] Add chess-gold accent to the submit button or form header for visual pop
- [ ] Ensure full keyboard accessibility and focus management throughout

## Step 14 — Cleanup

- [ ] Delete any now-unused custom component files
- [ ] Remove leftover custom Tailwind from any retained components
- [ ] Run `npm run build` / lint to confirm no broken imports
- [ ] Visual QA: dark mode, mobile, tablet, desktop
