import * as React from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { cn } from "@/lib/utils"
import { formatDateTime } from "./time"
import type { StatusDef } from "./workflow"

/** A closed record says why it is locked and how to get back (S-08). */
export function LockedNotice({ status, at, by, reason, canReopen, reopenHint, onReopen, className }: {
    status: StatusDef
    at: number
    by: string
    reason?: string
    canReopen: boolean
    /** Who may reopen, shown to those who may not. */
    reopenHint?: string
    onReopen: () => void
    className?: string
}) {
    return (
        <div role="note" className={cn("flex flex-wrap items-center gap-3 rounded-panel border border-border bg-surface-sunken px-4 py-3 text-sm text-fg", className)}>
            <Lock className="h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
            <p className="m-0 min-w-0 flex-1">
                {status.label} am {formatDateTime(at).slice(0, 10)} von {by}{reason ? `: ${reason}` : ""}. Felder sind gesperrt.
            </p>
            {canReopen
                ? <Button size="sm" variant="outline" onClick={onReopen}>Wieder öffnen</Button>
                : reopenHint && <p className="m-0 text-xs text-fg-muted">{reopenHint}</p>}
        </div>
    )
}
