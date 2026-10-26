"use client"

import * as React from "react"
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, ScanLine } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScanResult } from "./scan"

const LOOK: Record<ScanResult["kind"], { icon: typeof ScanLine; className: string; alert: boolean }> = {
    in: { icon: ArrowDownToLine, className: "border-success/40 bg-success-subtle text-success", alert: false },
    out: { icon: ArrowUpFromLine, className: "border-accent/40 bg-accent-subtle text-accent", alert: false },
    duplicate: { icon: ScanLine, className: "border-border bg-surface-sunken text-fg-muted", alert: false },
    unknown: { icon: AlertCircle, className: "border-danger/40 bg-danger-subtle text-danger", alert: true },
    locked: { icon: AlertCircle, className: "border-danger/40 bg-danger-subtle text-danger", alert: true },
}

/**
 * Field for a hand scanner, which types the code and presses Enter (S-07). The answer is one large
 * sentence with an icon, readable from a step away, and announced.
 */
export function ScanField({ stationLabel, resolve, onScan, className }: {
    stationLabel: string
    resolve: (code: string) => ScanResult
    onScan: (result: ScanResult, code: string) => void
    className?: string
}) {
    const [value, setValue] = React.useState("")
    const [answer, setAnswer] = React.useState<{ result: ScanResult; n: number; repeat: number } | null>(null)
    const result = answer?.result ?? null
    const id = React.useId()

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const code = value.trim()
        if (!code) return
        const r = resolve(code)
        // A repeated answer still changes: new node and a count, so it is seen and announced again
        setAnswer((prev) => ({ result: r, n: (prev?.n ?? 0) + 1, repeat: prev?.result.message === r.message ? prev.repeat + 1 : 1 }))
        setValue("")
        onScan(r, code)
    }

    const look = result ? LOOK[result.kind] : null
    const Icon = look?.icon
    return (
        <div className={cn("flex flex-col", className)}>
            <form onSubmit={submit} className="flex flex-col gap-1">
                <label htmlFor={id} className="text-sm font-medium text-fg">Code scannen an {stationLabel}</label>
                <div className="relative">
                    <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
                    <input
                        id={id}
                        autoComplete="off"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Code scannen oder eintippen, Enter"
                        className="h-control w-full rounded-control border border-border-strong bg-surface pl-9 pr-3 font-mono text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                </div>
            </form>
            {/* Live regions stay mounted, so the first message is announced too */}
            <div role="status">{answer && !look!.alert && <Message key={answer.n} text={text(answer)} Icon={Icon!} className={look!.className} />}</div>
            <div role="alert">{answer && look!.alert && <Message key={answer.n} text={text(answer)} Icon={Icon!} className={look!.className} />}</div>
        </div>
    )
}

const text = ({ result, repeat }: { result: ScanResult; repeat: number }) => (repeat > 1 ? `${result.message} (${repeat}×)` : result.message)

function Message({ text, Icon, className }: { text: string; Icon: typeof ScanLine; className: string }) {
    return (
        <p className={cn("m-0 mt-3 flex items-center gap-3 rounded-panel border px-4 py-3 text-lg font-semibold", className)}>
            <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
            {text}
        </p>
    )
}
