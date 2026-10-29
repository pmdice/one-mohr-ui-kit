import * as React from "react"

/** Who is logged in and as what (B-05). */
export function RoleBadge({ name, role }: { name: string; role: string }) {
    return (
        <span className="inline-flex items-center gap-2 text-sm">
            <span className="text-fg">{name}</span>
            <span className="rounded-control border border-border px-1.5 py-0.5 text-xs text-fg-muted">{role}</span>
        </span>
    )
}
