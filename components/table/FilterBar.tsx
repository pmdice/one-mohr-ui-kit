"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { cn } from "@/lib/utils"
import { formatNumber } from "./format"

export type FilterField = { id: string; label: string; options: { value: string; label: string }[] }
export type ActiveFilter = { field: string; value: string }

interface FilterBarProps {
    fields: FilterField[]
    active: ActiveFilter[]
    onChange: (filters: ActiveFilter[]) => void
    total: number
    filteredTotal: number
    /** Plural noun for the count, e.g. "Laufzettel" */
    noun: string
    /** Whether anything narrows the list, including a search outside the chips; defaults to "chips present" */
    filtered?: boolean
    /** Usually the list search field */
    children?: React.ReactNode
}

const select = "h-7 w-full rounded-control border border-border bg-surface px-1.5 text-xs text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"

/** Every active filter visible as a chip, the count always in view (L-05, L-12). */
export function FilterBar({ fields, active, onChange, total, filteredTotal, noun, filtered: narrowed, children }: FilterBarProps) {
    const [adding, setAdding] = React.useState(false)
    const [field, setField] = React.useState(fields[0]?.id ?? "")
    const [value, setValue] = React.useState("")
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const popoverRef = React.useRef<HTMLDivElement>(null)
    const titleId = React.useId()

    const labelOf = (f: ActiveFilter) => {
        const def = fields.find((d) => d.id === f.field)
        return { field: def?.label ?? f.field, value: def?.options.find((o) => o.value === f.value)?.label ?? f.value }
    }
    const options = fields.find((f) => f.id === field)?.options ?? []

    React.useEffect(() => {
        if (!adding) return
        popoverRef.current?.querySelector("select")?.focus()
        const onDown = (e: MouseEvent) => {
            if (!popoverRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) setAdding(false)
        }
        document.addEventListener("mousedown", onDown)
        return () => document.removeEventListener("mousedown", onDown)
    }, [adding])

    const add = () => {
        const chosen = value || options[0]?.value
        if (!chosen) return
        if (!active.some((f) => f.field === field && f.value === chosen)) onChange([...active, { field, value: chosen }])
        setAdding(false)
        setValue("")
        triggerRef.current?.focus()
    }

    const filtered = active.length > 0
    const counted = narrowed ?? filtered

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
                {children}
                <div className="relative">
                    <Button ref={triggerRef} type="button" variant="outline" size="sm" aria-expanded={adding} onClick={() => setAdding((a) => !a)}>
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">+ Filter</span>
                        <span aria-hidden="true">Filter</span>
                    </Button>
                    {adding && (
                        <div
                            ref={popoverRef}
                            role="dialog"
                            aria-labelledby={titleId}
                            onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); setAdding(false); triggerRef.current?.focus() } }}
                            className="absolute left-0 top-full z-40 mt-1 flex w-60 flex-col gap-2 rounded-panel border border-border bg-surface-raised p-3 shadow-lg"
                        >
                            <p id={titleId} className="m-0 text-xs font-medium text-fg">Filter hinzufügen</p>
                            <label className="flex flex-col gap-1 text-xs text-fg-muted">
                                Feld
                                <select aria-label="Feld" className={select} value={field} onChange={(e) => { setField(e.target.value); setValue("") }}>
                                    {fields.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1 text-xs text-fg-muted">
                                Wert
                                <select aria-label="Wert" className={select} value={value || options[0]?.value} onChange={(e) => setValue(e.target.value)}>
                                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </label>
                            <Button type="button" size="sm" onClick={add}>Hinzufügen</Button>
                        </div>
                    )}
                </div>
                <span className="ml-auto text-xs tabular-nums text-fg-muted" aria-live="polite">
                    {counted ? `${formatNumber(filteredTotal)} von ${formatNumber(total)} ${noun}` : `${formatNumber(total)} ${noun}`}
                </span>
            </div>
            {filtered && (
                <ul className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0" aria-label="Aktive Filter">
                    {active.map((f) => {
                        const l = labelOf(f)
                        return (
                            <li key={`${f.field}:${f.value}`} className="flex items-center gap-1 rounded-control border border-border bg-accent-subtle py-0.5 pl-2 pr-0.5 text-xs text-fg">
                                <span>{l.field}: {l.value}</span>
                                <button
                                    type="button"
                                    aria-label={`Filter ${l.field}: ${l.value} entfernen`}
                                    onClick={() => onChange(active.filter((a) => a !== f))}
                                    className={cn("flex h-5 w-5 items-center justify-center rounded-control text-fg-muted hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus")}
                                >
                                    <X className="h-3 w-3" aria-hidden="true" />
                                </button>
                            </li>
                        )
                    })}
                    {active.length >= 2 && (
                        <li>
                            <button type="button" onClick={() => onChange([])} className="rounded-control px-1.5 py-0.5 text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                                Alle zurücksetzen
                            </button>
                        </li>
                    )}
                </ul>
            )}
        </div>
    )
}
