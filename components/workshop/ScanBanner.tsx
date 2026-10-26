"use client"

import * as React from "react"
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, ScanLine } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { cn } from "@/lib/utils"
import { playTone, type ToneKind } from "./tones"

export type BannerResult = {
    /** New id = new scan; the same answer twice still sounds twice. */
    id: number
    /** "repeat": the same code read again within moments; nothing happened, no tone. */
    kind: ToneKind | "repeat"
    message: string
    /** What to do now (W-06). */
    next?: string
}

const LOOK: Record<BannerResult["kind"], { word: string; icon: typeof ScanLine; className: string }> = {
    in: { word: "EIN", icon: ArrowDownToLine, className: "border-success bg-success-subtle text-success" },
    out: { word: "AUS", icon: ArrowUpFromLine, className: "border-accent bg-accent-subtle text-accent" },
    error: { word: "FEHLER", icon: AlertCircle, className: "border-danger bg-danger-subtle text-danger" },
    repeat: { word: "SCHON ERFASST", icon: ScanLine, className: "border-border-strong bg-surface-sunken text-fg-muted" },
}

/** The answer to a scan across the whole width, big word, sentence, next step, tone (W-04, W-06). */
export function ScanBanner({ result, sound = true, play = playTone, onUndo, className }: {
    result: BannerResult | null
    sound?: boolean
    play?: (kind: ToneKind) => void
    onUndo?: () => void
    className?: string
}) {
    const played = React.useRef<number | null>(null)
    React.useEffect(() => {
        if (!result || played.current === result.id) return
        played.current = result.id
        if (sound && result.kind !== "repeat") play(result.kind)
    }, [result, sound, play])

    if (!result) {
        return (
            <div className={cn("flex min-h-24 items-center gap-4 rounded-panel border-2 border-dashed border-border px-5 text-xl text-fg-muted", className)}>
                <ScanLine className="h-8 w-8 shrink-0" aria-hidden="true" />Zettel vor die Kamera halten
            </div>
        )
    }
    const { word, icon: Icon, className: look } = LOOK[result.kind]
    return (
        <div key={result.id} role={result.kind === "error" ? "alert" : "status"} className={cn("flex flex-wrap items-center gap-x-5 gap-y-3 rounded-panel border-2 px-5 py-4", look, className)}>
            <Icon className="h-10 w-10 shrink-0" aria-hidden="true" />
            <span className="text-3xl font-bold tracking-wide">{word}</span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xl font-semibold text-fg">{result.message}</span>
                {result.next && <span className="text-lg text-fg">{result.next}</span>}
            </span>
            {onUndo && <Button variant="outline" onClick={onUndo} className="min-h-12 px-4 text-base">Scan zurücknehmen</Button>}
        </div>
    )
}
