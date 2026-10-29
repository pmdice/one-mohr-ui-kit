"use client"

import * as React from "react"
import { Unstyled } from "@storybook/addon-docs/blocks"
import { cn } from "@/lib/utils"
import type { TokenGroup } from "./tokens"

type Reader = (el: Element, name: string) => string

const readComputed: Reader = (el, name) => getComputedStyle(el).getPropertyValue(name).trim()

/** One token group as a table: name, role, and the live value in each variant (light/dark, compact/comfortable). */
export function TokenTable({ group, read = readComputed }: { group: TokenGroup; read?: Reader }) {
    return (
        <Unstyled>
            <div className="my-6 overflow-x-auto rounded-panel border border-border bg-surface font-sans text-fg" data-density="compact">
                <table className="w-full border-collapse text-sm">
                    <caption className="sr-only">{group.title}</caption>
                    <thead>
                        <tr className="border-b border-border text-left text-xs text-fg-muted">
                            <th scope="col" className="px-4 py-2 font-medium">Token</th>
                            <th scope="col" className="px-4 py-2 font-medium">Rolle</th>
                            {group.variants.map((v) => <th key={v.label} scope="col" className="px-4 py-2 font-medium">{v.label}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {group.tokens.map((token) => (
                            <tr key={token.name}>
                                <th scope="row" className="whitespace-nowrap px-4 py-2.5 text-left align-top font-mono text-xs font-normal text-fg">{token.name}</th>
                                <td className="px-4 py-2.5 align-top text-fg-muted">{token.role}</td>
                                {group.variants.map((v) => (
                                    <td key={v.label} className="px-4 py-2.5 align-top">
                                        <Value kind={group.kind} name={token.name} className={v.className} density={v.density} read={read} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Unstyled>
    )
}

function Value({ kind, name, className, density, read }: { kind: TokenGroup["kind"]; name: string; className?: string; density?: string; read: Reader }) {
    const ref = React.useRef<HTMLDivElement>(null)
    const [value, setValue] = React.useState("")
    React.useEffect(() => {
        if (ref.current) setValue(read(ref.current, name))
    }, [read, name])

    const sample =
        kind === "color" ? <span className="h-6 w-10 shrink-0 rounded-control border border-border" style={{ background: `var(${name})` }} /> :
        kind === "radius" ? <span className="h-6 w-10 shrink-0 border-2 border-fg-muted" style={{ borderRadius: `var(${name})` }} /> :
        kind === "shadow" ? <span className="h-6 w-10 shrink-0 rounded-control bg-surface-raised" style={{ boxShadow: `var(${name})` }} /> :
        null

    return (
        // The wrapper carries the variant, so the custom property resolves the way it does in the app
        <div ref={ref} className={cn("flex items-center gap-3 rounded-control", className, kind === "shadow" && "bg-surface p-2")} data-density={density}>
            {sample}
            <span className="font-mono text-xs text-fg-muted">{value || "—"}</span>
        </div>
    )
}

const TYPE_STEPS = [
    { px: 12, className: "text-xs", tw: "text-xs", role: "Metadaten, Kennungen in Übersichten, Hinweise unter Feldern", sample: "Auftrag 26100013 · vor 5 min" },
    { px: 13, className: "text-control", tw: "text-control", role: "Bedienelemente in kompakter Dichte", sample: "Speichern" },
    { px: 14, className: "text-sm", tw: "text-sm", role: "Fliesstext, Tabellen, Werte", sample: "Dähler + Blaser, 4 Positionen, 48 Stück" },
    { px: 16, className: "text-base font-semibold", tw: "text-base", role: "Abschnittstitel", sample: "Positionen" },
    { px: 20, className: "text-xl font-semibold", tw: "text-xl", role: "Seitentitel", sample: "Ringe Herbst 2026" },
]

/** The five type steps of G-04, each set in its own size. */
export function TypeScale() {
    return (
        <Unstyled>
            <div className="my-6 divide-y divide-border rounded-panel border border-border bg-surface font-sans text-fg" data-density="compact">
                {TYPE_STEPS.map((s) => (
                    <div key={s.px} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6">
                        <span className="w-28 shrink-0 font-mono text-xs text-fg-subtle">{s.px} px · {s.tw}</span>
                        <span className={cn("min-w-0 flex-1", s.className)}>{s.sample}</span>
                        <span className="text-xs text-fg-muted sm:w-64 sm:text-right">{s.role}</span>
                    </div>
                ))}
            </div>
        </Unstyled>
    )
}

/** The spacing steps of G-05 as bars. */
export function SpaceScale() {
    return (
        <Unstyled>
            <div className="my-6 flex flex-col gap-2 rounded-panel border border-border bg-surface p-4 font-sans" data-density="compact">
                {[[4, "gap-1"], [8, "gap-2"], [12, "gap-3"], [16, "gap-4"], [24, "gap-6"], [32, "gap-8"]].map(([px, tw]) => (
                    <div key={px} className="flex items-center gap-4">
                        <span className="w-24 shrink-0 font-mono text-xs text-fg-subtle">{px} px · {tw}</span>
                        <span className="bg-accent-subtle ring-1 ring-inset ring-accent" style={{ width: Number(px), height: Number(px) }} />
                    </div>
                ))}
            </div>
        </Unstyled>
    )
}
