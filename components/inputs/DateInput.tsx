"use client"

import * as React from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Shell, inner, useReadField, type ShellProps } from "./field"
import { addDays, addMonths, formatDate, parseDate, toIso, weekday } from "./parse"

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
const WEEK = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

/** Today as an ISO date in local time. */
export function todayIso(): string {
    const d = new Date()
    return toIso(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

const longLabel = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number)
    return `${d}. ${MONTHS[m - 1]} ${y}`
}

/**
 * Date as TT.MM.JJJJ with the weekday in the field (E-05). Typing is the main way ("14.11.", "morgen", "+3");
 * the calendar helps, it is not the only door.
 */
export const DateInput = React.forwardRef<HTMLInputElement, ShellProps & {
    /** ISO date (YYYY-MM-DD) or null. */
    value: string | null
    onChange: (value: string | null) => void
    /** ISO date for "heute"; defaults to the device's date. */
    today?: string
    min?: string
    max?: string
}>(function DateInput({ value, onChange, today: givenToday, min, max, onInvalid, className, id, "aria-describedby": describedBy, "aria-invalid": invalidFromOutside, ...props }, forwarded) {
    const generated = React.useId()
    const [fallbackToday] = React.useState(todayIso)
    const today = givenToday ?? fallbackToday
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(forwarded, () => inputRef.current as HTMLInputElement)
    const [open, setOpen] = React.useState(false)
    const wrapper = React.useRef<HTMLDivElement>(null)

    const field = useReadField<string>({
        value,
        onChange,
        onInvalid,
        write: formatDate,
        read: (text) => {
            const r = parseDate(text, today)
            if (!r.ok || r.value === null) return r
            if (min && r.value < min) return { ok: false, reason: `Frühestens ${formatDate(min)}` }
            if (max && r.value > max) return { ok: false, reason: `Spätestens ${formatDate(max)}` }
            return r
        },
        step: (current, direction) => addDays(current ?? today, direction),
    })

    // A click elsewhere closes the calendar
    React.useEffect(() => {
        if (!open) return
        const onDown = (e: MouseEvent) => { if (!wrapper.current?.contains(e.target as Node)) setOpen(false) }
        document.addEventListener("mousedown", onDown)
        return () => document.removeEventListener("mousedown", onDown)
    }, [open])

    const close = () => { setOpen(false); inputRef.current?.focus() }

    return (
        <div ref={wrapper} className="relative w-full">
            <Shell
                id={id ?? generated}
                unit={value && !field.reason ? weekday(value) : undefined}
                reason={field.reason}
                className={className}
                describedBy={describedBy}
                after={
                    <button
                        type="button"
                        aria-label="Kalender öffnen"
                        aria-expanded={open}
                        onClick={() => setOpen((o) => !o)}
                        className="mr-1 flex h-[calc(var(--control-h)-0.5rem)] shrink-0 items-center rounded-control px-1.5 text-fg-muted hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    </button>
                }
                input={(extra) => (
                    <input
                        ref={inputRef}
                        type="text"
                        autoComplete="off"
                        placeholder="TT.MM.JJJJ"
                        className={inner}
                        aria-invalid={invalidFromOutside}
                        {...props}
                        {...extra}
                        {...field.inputProps}
                    />
                )}
            />
            {open && (
                <Calendar
                    selected={value}
                    today={today}
                    min={min}
                    max={max}
                    onPick={(iso) => { field.pick(iso); close() }}
                    onClose={close}
                />
            )}
        </div>
    )
})

