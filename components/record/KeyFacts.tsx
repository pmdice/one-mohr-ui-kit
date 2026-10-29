import * as React from "react"
import { cn } from "@/lib/utils"

export interface KeyFact {
    label: string
    value: React.ReactNode
    /** One word of context: "in 5 Tagen", "Positionen fertig". */
    detail?: React.ReactNode
    /** Colours only the value (G-01). */
    tone?: "warning" | "danger" | "success"
}

const TONES = { warning: "text-warning", danger: "text-danger", success: "text-success" } as const

/** At most four numbers that matter for the work, right under the header (D-02). */
export function KeyFacts({ facts, className }: { facts: KeyFact[]; className?: string }) {
    return (
        <dl className={cn("m-0 grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-border bg-border sm:grid-cols-4", className)}>
            {facts.slice(0, 4).map((fact) => (
                <div key={fact.label} className="flex flex-col gap-0.5 bg-surface px-4 py-3">
                    <dt className="text-xs text-fg-muted">{fact.label}</dt>
                    <dd className="m-0 flex flex-col">
                        <span data-tone={fact.tone} className={cn("text-base font-semibold tabular-nums text-fg", fact.tone && TONES[fact.tone])}>{fact.value}</span>
                        {fact.detail && <span className="text-xs text-fg-muted">{fact.detail}</span>}
                    </dd>
                </div>
            ))}
        </dl>
    )
}
