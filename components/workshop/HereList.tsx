"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { formatDuration, overdueHint } from "@/components/status/time"
import { cn } from "@/lib/utils"

export type HereItem = { id: string; number: string; since: number; norm?: number }

/**
 * What lies at this station, the longest first, so the table and the screen agree (W-08). Each row shows
 * its time against the usual time as a bar that turns to warning once it is exceeded (S-03).
 */
export function HereList({ station, items, now, onSelect, selected, className }: {
    station: string
    items: HereItem[]
    now: number
    onSelect: (id: string) => void
    /** The slip whose card is shown. */
    selected?: string | null
    className?: string
}) {
    const id = React.useId()
    const sorted = [...items].sort((a, b) => a.since - b.since)
    return (
        <section className={cn("flex flex-col gap-3", className)}>
            <h2 id={id} className="m-0 flex items-baseline gap-2 text-lg font-semibold text-fg">
                Jetzt an {station} ({items.length})
            </h2>
            {sorted.length === 0
                ? <p className="m-0 rounded-panel border border-dashed border-border px-4 py-5 text-lg text-fg-muted">Nichts eingescannt</p>
                : (
                    <ul aria-labelledby={id} className="m-0 flex list-none flex-col gap-2 p-0">
                        {sorted.map((item) => {
                            const spent = now - item.since
                            const overdue = overdueHint(spent, item.norm)
                            const share = item.norm ? Math.min(1, spent / item.norm) : 0
                            const current = item.id === selected
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        aria-pressed={current}
                                        onClick={() => onSelect(item.id)}
                                        className={cn(
                                            "flex min-h-14 w-full flex-col gap-2 rounded-panel border-2 bg-surface px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:bg-surface-sunken",
                                            current ? "border-fg" : "border-border"
                                        )}
                                    >
                                        <span className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                            <span className="font-mono text-xl font-medium text-fg">{item.number}</span>
                                            <span className={cn("text-lg tabular-nums", overdue ? "font-semibold text-warning" : "text-fg-muted")}>
                                                {formatDuration(spent)}{item.norm && <span className="font-normal text-fg-muted"> / {formatDuration(item.norm)}</span>}
                                            </span>
                                        </span>
                                        {item.norm && (
                                            <span className="h-1.5 w-full overflow-hidden rounded-control bg-surface-sunken" aria-hidden="true">
                                                <span className={cn("block h-full", overdue ? "bg-warning" : "bg-fg-subtle")} style={{ width: `${share * 100}%` }} />
                                            </span>
                                        )}
                                        {overdue && (
                                            <span className="inline-flex items-center gap-1.5 text-base font-medium text-warning">
                                                <AlertTriangle className="h-4 w-4" aria-hidden="true" />{overdue}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
        </section>
    )
}
