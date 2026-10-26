"use client"

import * as React from "react"

/** True while the user is typing somewhere a plain key means a character, not a command. */
export function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    if (target.isContentEditable || target.closest('[contenteditable=""], [contenteditable="true"]')) return true
    if (target.closest('[role="combobox"]')) return true
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
}

/**
 * Global keyboard shortcut. `mod` requires ⌘ or Ctrl; without it no modifier may be held.
 * Never fires while typing in an editable element, and never with Alt.
 */
export function useShortcut(
    key: string,
    handler: (event: KeyboardEvent) => void,
    options: { mod?: boolean; enabled?: boolean } = {}
) {
    const { mod = false, enabled = true } = options
    const handlerRef = React.useRef(handler)
    React.useEffect(() => { handlerRef.current = handler })

    React.useEffect(() => {
        if (!enabled) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.isComposing || event.altKey) return
            if (event.key.toLowerCase() !== key.toLowerCase()) return
            const modHeld = event.metaKey || event.ctrlKey
            if (mod !== modHeld) return
            if (!mod && isEditableTarget(event.target)) return
            event.preventDefault()
            handlerRef.current(event)
        }
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [key, mod, enabled])
}
