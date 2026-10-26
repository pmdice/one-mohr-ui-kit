"use client"

import * as React from "react"

/** True while the user is typing somewhere a plain key means a character, not a command. */
export function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    if (target.isContentEditable || target.closest('[contenteditable=""], [contenteditable="true"]')) return true
    if (target.closest('[role="combobox"]')) return true
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
}

const WIDGETS = '[role="dialog"][aria-modal="true"], [role="alertdialog"], [role="menu"], [role="menubar"], [role="listbox"], [role="grid"], [role="tree"]'

/** True when keys belong to an open modal or to a widget that uses letters itself (menus, lists, grids). */
function insideWidget(target: EventTarget | null): boolean {
    if (document.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]')) return true
    return target instanceof Element && !!target.closest(WIDGETS)
}

/**
 * Global keyboard shortcut. `mod` requires ⌘ or Ctrl; without it no modifier may be held, except the
 * AltGr/Option needed to type a symbol. Plain shortcuts never fire while typing, inside menus, lists
 * and grids, or while a modal dialog is open.
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
            if (event.defaultPrevented || event.isComposing) return
            if (event.key.toLowerCase() !== key.toLowerCase()) return
            // Symbols like "[" need AltGr (Ctrl+Alt) or Option on Swiss/German layouts: the produced key counts
            const symbol = !/^[a-z0-9]$/i.test(key)
            if (!symbol || mod) {
                if (event.altKey) return
                if (mod !== (event.metaKey || event.ctrlKey)) return
            }
            if (!mod && (isEditableTarget(event.target) || insideWidget(event.target))) return
            event.preventDefault()
            handlerRef.current(event)
        }
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [key, mod, enabled])
}
