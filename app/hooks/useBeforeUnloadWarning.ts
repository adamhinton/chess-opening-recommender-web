import { useEffect } from "react";

/**
 * Warns user before closing/navigating away during critical operations.
 * Triggers the browser's native "Leave page?" confirmation dialog.
 * No custom message because browsers ignore that for security reasons.
 * @param shouldWarn - Whether to show the warning (e.g., while processing)
 */
export function useBeforeUnloadWarning(shouldWarn: boolean) {
	useEffect(() => {
		if (!shouldWarn) return;

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			// Modern browsers ignore custom messages, but setting returnValue triggers the dialog
			e.returnValue = "";
			return "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [shouldWarn]);
}
