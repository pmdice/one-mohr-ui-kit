import * as React from "react"
import { ChevronRight } from "lucide-react"
import { Unstyled } from "@storybook/addon-docs/blocks"
import type { RuleGroup } from "./rules.types"

/** Link to a docs page from inside the preview iframe: navigate the manager, not the iframe. */
export function docsHref(docsId: string) {
    return `./?path=/docs/${docsId}`
}

/** Rule overview, grouped by topic: ID, title and the rule sentence per row. */
export function RuleIndex({ groups }: { groups: RuleGroup[] }) {
    return (
        <Unstyled>
            <div className="my-8 flex flex-col gap-8 font-sans text-fg" data-density="compact">
                {groups.map((group) => (
                    <section key={group.title} aria-labelledby={`group-${group.title}`}>
                        <div className="mb-2 flex items-baseline justify-between gap-4">
                            <h2 id={`group-${group.title}`} className="text-sm font-semibold text-fg">{group.title}</h2>
                            <p className="text-xs text-fg-muted">{group.description}</p>
                        </div>
                        <ul className="m-0 list-none divide-y divide-border overflow-hidden rounded-panel border border-border bg-surface p-0">
                            {group.rules.map((rule) => (
                                <li key={rule.id}>
                                    <a
                                        href={docsHref(rule.docsId)}
                                        target="_top"
                                        className="group flex items-start gap-4 px-4 py-3 no-underline transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                                    >
                                        <span className="mt-0.5 w-10 shrink-0 font-mono text-xs text-fg-subtle">{rule.id}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium text-fg">{rule.title}</span>
                                            <span className="mt-0.5 block text-sm leading-relaxed text-fg-muted">{rule.summary}</span>
                                        </span>
                                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </Unstyled>
    )
}
