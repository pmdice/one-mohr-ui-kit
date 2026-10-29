"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type Outcome<T> = { ok: true; value: T | null } | { ok: false; reason: string }

export type ShellProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "onInvalid" | "min" | "max" | "step"> & {
    /** Shown inside the field on the right (E-02). */
    unit?: string
    /** Called with the reason when the text cannot be read, and with null once it can again. */
    onInvalid?: (reason: string | null) => void
}

/** Border, focus ring and error state on the wrapper, so the unit sits inside the field. */
export const fieldShell = cn(
    "flex h-control w-full items-center rounded-control border border-border-strong bg-surface text-control text-fg transition-colors duration-fast",
    "focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-1 focus-within:ring-offset-surface",
    "has-[[aria-invalid=true]]:border-danger has-[[aria-invalid=true]]:focus-within:ring-danger",
    "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
)

/**
 * A text field that reads generously and writes strictly (E-04): the text is read when leaving or on Enter,
 * then shown in its canonical form. While the field has focus, a value from outside never overwrites the typing.
 */
export function useReadField<T>({ value, read, write, onChange, onInvalid, step, handlers = {} }: {
    value: T | null
    read: (text: string) => Outcome<T>
    write: (value: T | null) => string
    onChange: (value: T | null) => void
    onInvalid?: (reason: string | null) => void
    step?: (current: T | null, direction: 1 | -1) => T | null
    /** The caller's own handlers; they run after the field's. */
    handlers?: Pick<React.InputHTMLAttributes<HTMLInputElement>, "onFocus" | "onBlur" | "onKeyDown" | "onChange">
}) {
    // Only typing creates a draft; without one the field always shows the current value
    const [draft, setDraft] = React.useState<string | null>(null)
    const [reason, setReason] = React.useState<string | null>(null)
    const text = draft ?? write(value)

    const fail = (why: string) => { setReason(why); onInvalid?.(why) }
    const clear = () => { if (reason) onInvalid?.(null); setReason(null) }
    /** Reads the typed text; on success hands the value up, after which the field shows it canonically. */
    const commit = (next: string) => {
        const result = read(next)
        if (!result.ok) { fail(result.reason); return false }
        clear()
        setDraft(null)
        onChange(result.value)
        return true
    }

    return {
        text,
        reason,
        /** Sets a value chosen elsewhere (e.g. in a calendar) as if it had been typed. */
        pick: (next: T | null) => {
            clear()
            setDraft(null)
            onChange(next)
        },
        inputProps: {
            value: text,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setDraft(e.target.value); handlers.onChange?.(e) },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => handlers.onFocus?.(e),
            onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                if (draft !== null) commit(draft)
                handlers.onBlur?.(e)
            },
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && draft !== null) {
                    // Unreadable text must not submit the form with the old value
                    if (!commit(draft)) e.preventDefault()
                } else if (step && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
                    e.preventDefault()
                    const current = read(text)
                    if (!current.ok) fail(current.reason)
                    else {
                        clear()
                        setDraft(null)
                        onChange(step(current.value, e.key === "ArrowUp" ? 1 : -1))
                    }
                }
                handlers.onKeyDown?.(e)
            },
        },
    }
}

export function Shell({ unit, reason, input, className, describedBy, id, after, outsideError }: {
    /** An error shown by a surrounding form field; the field then only marks itself invalid. */
    outsideError?: boolean
    unit?: string
    /** Inside the field after the unit, e.g. a calendar button. */
    after?: React.ReactNode
    reason: string | null
    input: (extra: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => React.ReactNode
    className?: string
    describedBy?: string
    id: string
}) {
    const unitId = `${id}-unit`
    const reasonId = `${id}-reason`
    const ownReason = reason && !outsideError ? reason : null
    const described = [describedBy, unit ? unitId : null, ownReason ? reasonId : null].filter(Boolean).join(" ") || undefined
    return (
        <div className="flex w-full flex-col gap-1">
            <div className={cn(fieldShell, className)}>
                {input({ id, "aria-describedby": described, ...(reason ? { "aria-invalid": true as const } : {}) })}
                {unit && <span id={unitId} className="shrink-0 pr-control pl-1 text-fg-muted">{unit}</span>}
                {after}
            </div>
            {ownReason && <p id={reasonId} role="alert" className="m-0 text-xs text-danger">{ownReason}</p>}
        </div>
    )
}

export const inner = "h-full min-w-0 flex-1 bg-transparent px-control font-mono tabular-nums outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"

