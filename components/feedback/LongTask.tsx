"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

const SHOW_FROM = 1000
const LONG_FROM = 10_000

/**
 * A task that takes time (R-06): nothing under one second, the label from one second, from ten seconds
 * progress or the offer to let it run in the background.
 */
export function LongTask({ running, label, progress, startedAt, now, onBackground }: {
    running: boolean
    label: string
    /** 0 to 1 when known. */
    progress?: number
    startedAt: number
    now: number
    onBackground?: () => void
}) {
    const elapsed = now - startedAt
    if (!running || elapsed < SHOW_FROM) return null
    const long = elapsed >= LONG_FROM
    return (
        <div role="status" className="flex flex-col gap-2 rounded-panel border border-border bg-surface px-4 py-3 text-sm text-fg">
            <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-fg-muted motion-reduce:animate-none" aria-hidden="true" />
                {label}
            </span>
            {long && progress !== undefined && (
                <span
                    role="progressbar"
                    aria-label={label}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress * 100)}
                    className="h-1 overflow-hidden rounded-control bg-surface-sunken"
                >
                    <span className="block h-full bg-accent transition-[width] duration-base" style={{ width: `${progress * 100}%` }} />
                </span>
            )}
            {long && progress === undefined && (
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                    Dauert länger als üblich.
                    {onBackground && (
                        <button type="button" onClick={onBackground} className="rounded-control font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                            Im Hintergrund weiterlaufen lassen
                        </button>
                    )}
                </span>
            )}
        </div>
    )
}
