import * as React from "react"
import { Check, X } from "lucide-react"
import { Unstyled } from "@storybook/addon-docs/blocks"

interface RuleExampleProps {
    good: React.ReactNode
    bad: React.ReactNode
    goodCaption?: string
    badCaption?: string
}

/** Good / bad side by side; stacks below 640px. */
export function RuleExample({ good, bad, goodCaption, badCaption }: RuleExampleProps) {
    return (
        // Unstyled: keep Storybook's docs typography out of the live examples
        <Unstyled>
            <div className="my-6 grid grid-cols-1 gap-4 font-sans text-sm sm:grid-cols-2" data-density="compact">
                <Panel tone="good" caption={goodCaption}>{good}</Panel>
                <Panel tone="bad" caption={badCaption}>{bad}</Panel>
            </div>
        </Unstyled>
    )
}

function Panel({ tone, caption, children }: { tone: "good" | "bad"; caption?: string; children: React.ReactNode }) {
    const good = tone === "good"
    return (
        <figure className="m-0 flex flex-col overflow-hidden rounded-panel border border-border bg-surface">
            <figcaption className={`flex items-center gap-1.5 border-b border-border px-3 py-2 text-xs font-semibold ${good ? "text-success" : "text-danger"}`}>
                {good ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
                {good ? "Gut" : "Schlecht"}
                {caption && <span className="font-normal text-fg-muted">· {caption}</span>}
            </figcaption>
            <div className="p-4 text-fg">{children}</div>
        </figure>
    )
}
