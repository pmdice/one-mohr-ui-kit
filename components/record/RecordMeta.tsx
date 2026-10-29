"use client"

import * as React from "react"
import { NavLink } from "@/components/nav/NavLink"
import { formatDateTime, formatRelative } from "@/components/status/time"
import { CopyButton } from "./CopyButton"

/** Who created and changed the record, small at the end of the side column (D-10). */
export function RecordMeta({ created, updated, now, id, historyHref }: {
    created: { by: string; at: number }
    updated?: { by: string; at: number }
    now: number
    /** Internal id: only here, and copyable. */
    id?: string
    historyHref?: string
}) {
    return (
        <div className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-fg-muted">
            <p className="m-0" title={formatDateTime(created.at)}>Angelegt von {created.by} · {formatRelative(created.at, now)}</p>
            {updated && <p className="m-0" title={formatDateTime(updated.at)}>Geändert von {updated.by} · {formatRelative(updated.at, now)}</p>}
            {id && (
                <p className="m-0 flex items-center gap-1">
                    Interne ID <span className="font-mono">{id}</span>
                    <CopyButton value={id} label="Interne ID" />
                </p>
            )}
            {historyHref && <NavLink href={historyHref} className="w-fit rounded-control text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">Ganzer Verlauf</NavLink>}
        </div>
    )
}
