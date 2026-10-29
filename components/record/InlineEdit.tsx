"use client"

import * as React from "react"
import { Loader2, Pencil, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EditorProps<T> {
    /** The value to start from: the current one, or the one that failed to save. */
    value: T
    /** Save this value (the same value only closes). */
    commit: (value: T) => void
    /** Close without saving. */
    cancel: () => void
    /** Put on the field that should get focus. */
    inputRef: React.Ref<HTMLElement>
    id: string
    /** Report text that cannot be read (or null once it can); the editor then stays open when left. */
    setInvalid: (reason: string | null) => void
}

type Mode = "view" | "editing" | "saving"

/**
 * One property changed in place (D-07): the value is a button; Enter or a click opens the matching field right
 * there; Enter or leaving saves, Escape discards. While saving the new value stays visible; a failure keeps the
 * field open with the typed value and the reason. Focus comes back to the value.
 */
export function InlineEdit<T>({ label, value, display, editor, onSave, readOnly, isEmpty, emptyText, className }: {
    label: string
    value: T
    display: (value: T) => React.ReactNode
    editor: (props: EditorProps<T>) => React.ReactNode
    /** Reject with an Error whose message says what went wrong and what to do. */
    onSave: (value: T) => void | Promise<void>
    readOnly?: boolean
    /** When true, the value shows `emptyText` and the button adds instead of changes (D-04). */
    isEmpty?: (value: T) => boolean
    emptyText?: string
    className?: string
}) {
    const id = React.useId()
    const [mode, setMode] = React.useState<Mode>("view")
    const [draft, setDraft] = React.useState<T>(value)
    const [error, setError] = React.useState<string | null>(null)
    // A ref, because the editor reports in the same blur event that the wrapper then checks
    const invalid = React.useRef<string | null>(null)
    const setInvalid = React.useCallback((reason: string | null) => { invalid.current = reason }, [])
    /** Set while focus leaves the editor after a failure: that blur must not retry silently. */
    const leavingAfterError = React.useRef(false)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const inputRef = React.useRef<HTMLElement>(null)
    const editorRef = React.useRef<HTMLDivElement>(null)
    const returnFocus = React.useRef(false)
    const saving = React.useRef(false)

    React.useEffect(() => {
        if (mode === "editing") {
            // Not after a failure that happened while the person was already somewhere else
            const active = document.activeElement
            const here = !active || active === document.body || editorRef.current?.contains(active)
            // The editor's own field, else the chosen option, else its first control
            const find = (selector: string) => editorRef.current?.querySelector<HTMLElement>(selector)
            const target = inputRef.current ?? find('[aria-checked="true"]') ?? find('input, textarea, select, button, [tabindex="0"]')
            if (here || !error) target?.focus()
        }
        if (mode === "view" && returnFocus.current) {
            returnFocus.current = false
            // Only when the focus was lost with the editor; someone who clicked elsewhere keeps it there
            if (!document.activeElement || document.activeElement === document.body) buttonRef.current?.focus()
        }
    }, [mode, error])

    const empty = isEmpty?.(value) ?? false
    if (readOnly) return <span className={cn("block pt-0.5", empty && "text-fg-subtle", className)}>{empty ? emptyText : display(value)}</span>

    const open = () => { setDraft(value); setError(null); invalid.current = null; setMode("editing") }
    const close = () => { returnFocus.current = true; setError(null); invalid.current = null; setMode("view") }

    const commit = async (next: T) => {
        if (saving.current) return
        if (leavingAfterError.current) { leavingAfterError.current = false; return }
        if (Object.is(next, value) || JSON.stringify(next) === JSON.stringify(value)) { close(); return }
        saving.current = true
        setDraft(next)
        setMode("saving")
        try {
            await onSave(next)
            close()
        } catch (e) {
            setError(e instanceof Error && e.message ? e.message : "Nicht gespeichert. Nochmals versuchen.")
            setMode("editing")
        } finally {
            saving.current = false
        }
    }

    if (mode === "view") {
        return (
            <button
                ref={buttonRef}
                type="button"
                onClick={open}
                className={cn(
                    "group -mx-1.5 flex w-[calc(100%+0.75rem)] items-start justify-between gap-2 rounded-control px-1.5 py-0.5 text-left text-sm text-fg",
                    "hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    className
                )}
            >
                {/* The name says what the button does and what the value is: "Kunde ändern: Dähler + Blaser" */}
                <span className="sr-only">{label} {empty ? "hinzufügen" : "ändern"}: </span>
                {empty ? (
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2">
                        <span className="text-fg-subtle">{emptyText}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent"><Plus className="h-3 w-3" aria-hidden="true" />Hinzufügen</span>
                    </span>
                ) : (
                    <span className="min-w-0 flex-1">{display(value)}</span>
                )}
                <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fg-subtle opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
            </button>
        )
    }

    if (mode === "saving") {
        return (
            <span className={cn("flex items-start justify-between gap-2 pt-0.5 text-sm text-fg", className)}>
                <span className="min-w-0 flex-1">{display(draft)}</span>
                <span role="status" className="flex shrink-0 items-center gap-1 text-xs text-fg-muted">
                    <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />Speichert …
                </span>
            </span>
        )
    }

    return (
        <div
            ref={editorRef}
            className={cn("flex flex-col gap-1", className)}
            onBlurCapture={(e) => {
                // Runs before the editor's own blur: after a failure, leaving keeps the editor and does not retry
                if (error && !e.currentTarget.contains(e.relatedTarget as Node | null)) leavingAfterError.current = true
            }}
            onBlur={(e) => {
                leavingAfterError.current = false
                // Leaving without a change closes; a change already started saving; unreadable text stays
                if (!e.currentTarget.contains(e.relatedTarget as Node | null) && !saving.current && !error && !invalid.current) setMode("view")
            }}
            onKeyDown={(e) => {
                // An open list or calendar inside the editor handles its own Escape
                if (e.key === "Escape" && !e.defaultPrevented) { e.preventDefault(); e.stopPropagation(); close() }
                // Enter in a one-line field saves here; it must not also submit a surrounding form or press the value button
                if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault()
            }}
        >
            {editor({ value: draft, commit: (v) => { void commit(v) }, cancel: close, inputRef, id, setInvalid })}
            {error && <p role="alert" className="m-0 text-xs text-danger">{error}</p>}
        </div>
    )
}
