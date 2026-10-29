"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

const SHOWN_MS = 2000

/** Copies an identifier with one click and says so at the same place (D-05). */
export function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
    const [state, setState] = React.useState<"idle" | "copied" | "manual">("idle")
    React.useEffect(() => {
        if (state !== "copied") return
        const timer = setTimeout(() => setState("idle"), SHOWN_MS)
        return () => clearTimeout(timer)
    }, [state])

    const copy = async () => {
        try {
            if (!navigator.clipboard?.writeText) throw new Error("no clipboard")
            await navigator.clipboard.writeText(value)
            setState("copied")
        } catch {
            setState("manual")
        }
    }

    return (
        <span className={cn("inline-flex items-center gap-1", className)}>
            <button
                type="button"
                onClick={copy}
                aria-label={`${label} kopieren`}
                title={`${label} kopieren`}
                className="flex h-6 w-6 items-center justify-center rounded-control text-fg-subtle hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
                {state === "copied" ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
            <span role="status" className="text-xs text-fg-muted">
                {state === "copied" ? "Kopiert" : state === "manual" ? "Mit Ctrl+C kopieren" : ""}
            </span>
        </span>
    )
}
