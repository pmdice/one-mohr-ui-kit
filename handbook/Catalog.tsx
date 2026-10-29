import * as React from "react"
import { Unstyled } from "@storybook/addon-docs/blocks"
import { ALL_RULE_GROUPS } from "./allRules"
import { CATALOG } from "./catalog"
import { docsHref } from "./RuleIndex"

const FOLDERS: Record<string, string> = {
    atoms: "Grundbausteine",
    molecules: "Zusammengesetzte Bausteine",
    forms: "Formulare",
    nav: "Navigation & App-Rahmen",
    table: "Listen & Tabellen",
    status: "Status & Lebenszyklus",
    workshop: "Werkstatt",
}

const RULES = new Map(ALL_RULE_GROUPS.flatMap((g) => g.rules.map((r) => [r.id, r] as const)))

/** All components, grouped by folder: purpose, rules as links, path. */
export function Catalog() {
    const groups = Object.entries(FOLDERS).map(([folder, title]) => ({
        title,
        entries: CATALOG.filter((c) => c.path.split("/")[1] === folder),
    }))
    return (
        <Unstyled>
            <div className="my-8 flex flex-col gap-8 font-sans text-fg" data-density="compact">
                {groups.map((group) => (
                    <section key={group.title} aria-label={group.title}>
                        <h2 className="mb-2 text-sm font-semibold text-fg">{group.title}</h2>
                        <ul className="m-0 list-none divide-y divide-border overflow-hidden rounded-panel border border-border bg-surface p-0">
                            {group.entries.map((entry) => (
                                <li key={entry.path} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                                    <span className="w-40 shrink-0 font-mono text-xs text-fg">{entry.name}</span>
                                    <span className="min-w-0 flex-1 text-sm text-fg-muted">
                                        {entry.purpose}
                                        {entry.note && <span className="mt-0.5 block text-xs text-warning">{entry.note}</span>}
                                        <span className="mt-0.5 block font-mono text-xs text-fg-subtle">{entry.path}</span>
                                    </span>
                                    <span className="flex shrink-0 flex-wrap gap-1">
                                        {entry.rules.map((id) => (
                                            <a
                                                key={id}
                                                href={docsHref(RULES.get(id)!.docsId)}
                                                target="_top"
                                                title={RULES.get(id)!.title}
                                                className="rounded-control border border-border px-1.5 py-0.5 font-mono text-xs text-fg-muted no-underline hover:border-border-strong hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                            >
                                                {id}
                                            </a>
                                        ))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </Unstyled>
    )
}
