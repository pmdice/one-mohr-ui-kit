import * as React from "react"
import { cn } from "@/lib/utils"
import { NavLink } from "./NavLink"

export type PageTab = { label: string; href: string; count?: number }

/** Sub-pages of one object (N-11): links with an underline, never mistaken for list filters. */
export function PageTabs({ tabs, current, className }: { tabs: PageTab[]; current: string; className?: string }) {
    return (
        <nav aria-label="Seitenbereiche" className={cn("border-b border-border", className)}>
            <ul className="m-0 -mb-px flex list-none gap-4 overflow-x-auto p-0">
                {tabs.map((tab) => {
                    const active = tab.href === current
                    return (
                        <li key={tab.href}>
                            <NavLink
                                href={tab.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-1.5 border-b-2 px-0.5 pb-2 pt-1 text-sm whitespace-nowrap transition-colors",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                                    active ? "border-accent font-medium text-fg" : "border-transparent text-fg-muted hover:text-fg"
                                )}
                            >
                                {tab.label}
                                {tab.count !== undefined && <span className="text-xs tabular-nums text-fg-subtle">{tab.count}</span>}
                            </NavLink>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
