"use client";

import { useEffect, useRef } from "react";

export interface ConfirmationDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive";
	onConfirm: () => void;
	onCancel: () => void;
}

/**
 * Reusable confirmation dialog modal.
 *
 * Uses native <dialog> element for accessibility (focus trap, escape to close).
 * Supports destructive variant for dangerous actions (red confirm button).
 *
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   isOpen={showDeleteDialog}
 *   title="Delete Player Data"
 *   message="Are you sure? This cannot be undone."
 *   variant="destructive"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDeleteDialog(false)}
 * />
 * ```
 */
const ConfirmationDialog = ({
	isOpen,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "default",
	onConfirm,
	onCancel,
}: ConfirmationDialogProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [isOpen]);

	// Handle escape key and backdrop click
	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		const handleCancel = (e: Event) => {
			e.preventDefault();
			onCancel();
		};

		const handleClick = (e: MouseEvent) => {
			// Close if clicked on backdrop (outside dialog content)
			const rect = dialog.getBoundingClientRect();
			if (
				e.clientX < rect.left ||
				e.clientX > rect.right ||
				e.clientY < rect.top ||
				e.clientY > rect.bottom
			) {
				onCancel();
			}
		};

		dialog.addEventListener("cancel", handleCancel);
		dialog.addEventListener("click", handleClick);

		return () => {
			dialog.removeEventListener("cancel", handleCancel);
			dialog.removeEventListener("click", handleClick);
		};
	}, [onCancel]);

	const confirmButtonClasses =
		variant === "destructive"
			? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
			: "bg-primary text-primary-foreground hover:bg-primary/90";

	return (
		<dialog
			ref={dialogRef}
			className="backdrop:bg-black/50 bg-card border border-border rounded-lg p-0 max-w-md w-full shadow-lg"
		>
			<div className="p-6" onClick={(e) => e.stopPropagation()}>
				<h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
				<p className="text-sm text-muted-foreground mb-6">{message}</p>

				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-secondary transition-colors"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${confirmButtonClasses}`}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</dialog>
	);
};

export default ConfirmationDialog;
