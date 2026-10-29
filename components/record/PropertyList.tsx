import * as React from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

/** Properties of a record as label–value pairs in a fixed order (D-03). */
export function PropertyList({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <section aria-label={label} className={className}>
            <dl className="m-0 flex flex-col">{children}</dl>
        </section>
    )
}

export function Property({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-3 py-1.5", className)}>
            <dt className="pt-1 text-xs text-fg-muted">{label}</dt>
            <dd className="m-0 min-w-0 text-sm text-fg">{children}</dd>
        </div>
    )
}

/** A missing value says what is missing and, where allowed, offers to add it (D-04). */
export function EmptyValue({ text, onAdd, addLabel }: { text: string; onAdd?: () => void; addLabel?: string }) {
    // "Kein Liefertermin" → "Liefertermin hinzufügen"
    const what = text.replace(/^(Kein|Keine|Keinen)\s+/, "")
    return (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
            <span className="text-fg-subtle">{text}</span>
            {onAdd && (
                <button
                    type="button"
                    onClick={onAdd}
                    aria-label={addLabel ?? `${what} hinzufügen`}
                    className="inline-flex items-center gap-1 rounded-control text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                    <Plus className="h-3 w-3" aria-hidden="true" />Hinzufügen
                </button>
            )}
        </span>
    )
}
