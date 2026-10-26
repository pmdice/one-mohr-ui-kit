"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { NavLink } from "@/components/nav/NavLink"
import { ViewFilter } from "@/components/nav/ViewFilter"
import { cn } from "@/lib/utils"
import { groupActivity, type ActivityEntry } from "./activity"
import { StatusBadge } from "./StatusBadge"
import { formatDateTime, formatRelative } from "./time"
import { useNow } from "./useNow"

export type ActivityFilter = "all" | "status" | "fields"

const FILTERS: { id: ActivityFilter; label: string }[] = [
    { id: "all", label: "Alle" },
    { id: "status", label: "Status & Ort" },
    { id: "fields", label: "Felder" },
]

const matches = (filter: ActivityFilter) => (e: ActivityEntry) =>
    filter === "all" || (filter === "fields" ? e.kind === "field" : e.kind !== "field")

/** One entry as a sentence: names and labels, never ids or column names (S-11). */
function Sentence({ entry }: { entry: ActivityEntry }) {
    return (
        <>
            <span className="font-medium text-fg">{entry.actor}</span>{" "}
            {entry.kind === "field" && <>hat {entry.field} von <Value>{entry.from}</Value> auf <Value>{entry.to}</Value> geändert</>}
            {entry.kind === "status" && (
                <>hat Status von {entry.statusFrom ? <StatusBadge status={entry.statusFrom} /> : entry.from} auf {entry.statusTo ? <StatusBadge status={entry.statusTo} /> : entry.to} gesetzt</>
            )}
            {entry.kind === "location" && entry.text}
            {entry.note && <> – {entry.note}</>}
            {entry.via === "scan" && <span className="text-fg-muted"> · per Scan{entry.device ? ` (${entry.device})` : ""}</span>}
            {entry.via === "system" && <span className="text-fg-muted"> · automatisch</span>}
        </>
    )
}

const Value = ({ children }: { children: React.ReactNode }) => <span className="font-medium text-fg">{children}</span>

const Time = ({ at, now }: { at: number; now: number }) => (
    <time dateTime={new Date(at).toISOString()} title={formatDateTime(at)} className="shrink-0 whitespace-nowrap text-xs text-fg-subtle">
        {formatRelative(at, now)}
    </time>
)

/** History as sentences, newest first, series folded, filterable; `limit` gives the short form (S-11, S-12). */
export function ActivityLog({ entries, now: givenNow, filter = "all", filterHref, limit, moreHref, className }: {
    entries: ActivityEntry[]
    now?: number
    filter?: ActivityFilter
    /** Where each filter lives (in the URL, N-03); without it no filter is shown. */
    filterHref?: (filter: ActivityFilter) => string
    /** Number of lines in the short form. */
    limit?: number
    moreHref?: string
    className?: string
}) {
    const now = useNow(givenNow)
    const [open, setOpen] = React.useState<Set<string>>(new Set())
    const all = groupActivity(entries.filter(matches(filter)))
    const groups = limit ? all.slice(0, limit) : all
    const toggle = (id: string) => setOpen((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
    })

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            {filterHref && (
                <ViewFilter label="Verlauf filtern" current={filter} views={FILTERS.map((f) => ({ id: f.id, label: f.label, href: filterHref(f.id) }))} />
            )}
            {groups.length === 0
                ? <p className="m-0 text-sm text-fg-muted">Noch keine Einträge</p>
                : (
                    <ul aria-label="Verlauf" className="m-0 flex list-none flex-col gap-2 p-0">
                        {groups.map(({ id, entries: group }) => {
                            const [first] = group
                            if (group.length === 1) {
                                return (
                                    <li key={id} className="flex items-baseline justify-between gap-3 text-sm text-fg-muted">
                                        <span className="min-w-0"><Sentence entry={first} /></span>
                                        <Time at={first.at} now={now} />
                                    </li>
                                )
                            }
                            const expanded = open.has(id)
                            return (
                                <li key={id} className="flex flex-col gap-1 text-sm text-fg-muted">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <button
                                            type="button"
                                            aria-expanded={expanded}
                                            onClick={() => toggle(id)}
                                            className="flex min-w-0 items-center gap-1 rounded-control text-left hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                        >
                                            <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform", expanded && "rotate-90")} aria-hidden="true" />
                                            <span><span className="font-medium text-fg">{first.actor}</span> hat {group.length} Felder geändert</span>
                                        </button>
                                        <Time at={first.at} now={now} />
                                    </div>
                                    {expanded && (
                                        <ul className="m-0 flex list-none flex-col gap-1 border-l border-border py-0 pl-4 ml-1.5">
                                            {group.map((e) => (
                                                <li key={e.id} className="flex items-baseline justify-between gap-3">
                                                    <span className="min-w-0"><Sentence entry={e} /></span>
                                                    <Time at={e.at} now={now} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            {limit && moreHref && all.length > 0 && (
                <NavLink href={moreHref} className="self-start text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    Ganzer Verlauf
                </NavLink>
            )}
        </div>
    )
}
