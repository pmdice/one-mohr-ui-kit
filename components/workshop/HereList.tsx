"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { formatDuration, overdueHint } from "@/components/status/time"
import { cn } from "@/lib/utils"

export type HereItem = { id: string; number: string; since: number; norm?: number }

/** What lies at this station, the longest first, so the table and the screen agree (W-08). */
export function HereList({ station, items, now, onSelect, className }: {
    station: string
    items: HereItem[]
    now: number
    onSelect: (id: string) => void
    className?: string
}) {
    const id = React.useId()
    const sorted = [...items].sort((a, b) => a.since - b.since)
    return (
        <section className={cn("flex flex-col gap-3", className)}>
            <h2 id={id} className="m-0 text-lg font-semibold text-fg">Jetzt an {station} ({items.length})</h2>
            {sorted.length === 0
                ? <p className="m-0 text-lg text-fg-muted">Nichts eingescannt</p>
                : (
                    <ul aria-labelledby={id} className="m-0 flex list-none flex-col gap-2 p-0">
                        {sorted.map((item) => {
                            const overdue = overdueHint(now - item.since, item.norm)
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(item.id)}
                                        className="flex min-h-12 w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-panel border border-border bg-surface px-4 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:bg-surface-sunken"
                                    >
                                        <span className="font-mono text-lg text-fg">{item.number}</span>
                                        <span className="flex flex-wrap items-center gap-x-3 text-base text-fg-muted">
                                            {formatDuration(now - item.since)}
                                            {overdue && <span className="inline-flex items-center gap-1 font-medium text-warning"><AlertTriangle className="h-4 w-4" aria-hidden="true" />{overdue}</span>}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
        </section>
    )
}
