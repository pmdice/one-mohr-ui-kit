import * as React from "react"
import { NavLink } from "@/components/nav/NavLink"

/** The last records opened, as a way back after an interruption (A-07). */
export function RecentList({ items }: { items: { id: string; kind: string; label: string; href: string }[] }) {
    return (
        <section aria-label="Zuletzt geöffnet" className="flex flex-col gap-2">
            <h2 className="m-0 text-sm font-semibold text-fg">Zuletzt geöffnet</h2>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {items.slice(0, 5).map((item) => (
                    <li key={item.id}>
                        <NavLink href={item.href} className="flex items-baseline gap-2 rounded-control px-1 py-0.5 text-sm text-fg no-underline hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                            <span className="w-16 shrink-0 text-xs text-fg-subtle">{item.kind}</span>
                            <span className="truncate">{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </section>
    )
}
