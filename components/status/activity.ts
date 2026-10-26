import type * as React from "react"
import type { StatusDef } from "./workflow"

/** One line of history (S-09). Entries are only ever added; an undo is a new entry. */
export type ActivityEntry = {
    id: string
    /** ms */
    at: number
    actor: string
    via: "hand" | "scan" | "system"
    /** Device or station of a scan. */
    device?: string
    kind: "status" | "location" | "field"
    /** Label of the field, not its column name. */
    field?: string
    from?: React.ReactNode
    to?: React.ReactNode
    /** Predicate for location entries: "hat eingescannt in Guss". */
    text?: string
    /** Status entries: shown as badges (S-01, S-11). */
    statusFrom?: StatusDef
    statusTo?: StatusDef
    /** Reason given with the change. */
    note?: string
}

export type ActivityGroup = { id: string; entries: ActivityEntry[] }

/**
 * Newest first; consecutive field changes of one person, each within `windowMs` of the next, become one
 * group (S-11). Status and location changes always stand alone.
 */
export function groupActivity(entries: ActivityEntry[], windowMs = 5 * 60_000): ActivityGroup[] {
    const sorted = [...entries].sort((a, b) => b.at - a.at)
    const groups: ActivityGroup[] = []
    for (const entry of sorted) {
        const group = groups[groups.length - 1]
        const prev = group?.entries[group.entries.length - 1]
        if (prev && entry.kind === "field" && prev.kind === "field" && prev.actor === entry.actor && prev.at - entry.at <= windowMs) {
            group.entries.push(entry)
        } else {
            groups.push({ id: entry.id, entries: [entry] })
        }
    }
    return groups
}
