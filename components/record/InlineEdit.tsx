"use client"

import * as React from "react"
import { Loader2, Pencil } from "lucide-react"
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
}

type Mode = "view" | "editing" | "saving"

/**
 * One property changed in place (D-07): the value is a button; Enter or a click opens the matching field right
 * there; Enter or leaving saves, Escape discards. While saving the new value stays visible; a failure keeps the
 * field open with the typed value and the reason. Focus comes back to the value.
 */
export function InlineEdit<T>({ label, value, display, editor, onSave, readOnly, className }: {
    label: string
    value: T
    display: (value: T) => React.ReactNode
    editor: (props: EditorProps<T>) => React.ReactNode
    /** Reject with an Error whose message says what went wrong and what to do. */
    onSave: (value: T) => void | Promise<void>
    readOnly?: boolean
    className?: string
}) {
    const id = React.useId()
    const [mode, setMode] = React.useState<Mode>("view")
    const [draft, setDraft] = React.useState<T>(value)
    const [error, setError] = React.useState<string | null>(null)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const inputRef = React.useRef<HTMLElement>(null)
    const returnFocus = React.useRef(false)
    const saving = React.useRef(false)

    React.useEffect(() => {
        if (mode === "editing") inputRef.current?.focus()
        if (mode === "view" && returnFocus.current) { returnFocus.current = false; buttonRef.current?.focus() }
    }, [mode, error])

    if (readOnly) return <span className={cn("block pt-0.5", className)}>{display(value)}</span>

    const open = () => { setDraft(value); setError(null); setMode("editing") }
    const close = () => { returnFocus.current = true; setError(null); setMode("view") }

    const commit = async (next: T) => {
        if (saving.current) return
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
                aria-label={`${label} ändern`}
                className={cn(
                    "group -mx-1.5 flex w-[calc(100%+0.75rem)] items-start justify-between gap-2 rounded-control px-1.5 py-0.5 text-left text-sm text-fg",
                    "hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    className
                )}
            >
                <span className="min-w-0 flex-1">{display(value)}</span>
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
            className={cn("flex flex-col gap-1", className)}
            onKeyDown={(e) => {
                // An open list or calendar inside the editor handles its own Escape
                if (e.key === "Escape" && !e.defaultPrevented) { e.preventDefault(); e.stopPropagation(); close() }
                // Enter in a one-line field saves here; it must not also submit a surrounding form or press the value button
                if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault()
            }}
        >
            {editor({ value: draft, commit: (v) => { void commit(v) }, cancel: close, inputRef, id })}
            {error && <p role="alert" className="m-0 text-xs text-danger">{error}</p>}
        </div>
    )
}
