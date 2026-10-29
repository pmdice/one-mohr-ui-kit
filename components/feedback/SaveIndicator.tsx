"use client"

import * as React from "react"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { formatDateTime, formatRelative } from "@/components/status/time"
import { CopyButton } from "@/components/record/CopyButton"
import type { Explained } from "./explainError"
import type { SaveState } from "./useSave"

/** The first sentence of an explanation: "Keine Verbindung." */
const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0]

/** Where the saving stands, in words (R-01). */
export function SaveIndicator({ state, savedAt, error, now, onRetry }: {
    state: SaveState
    savedAt?: number
    error?: Explained
    now: number
    onRetry: () => void
}) {
    return (
        <span role="status" className="flex min-h-6 items-center gap-1.5 text-xs text-fg-muted">
            {state === "dirty" && <><span className="h-1.5 w-1.5 rounded-[2px] bg-warning" aria-hidden="true" />Nicht gespeicherte Änderungen</>}
            {state === "saving" && <><Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />Speichert …</>}
            {state === "saved" && savedAt !== undefined && <span className="flex items-center gap-1.5" title={formatDateTime(savedAt)}><Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />Gespeichert · {formatRelative(savedAt, now)}</span>}
            {state === "failed" && (
                <>
                    <AlertCircle className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
                    <span className="text-danger">{error ? `Nicht gespeichert – ${firstSentence(error.message)}` : "Nicht gespeichert."}</span>
                    {error?.code && <span className="flex items-center gap-0.5">Code <span className="font-mono">{error.code}</span><CopyButton value={error.code} label="Fehlercode" /></span>}
                    {error?.action === "retry" && (
                        <button type="button" onClick={onRetry} className="rounded-control font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">Erneut versuchen</button>
                    )}
                </>
            )}
        </span>
    )
}
