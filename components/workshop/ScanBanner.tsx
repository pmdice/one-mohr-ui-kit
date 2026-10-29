"use client"

import * as React from "react"
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, RotateCcw, ScanLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { playTone, type ToneKind } from "./tones"

export type BannerResult = {
    /** New id = new scan; the same answer twice still sounds twice. */
    id: number
    /** "repeat": the same code read again within moments; nothing happened, no tone. */
    kind: ToneKind | "repeat"
    message: string
    /** The code the answer is about, if any. */
    code?: string
    /** What to do now (W-06). */
    next?: string
}

/** The stamp on the left carries the meaning in a full block of colour; the frame repeats it. */
const LOOK: Record<BannerResult["kind"], { word: string; icon: typeof ScanLine; stamp: string; frame: string }> = {
    in: { word: "EIN", icon: ArrowDownToLine, stamp: "bg-success text-surface", frame: "border-success bg-success-subtle" },
    out: { word: "AUS", icon: ArrowUpFromLine, stamp: "bg-accent text-surface", frame: "border-accent bg-accent-subtle" },
    error: { word: "FEHLER", icon: AlertCircle, stamp: "bg-danger text-surface", frame: "border-danger bg-danger-subtle" },
    repeat: { word: "SCHON ERFASST", icon: ScanLine, stamp: "bg-surface-sunken text-fg-muted", frame: "border-border-strong bg-surface" },
}

/** The answer to a scan across the whole width: a stamp with the big word, the sentence, the next step, a tone (W-04, W-06). */
export function ScanBanner({ result, sound = true, play = playTone, onUndo, undoMs = 10_000, className }: {
    result: BannerResult | null
    sound?: boolean
    play?: (kind: ToneKind) => void
    onUndo?: () => void
    /** How long the way back stays; shown as a draining bar on the button. */
    undoMs?: number
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
            <div className={cn("flex min-h-28 items-center gap-5 rounded-panel border-2 border-dashed border-border-strong px-6 text-fg-muted", className)}>
                <ScanLine className="h-10 w-10 shrink-0" aria-hidden="true" />
                <span className="flex flex-col">
                    <span className="text-2xl font-semibold text-fg">Bereit</span>
                    <span className="text-lg">Zettel vor die Kamera halten oder Nummer eintippen</span>
                </span>
            </div>
        )
    }
    const { word, icon: Icon, stamp, frame } = LOOK[result.kind]
    return (
        <div
            key={result.id}
            role={result.kind === "error" ? "alert" : "status"}
            className={cn("flex min-h-28 overflow-hidden rounded-panel border-2", frame, className)}
        >
            <span className={cn("flex shrink-0 flex-col items-center justify-center gap-1 px-6 py-3 sm:min-w-44", stamp)}>
                <Icon className="h-8 w-8" aria-hidden="true" />
                <span className={cn("font-bold leading-none tracking-tight", word.length > 6 ? "text-2xl" : "text-5xl")}>{word}</span>
            </span>
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-2xl font-semibold leading-tight text-fg">{result.message}</span>
                    {result.next && <span className="text-lg text-fg">{result.next}</span>}
                </span>
                {onUndo && <UndoButton key={result.id} onUndo={onUndo} ms={undoMs} />}
            </span>
        </div>
    )
}

/** The way back, with the time it stays as a bar that drains (static when motion is reduced). */
function UndoButton({ onUndo, ms }: { onUndo: () => void; ms: number }) {
    return (
        <button
            type="button"
            onClick={onUndo}
            className="relative flex min-h-14 items-center gap-2 overflow-hidden rounded-control border-2 border-fg bg-surface px-5 text-lg font-semibold text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:bg-surface-sunken"
        >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Scan zurücknehmen
            <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1 origin-left bg-fg motion-reduce:hidden"
                style={{ animation: `undo-drain ${ms}ms linear forwards` }}
            />
        </button>
    )
}
