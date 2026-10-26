"use client"

import * as React from "react"

/**
 * F-12: warn before leaving a form with unsaved changes.
 * Covers reloads and tab closes (beforeunload). In-app navigation guards belong to the
 * navigation part of the handbook, since they depend on the router.
 */
export function useUnsavedChanges(isDirty: boolean, message = "Ungespeicherte Änderungen verwerfen?") {
    React.useEffect(() => {
        if (!isDirty) return
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            // Legacy browsers show the dialog only when returnValue is set
            event.returnValue = message
        }
        window.addEventListener("beforeunload", onBeforeUnload)
        return () => window.removeEventListener("beforeunload", onBeforeUnload)
    }, [isDirty, message])
}
