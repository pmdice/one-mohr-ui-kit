"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { formatMoney, formatNumber, parseMoney, parseNumber } from "./parse"

type Outcome<T> = { ok: true; value: T | null } | { ok: false; reason: string }

type ShellProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "min" | "max" | "step"> & {
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
function useReadField<T>({ value, read, write, onChange, onInvalid, step }: {
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
        inputProps: {
            value: text,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
            onFocus: () => setDraft(write(value)),
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

function Shell({ unit, reason, input, className, describedBy, id }: {
    unit?: string
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
            </div>
            {reason && <p id={reasonId} role="alert" className="m-0 text-xs text-danger">{reason}</p>}
        </div>
    )
}

const inner = "h-full min-w-0 flex-1 bg-transparent px-control font-mono tabular-nums outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"

/** Number with unit, Swiss grouping, arrows to step (E-02, E-04). */
export const NumberInput = React.forwardRef<HTMLInputElement, ShellProps & {
    value: number | null
    onChange: (value: number | null) => void
    decimals?: number
    min?: number
    max?: number
}>(function NumberInput({ value, onChange, decimals, min, max, unit, onInvalid, className, id, "aria-describedby": describedBy, "aria-invalid": invalidFromOutside, ...props }, ref) {
    const generated = React.useId()
    const range = min !== undefined && max !== undefined ? `Erlaubt: ${formatNumber(min)} bis ${formatNumber(max)}` : min !== undefined ? `Mindestens ${formatNumber(min)}` : `Höchstens ${formatNumber(max ?? 0)}`
    const field = useReadField<number>({
        value,
        onChange,
        onInvalid,
        write: (v) => formatNumber(v, { decimals }),
        read: (text) => {
            const r = parseNumber(text, { decimals })
            if (!r.ok || r.value === null) return r
            if ((min !== undefined && r.value < min) || (max !== undefined && r.value > max)) return { ok: false, reason: range }
            return r
        },
        step: (current, direction) => {
            const size = decimals ? 10 ** -decimals : 1
            const next = Math.round(((current ?? 0) + direction * size) / size) * size
            return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next))
        },
    })
    return (
        <Shell
            id={id ?? generated}
            unit={unit}
            reason={field.reason}
            className={className}
            describedBy={describedBy}
            input={(extra) => (
                <input
                    ref={ref}
                    type="text"
                    inputMode={decimals === 0 ? "numeric" : "decimal"}
                    autoComplete="off"
                    className={cn(inner, "text-right")}
                    aria-invalid={invalidFromOutside}
                    {...props}
                    {...extra}
                    {...field.inputProps}
                />
            )}
        />
    )
})

/** Money as whole cents with the currency in the field (E-06). */
export const MoneyInput = React.forwardRef<HTMLInputElement, ShellProps & {
    cents: number | null
    onChange: (cents: number | null) => void
    currency?: string
}>(function MoneyInput({ cents, onChange, currency = "CHF", unit, onInvalid, className, id, "aria-describedby": describedBy, "aria-invalid": invalidFromOutside, ...props }, ref) {
    const generated = React.useId()
    const field = useReadField<number>({
        value: cents,
        onChange,
        onInvalid,
        write: formatMoney,
        read: (text) => {
            const r = parseMoney(text)
            return r.ok ? { ok: true, value: r.cents } : r
        },
        step: (current, direction) => (current ?? 0) + direction * 100,
    })
    return (
        <Shell
            id={id ?? generated}
            unit={unit ?? currency}
            reason={field.reason}
            className={className}
            describedBy={describedBy}
            input={(extra) => (
                <input
                    ref={ref}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={cn(inner, "text-right")}
                    aria-invalid={invalidFromOutside}
                    {...props}
                    {...extra}
                    {...field.inputProps}
                />
            )}
        />
    )
})
