import * as React from "react"
import { NavLink } from "@/components/nav/NavLink"
import { cn } from "@/lib/utils"

export interface QueueItem {
    id: string
    title: string
    /** Second line: customer, station. */
    meta?: string
    href: string
    /** Why it is here, in words: "seit 2 Tagen überfällig" (A-03). */
    reason: string
    tone?: "warning" | "danger"
}

/** What is up today (A-01): each line says why it is here; empty says so and what comes next (A-04). */
export function WorkQueue({ title, items, total = items.length, moreHref, empty, error }: {
    title: string
    items: QueueItem[]
    total?: number
    moreHref?: string
    empty: { text: string; next?: string }
    /** Loading failed: said as such, never shown as an empty (all clear) queue (L-07). */
    error?: { text: string; onRetry: () => void }
}) {
    const id = React.useId()
    return (
        <section aria-labelledby={id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
                <h2 id={id} className="m-0 text-base font-semibold text-fg">{title} <span className="font-mono text-sm font-normal tabular-nums text-fg-subtle">{total}</span></h2>
                {moreHref && total > items.length && (
                    <NavLink href={moreHref} className="rounded-control text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">Alle {total} anzeigen</NavLink>
                )}
            </div>
            {error ? (
                <div role="alert" className="flex flex-wrap items-center gap-3 rounded-panel border border-danger bg-danger-subtle px-4 py-3 text-sm text-fg">
                    {error.text}
                    <button type="button" onClick={error.onRetry} className="rounded-control font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">Erneut versuchen</button>
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col gap-0.5 rounded-panel border border-dashed border-border-strong px-4 py-3 text-sm">
                    <span className="text-fg">{empty.text}</span>
                    {empty.next && <span className="text-fg-muted">{empty.next}</span>}
                </div>
            ) : (
                <ul className="m-0 list-none divide-y divide-border rounded-panel border border-border bg-surface p-0">
                    {items.map((item) => (
                        <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-3 py-2">
                            <span className="flex min-w-0 flex-col">
                                <NavLink href={item.href} className="w-fit rounded-control font-mono text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{item.title}</NavLink>
                                {item.meta && <span className="text-xs text-fg-muted">{item.meta}</span>}
                            </span>
                            <span className={cn("text-sm text-fg-muted", item.tone === "warning" && "font-medium text-warning", item.tone === "danger" && "font-medium text-danger")}>{item.reason}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
