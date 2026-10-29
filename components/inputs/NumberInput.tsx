"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Shell, inner, useReadField, type ShellProps } from "./field"
import { formatMoney, formatNumber, parseMoney, parseNumber } from "./parse"

/** Number with unit, Swiss grouping, arrows to step (E-02, E-04). */
export const NumberInput = React.forwardRef<HTMLInputElement, ShellProps & {
    value: number | null
    onChange: (value: number | null) => void
    decimals?: number
    min?: number
    max?: number
}>(function NumberInput({ value, onChange, decimals, min, max, unit, onInvalid, className, id, "aria-describedby": describedBy, "aria-invalid": invalidFromOutside, onFocus, onBlur, onKeyDown, ...props }, ref) {
    const generated = React.useId()
    const range = min !== undefined && max !== undefined ? `Erlaubt: ${formatNumber(min)} bis ${formatNumber(max)}` : min !== undefined ? `Mindestens ${formatNumber(min)}` : `Höchstens ${formatNumber(max ?? 0)}`
    const field = useReadField<number>({
        value,
        onChange,
        onInvalid,
        handlers: { onFocus, onBlur, onKeyDown },
        write: (v) => formatNumber(v, { decimals }),
        read: (text) => {
            const r = parseNumber(text, { decimals })
            if (!r.ok || r.value === null) return r
            if ((min !== undefined && r.value < min) || (max !== undefined && r.value > max)) return { ok: false, reason: range }
            return r
        },
        step: (current, direction) => {
            // Step in whole units of the last place, so no floating point drift reaches the value
            const factor = 10 ** (decimals ?? 0)
            const next = (Math.round((current ?? 0) * factor) + direction) / factor
            return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next))
        },
    })
    return (
        <Shell
            outsideError={Boolean(invalidFromOutside)}
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
}>(function MoneyInput({ cents, onChange, currency = "CHF", unit, onInvalid, className, id, "aria-describedby": describedBy, "aria-invalid": invalidFromOutside, onFocus, onBlur, onKeyDown, ...props }, ref) {
    const generated = React.useId()
    const field = useReadField<number>({
        value: cents,
        onChange,
        onInvalid,
        handlers: { onFocus, onBlur, onKeyDown },
        write: formatMoney,
        read: (text) => {
            const r = parseMoney(text)
            return r.ok ? { ok: true, value: r.cents } : r
        },
        step: (current, direction) => (current ?? 0) + direction * 100,
    })
    return (
        <Shell
            outsideError={Boolean(invalidFromOutside)}
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
