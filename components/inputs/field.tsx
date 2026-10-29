"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type Outcome<T> = { ok: true; value: T | null } | { ok: false; reason: string }

export type ShellProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "min" | "max" | "step"> & {
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
export function useReadField<T>({ value, read, write, onChange, onInvalid, step }: {
    value: T | null
    read: (text: string) => Outcome<T>
    write: (value: T | null) => string
    onChange: (value: T | null) => void
    onInvalid?: (reason: string | null) => void
    step?: (current: T | null, direction: 1 | -1) => T | null
}) {
    const [draft, setDraft] = React.useState<string | null>(null)
    const [reason, setReason] = React.useState<string | null>(null)
    const text = draft ?? write(value)

    const fail = (why: string) => { setReason(why); onInvalid?.(why) }
    /** Reads the text; on success hands the value up and shows it canonically (kept as draft while focused). */
    const commit = (next: string, stayFocused: boolean) => {
        const result = read(next)
        if (!result.ok) { fail(result.reason); return }
        if (reason) onInvalid?.(null)
        setReason(null)
        setDraft(stayFocused ? write(result.value) : null)
        onChange(result.value)
    }

    return {
        text,
        reason,
        /** Sets a value chosen elsewhere (e.g. in a calendar) as if it had been typed. */
        pick: (next: T | null) => {
            if (reason) onInvalid?.(null)
            setReason(null)
            setDraft(write(next))
            onChange(next)
        },
        inputProps: {
            value: text,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
            onFocus: () => setDraft((d) => d ?? write(value)),
            onBlur: () => {
                if (draft === null) return
                // Untouched text needs no reading; an unreadable one stays as typed
                if (draft === write(value) && !reason) { setDraft(null); return }
                commit(draft, false)
            },
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && draft !== null) { commit(draft, true); return }
                if (step && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
                    e.preventDefault()
                    const current = read(text)
                    if (!current.ok) { fail(current.reason); return }
                    const next = step(current.value, e.key === "ArrowUp" ? 1 : -1)
                    setReason(null)
                    onChange(next)
                    setDraft(write(next))
                }
            },
        },
    }
}

export function Shell({ unit, reason, input, className, describedBy, id, after }: {
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
    const described = [describedBy, unit ? unitId : null, reason ? reasonId : null].filter(Boolean).join(" ") || undefined
    return (
        <div className="flex w-full flex-col gap-1">
            <div className={cn(fieldShell, className)}>
                {input({ id, "aria-describedby": described, ...(reason ? { "aria-invalid": true as const } : {}) })}
                {unit && <span id={unitId} className="shrink-0 pr-control pl-1 text-fg-muted">{unit}</span>}
                {after}
            </div>
            {reason && <p id={reasonId} role="alert" className="m-0 text-xs text-danger">{reason}</p>}
        </div>
    )
}

export const inner = "h-full min-w-0 flex-1 bg-transparent px-control font-mono tabular-nums outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"

