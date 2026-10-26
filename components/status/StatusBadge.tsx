import * as React from "react"
import { AlertTriangle, Circle, CircleCheck, CircleDot, CirclePause, CircleX } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, formatDuration } from "./time"
import { useNow } from "./useNow"
import type { StatusCategory, StatusDef } from "./workflow"

/** One shape per category, so the status reads on a black-and-white print too (S-01). */
const LOOK: Record<StatusCategory, { icon: typeof Circle; className: string }> = {
    planned: { icon: Circle, className: "border border-border-strong text-fg" },
    active: { icon: CircleDot, className: "bg-accent-subtle text-accent" },
    waiting: { icon: CirclePause, className: "bg-warning-subtle text-warning" },
    done: { icon: CircleCheck, className: "bg-success-subtle text-success" },
    canceled: { icon: CircleX, className: "bg-surface-sunken text-fg-muted" },
}

export function StatusBadge({ status, since, now: givenNow, overdue, className }: {
    status: StatusDef
    /** Since when this status holds (ms) (S-03). */
    since?: number
    now?: number
    /** Warning in words when the usual time is exceeded. */
    overdue?: string
    className?: string
}) {
    const now = useNow(givenNow)
    const { icon: Icon, className: look } = LOOK[status.category]
    return (
        <span className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
            <span data-category={status.category} className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-control px-2 py-0.5 text-xs font-medium", look)}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {status.label}
            </span>
            {since !== undefined && (
                <span className="whitespace-nowrap text-xs text-fg-muted" title={formatDateTime(since)}>
                    seit {formatDuration(now - since)}
                </span>
            )}
            {overdue && (
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    {overdue}
                </span>
            )}
        </span>
    )
}
