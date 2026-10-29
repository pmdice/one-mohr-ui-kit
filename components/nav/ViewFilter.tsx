import * as React from "react"
import { cn } from "@/lib/utils"
import { NavLink } from "./NavLink"

export type View = { id: string; label: string; href: string; count?: number }

/** Views of one list (N-09, N-11): a segmented switch with counts, visibly different from page tabs. */
export function ViewFilter({ views, current, label, className }: { views: View[]; current: string; label: string; className?: string }) {
    return (
        <div role="group" aria-label={label} className={cn("inline-flex flex-wrap gap-0.5 rounded-control border border-border bg-surface-sunken p-0.5", className)}>
            {views.map((view) => {
                const active = view.id === current
                return (
                    <NavLink
                        key={view.id}
                        href={view.href}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                            "flex items-center gap-1.5 rounded-[calc(var(--r-control)-2px)] px-2.5 py-1 text-xs whitespace-nowrap transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                            active ? "bg-surface font-medium text-fg shadow-sm" : "text-fg-muted hover:text-fg" // token-guard: allow — the chosen segment sits on its track
                        )}
                    >
                        {view.label}
                        {view.count !== undefined && (
                            <span className={cn("tabular-nums", active ? "text-fg-muted" : "text-fg-subtle")}>{view.count}</span>
                        )}
                    </NavLink>
                )
            })}
        </div>
    )
}
