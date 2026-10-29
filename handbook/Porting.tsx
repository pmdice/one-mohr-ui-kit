"use client"

import * as React from "react"
import { Unstyled } from "@storybook/addon-docs/blocks"
import { Checkbox } from "@/components/inputs/Checkbox"
import { Input } from "@/components/atoms/Input/Input"
import { PARTS } from "./allRules"
import { PORTING } from "./porting.generated"
import { docsHref } from "./RuleIndex"

/** `code` in a note becomes <code>. */
function Note({ text }: { text: string }) {
    return <>{text.split(/(`[^`]+`)/g).map((part, i) => (part.startsWith("`") ? <code key={i} className="rounded-[3px] bg-surface-sunken px-1 font-mono text-xs">{part.slice(1, -1)}</code> : part))}</>
}

/** All "Übertragen" notes on one page, by part: the checklist for porting the handbook to Nova or another stack. */
export function Porting() {
    const [query, setQuery] = React.useState("")
    const [novaOnly, setNovaOnly] = React.useState(false)
    const docs = new Map(PARTS.flatMap((p) => p.groups.flatMap((g) => g.rules)).map((r) => [r.id, r.docsId]))
    const term = query.trim().toLowerCase()
    const matches = (p: (typeof PORTING)[number]) => {
        const notes = novaOnly ? p.notes.filter((n) => /\bNova\b/.test(n)) : p.notes
        const hit = !term || p.id.toLowerCase().includes(term) || p.title.toLowerCase().includes(term) || notes.some((n) => n.toLowerCase().includes(term))
        return hit && notes.length ? { ...p, notes } : null
    }
    return (
        <Unstyled>
            <div className="my-6 flex flex-col gap-6 font-sans text-fg" data-density="compact">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="w-72"><Input type="search" aria-label="Hinweise durchsuchen" placeholder="Suchen, z. B. Policy oder F-12" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
                    <Checkbox checked={novaOnly} onChange={setNovaOnly} label="Nur Nova-Hinweise" />
                </div>
                {PARTS.map((part) => {
                    const rules = PORTING.filter((p) => p.id.startsWith(`${part.prefix}-`)).map(matches).filter((p): p is NonNullable<typeof p> => p !== null)
                    if (!rules.length) return null
                    return (
                        <section key={part.prefix} aria-label={part.title} className="flex flex-col gap-2">
                            <h2 className="m-0 text-sm font-semibold">{part.title}</h2>
                            <ul className="m-0 list-none divide-y divide-border rounded-panel border border-border bg-surface p-0">
                                {rules.map((p) => (
                                    <li key={p.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
                                        <a href={docsHref(docs.get(p.id) ?? "")} target="_top" className="w-56 shrink-0 text-sm no-underline">
                                            <span className="mr-2 font-mono text-xs text-fg-subtle">{p.id}</span>
                                            <span className="font-medium text-fg">{p.title}</span>
                                        </a>
                                        <ul className="m-0 flex list-disc flex-col gap-1 pl-4 text-sm text-fg-muted">
                                            {p.notes.map((n) => <li key={n}><Note text={n} /></li>)}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )
                })}
            </div>
        </Unstyled>
    )
}
