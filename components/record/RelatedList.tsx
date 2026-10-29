import * as React from "react"
import { NavLink } from "@/components/nav/NavLink"
import { Button } from "@/components/atoms/Button/Button"

/**
 * Records that belong to this one, on its page (D-09): count in the title, the first few as a short list,
 * "Alle N anzeigen" to the filtered list; when empty a sentence and the action that fills it.
 */
export function RelatedList({ title, count, moreHref, emptyText, emptyAction, children, shown = 5 }: {
    title: string
    count: number
    /** The full list, filtered to this record (L-05). */
    moreHref?: string
    emptyText: string
    emptyAction?: { label: string; onClick: () => void }
    /** The first `shown` entries as <li> elements; the caller cuts the list. */
    children?: React.ReactNode
    shown?: number
}) {
    const id = React.useId()
    return (
        <section aria-labelledby={id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
                <h2 id={id} className="m-0 text-base font-semibold text-fg">
                    {title} <span className="font-mono text-sm font-normal tabular-nums text-fg-subtle">{count}</span>
                </h2>
                {moreHref && count > shown && (
                    <NavLink href={moreHref} className="rounded-control text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        Alle {count} anzeigen
                    </NavLink>
                )}
            </div>
            {count === 0 ? (
                <div className="flex flex-wrap items-center gap-3 rounded-panel border border-dashed border-border-strong px-4 py-3 text-sm text-fg-muted">
                    {emptyText}
                    {emptyAction && <Button size="sm" variant="outline" onClick={emptyAction.onClick}>{emptyAction.label}</Button>}
                </div>
            ) : (
                <ul className="m-0 list-none divide-y divide-border rounded-panel border border-border bg-surface p-0 text-sm">{children}</ul>
            )}
        </section>
    )
}
