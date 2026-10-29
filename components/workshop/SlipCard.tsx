import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Only what is needed at the station: five facts and the notes that prevent a mistake (W-05). Laid out
 * like the printed slip – the number big on top – so paper and screen are matched at a glance.
 */
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
    const [base, part] = number.split(/\s*–\s*/)
    const facts: [string, React.ReactNode][] = [
        ["Kunde", customer],
        ["Material", material],
        ["Stück", pieces],
        ["Dringlichkeit", urgency],
    ]
    return (
        <section aria-labelledby={id} className={cn("relative flex flex-col overflow-hidden rounded-panel border border-border bg-surface-raised", className)}>
            {/* The perforated top edge of the paper slip */}
            <span className="h-2 border-b-2 border-dashed border-border bg-surface-sunken" aria-hidden="true" />
            <div className="flex flex-col gap-4 p-5">
                <h2 id={id} className="sr-only">{number}</h2>
                <dl className="m-0 flex flex-col gap-4">
                    <div className="flex items-end justify-between gap-3 border-b border-border pb-4">
                        <div className="flex flex-col">
                            <dt className="text-sm text-fg-muted">Kennung</dt>
                            <dd className="m-0 font-mono text-4xl font-semibold leading-none tracking-tight text-fg">
                                {base}{part && <span className="sr-only"> – {part}</span>}
                            </dd>
                        </div>
                        {part && (
                            <span className="flex flex-col items-center rounded-control bg-fg px-3 py-1.5 text-surface" aria-hidden="true">
                                <span className="text-xs uppercase tracking-[0.12em] opacity-80">Zettel</span>
                                <span className="font-mono text-2xl font-semibold leading-none">{part}</span>
                            </span>
                        )}
                    </div>
                    {notes.map((note) => (
                        <p key={note} role="note" className="m-0 flex items-center gap-3 rounded-panel border-2 border-warning bg-warning-subtle px-4 py-3 text-xl font-semibold text-fg">
                            <AlertTriangle className="h-7 w-7 shrink-0 text-warning" aria-hidden="true" />{note}
                        </p>
                    ))}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {facts.map(([term, value]) => (
                            <div key={term} className="flex flex-col">
                                <dt className="text-sm text-fg-muted">{term}</dt>
                                <dd className="m-0 text-xl font-medium text-fg">{value}</dd>
                            </div>
                        ))}
                    </div>
                </dl>
            </div>
        </section>
    )
}
