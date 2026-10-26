import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

/** Only what is needed at the station: five facts and the notes that prevent a mistake (W-05). */
export function SlipCard({ number, customer, material, pieces, urgency, notes = [], className }: {
    number: string
    customer: string
    material: string
    pieces: number
    urgency: React.ReactNode
    notes?: string[]
    className?: string
}) {
    const id = React.useId()
    const facts: [string, React.ReactNode][] = [
        ["Kennung", <span key="n" className="font-mono">{number}</span>],
        ["Kunde", customer],
        ["Material", material],
        ["Stück", pieces],
        ["Dringlichkeit", urgency],
    ]
    return (
        <section aria-labelledby={id} className={cn("flex flex-col gap-4 rounded-panel border border-border bg-surface p-5", className)}>
            <h2 id={id} className="sr-only">{number}</h2>
            {notes.map((note) => (
                <p key={note} role="note" className="m-0 flex items-center gap-3 rounded-panel border-2 border-warning bg-warning-subtle px-4 py-3 text-xl font-semibold text-fg">
                    <AlertTriangle className="h-7 w-7 shrink-0 text-warning" aria-hidden="true" />{note}
                </p>
            ))}
            <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {facts.map(([term, value]) => (
                    <div key={term} className="flex flex-col">
                        <dt className="text-sm text-fg-muted">{term}</dt>
                        <dd className="m-0 text-xl text-fg">{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}
