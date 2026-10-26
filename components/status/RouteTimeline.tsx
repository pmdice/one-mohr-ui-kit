import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, formatDuration, overdueHint } from "./time"

export type Visit = {
    station: string
    label: string
    /** ms */
    in: number
    /** ms, null while the slip is still there */
    out: number | null
    /** Usual time at this station (ms). */
    norm?: number
}

// A timeline dot is a circle, not a pill
const DOT = "mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2" // token-guard: allow

/** The way of a slip through the stations, first visit first, repeated visits counted (S-10). */
export function RouteTimeline({ visits, now = Date.now(), className }: { visits: Visit[]; now?: number; className?: string }) {
    if (visits.length === 0) return <p className={cn("m-0 text-sm text-fg-muted", className)}>Noch nicht eingescannt</p>
    const seen = new Map<string, number>()
    return (
        <ol aria-label="Durchlauf" className={cn("m-0 flex list-none flex-col p-0", className)}>
            {visits.map((v, i) => {
                const nth = (seen.get(v.station) ?? 0) + 1
                seen.set(v.station, nth)
                const current = v.out === null
                const duration = (v.out ?? now) - v.in
                const overdue = overdueHint(duration, v.norm)
                return (
                    <li key={`${v.station}-${v.in}`} aria-current={current ? "step" : undefined} className="relative flex gap-3 pb-4 last:pb-0">
                        {i < visits.length - 1 && <span className="absolute left-[5px] top-4 bottom-0 w-px bg-border" aria-hidden="true" />}
                        <span className={cn(DOT, current ? "border-accent bg-accent" : "border-border-strong bg-surface")} aria-hidden="true" />
                        <div className="flex min-w-0 flex-col gap-0.5 text-sm">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                                <span data-station className="font-medium text-fg">{v.label}</span>
                                {nth >= 2 && <span className="text-xs text-fg-muted">{nth}. Durchlauf</span>}
                                {current && <span className="rounded-control bg-accent-subtle px-1.5 text-xs font-medium text-accent">jetzt hier</span>}
                            </div>
                            <div className="flex flex-wrap gap-x-3 text-xs text-fg-muted tabular-nums">
                                <span>Ein {formatDateTime(v.in)}</span>
                                <span>Aus {v.out === null ? "—" : formatDateTime(v.out)}</span>
                                <span>Dauer {formatDuration(duration)}</span>
                            </div>
                            {overdue && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />{overdue}
                                </span>
                            )}
                        </div>
                    </li>
                )
            })}
        </ol>
    )
}
