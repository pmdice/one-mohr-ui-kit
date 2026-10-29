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
