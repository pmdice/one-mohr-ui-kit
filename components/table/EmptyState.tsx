import * as React from "react"
import { AlertTriangle, Inbox, SearchX } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
    /** none: nothing exists yet · no-results: filters hide everything · error: loading failed (L-07) */
    kind: "none" | "no-results" | "error"
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

const ICON = { none: Inbox, "no-results": SearchX, error: AlertTriangle }

export function EmptyState({ kind, title, description, action, className }: EmptyStateProps) {
    const Icon = ICON[kind]
    return (
        <div
            role={kind === "error" ? "alert" : "status"}
            className={cn("flex flex-col items-center gap-2 px-6 py-12 text-center", className)}
        >
            <Icon className={cn("h-6 w-6", kind === "error" ? "text-danger" : "text-fg-subtle")} aria-hidden="true" />
            <p className="m-0 text-sm font-medium text-fg">{title}</p>
            {description && <p className="m-0 max-w-sm text-sm text-fg-muted">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}
