"use client"

import * as React from "react"
import { Lock } from "lucide-react"
import type { Decision } from "./decide"

/**
 * Applies a decision to one action (B-01, B-02): nothing when hidden; when disabled the reason stands next
 * to it as text, tied to the control (which stays reachable, so the reason is read out), and where it can be
 * requested a way to ask (B-07).
 */
export function Guarded({ decision, children, onRequest, what }: {
    decision: Decision
    /** Render the control with these props; use `aria-disabled` and ignore clicks when `disabled` is true. */
    children: (props: { disabled?: boolean; "aria-describedby"?: string }) => React.ReactNode
    onRequest?: () => void
    /** The action in words, so several "Zugriff anfragen" on a page are told apart. */
    what?: string
}) {
    const id = React.useId()
    if (decision.kind === "hidden") return null
    if (decision.kind === "allowed") return <>{children({})}</>
    return (
        <span className="inline-flex flex-col items-start gap-1">
            {children({ disabled: true, "aria-describedby": `${id}-reason` })}
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-fg-muted">
                <span id={`${id}-reason`} className="flex items-center gap-1"><Lock className="h-3 w-3" aria-hidden="true" />{decision.reason}</span>
                {decision.requestable && onRequest && (
                    <button type="button" onClick={onRequest} aria-label={what ? `Zugriff anfragen: ${what}` : undefined} className="rounded-control font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        Zugriff anfragen
                    </button>
                )}
            </span>
        </span>
    )
}