/** Month grid (ARIA grid): arrows move by day and week, Page Up/Down by month, Home/End to the week's ends. */
export function Calendar({ selected, today, min, max, onPick, onClose }: {
    selected: string | null
    today: string
    min?: string
    max?: string
    onPick: (iso: string) => void
    onClose: () => void
}) {
    const [focusDay, setFocusDay] = React.useState(selected ?? today)
    const gridRef = React.useRef<HTMLTableElement>(null)
    const [y, m] = focusDay.split("-").map(Number)
    const title = `${MONTHS[m - 1]} ${y}`

    React.useEffect(() => {
        gridRef.current?.querySelector<HTMLElement>(`[data-day="${focusDay}"]`)?.focus()
    }, [focusDay])

    const disabled = (iso: string) => (min !== undefined && iso < min) || (max !== undefined && iso > max)

    const first = toIso(y, m, 1)
    const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7
    const length = new Date(Date.UTC(y, m, 0)).getUTCDate()
    const cells: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length }, (_, i) => addDays(first, i))]
    while (cells.length % 7) cells.push(null)
    const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

    const onKeyDown = (e: React.KeyboardEvent) => {
        const moves: Record<string, () => string> = {
            ArrowLeft: () => addDays(focusDay, -1),
            ArrowRight: () => addDays(focusDay, 1),
            ArrowUp: () => addDays(focusDay, -7),
            ArrowDown: () => addDays(focusDay, 7),
            PageUp: () => addMonths(focusDay, -1),
            PageDown: () => addMonths(focusDay, 1),
            Home: () => addDays(focusDay, -((new Date(`${focusDay}T00:00:00Z`).getUTCDay() + 6) % 7)),
            End: () => addDays(focusDay, 6 - ((new Date(`${focusDay}T00:00:00Z`).getUTCDay() + 6) % 7)),
        }
        if (moves[e.key]) { e.preventDefault(); setFocusDay(moves[e.key]()); return }
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!disabled(focusDay)) onPick(focusDay); return }
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose() }
    }

    const navButton = "flex h-7 w-7 items-center justify-center rounded-control text-fg-muted hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"

    return (
        <div
            className="absolute left-0 top-full z-40 mt-1 w-72 rounded-panel bg-surface-raised p-3 text-sm text-fg shadow-overlay motion-safe:animate-[dialog-in_var(--dur-base)_var(--ease-out)]"
            onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose() } }}
        >
            <div className="mb-2 flex items-center justify-between">
                <button type="button" aria-label="Vorheriger Monat" className={navButton} onClick={() => setFocusDay(addMonths(focusDay, -1))}>
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="font-medium" aria-live="polite">{title}</span>
                <button type="button" aria-label="Nächster Monat" className={navButton} onClick={() => setFocusDay(addMonths(focusDay, 1))}>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
            <table ref={gridRef} role="grid" aria-label={title} onKeyDown={onKeyDown} className="w-full border-collapse text-center">
                <thead>
                    <tr>{WEEK.map((d) => <th key={d} role="columnheader" scope="col" className="pb-1 text-xs font-normal text-fg-subtle">{d}</th>)}</tr>
                </thead>
                <tbody>
                    {weeks.map((week, i) => (
                        <tr key={i}>
                            {week.map((iso, j) => {
                                if (!iso) return <td key={j} role="gridcell" aria-hidden="true" />
                                const off = disabled(iso)
                                const isSelected = iso === selected
                                return (
                                    <td
                                        key={iso}
                                        role="gridcell"
                                        data-day={iso}
                                        tabIndex={iso === focusDay ? 0 : -1}
                                        aria-label={longLabel(iso)}
                                        aria-selected={isSelected}
                                        aria-current={iso === today ? "date" : undefined}
                                        aria-disabled={off || undefined}
                                        onClick={() => { if (!off) onPick(iso) }}
                                        className={cn(
                                            "h-8 cursor-pointer rounded-control font-mono text-xs tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus",
                                            isSelected ? "bg-accent text-accent-fg" : "hover:bg-surface-hover",
                                            iso === today && !isSelected && "font-semibold text-accent",
                                            off && "cursor-default text-fg-subtle line-through hover:bg-transparent"
                                        )}
                                    >
                                        {Number(iso.slice(8))}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
