import * as React from "react"
import { NavLink } from "@/components/nav/NavLink"
import { cn } from "@/lib/utils"

const TONES = { warning: "text-warning", danger: "text-danger", success: "text-success" } as const

/** A number that leads into the list behind it (A-05); the list shows the same number (L-12). */
export function StatTile({ label, value, href, detail, tone }: {
    label: string
    value: number | string
    href: string
    /** What is counted: "Laufzettel". */
    detail?: string
    tone?: keyof typeof TONES
}) {
    return (
        <NavLink
            href={href}
            className="group flex flex-col gap-0.5 rounded-panel border border-border bg-surface px-4 py-3 no-underline transition-colors duration-fast hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
            <span className={cn("text-xl font-semibold tabular-nums text-fg", tone && TONES[tone])}>{value} <span className="text-sm font-normal text-fg">{label}</span></span>
            {detail && <span className="text-xs text-fg-muted group-hover:text-fg">{detail} →</span>}
        </NavLink>
    )
}
