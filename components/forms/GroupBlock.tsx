"use client"

import * as React from "react"
import { ChevronRight, Copy, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { RequiredRegistryProvider, useOpenRequiredCount } from "./RequiredRegistry"
import { REVEAL_EVENT } from "./Form"

export type BlockCommand = { type: "collapse" | "expand"; seq: number }

interface GroupBlockProps {
    /** id of the header button — the jump target for error summaries */
    id: string
    no: number
    label: string
    summary: string
    hasError: boolean
    /** true for blocks the user just added; otherwise open only while incomplete */
    initiallyExpanded?: boolean
    command?: BlockCommand | null
    onRemove: () => void
    onDuplicate: () => void
    children: React.ReactNode
}

export function openFieldsText(count: number): string {
    return count === 1 ? "1 Pflichtfeld offen" : `${count} Pflichtfelder offen`
}

/**
 * One repeatable block (F-06): number, summary of its values, completeness, actions.
 * Its fields count in its own region, so the header knows what is still missing (F-08).
 */
export function GroupBlock(props: GroupBlockProps) {
    return (
        <RequiredRegistryProvider>
            <GroupBlockInner {...props} />
        </RequiredRegistryProvider>
    )
}

function GroupBlockInner({
    id, no, label, summary, hasError, initiallyExpanded, command, onRemove, onDuplicate, children,
}: GroupBlockProps) {
    const openCount = useOpenRequiredCount()
    const incomplete = openCount > 0 || hasError
    // null = automatic: open while incomplete. Frozen as soon as the user works in the block,
    // so it never snaps shut under their cursor when the last field gets filled.
    const [manual, setManual] = React.useState<boolean | null>(initiallyExpanded ? true : null)
    const expanded = manual ?? incomplete
    const contentId = `${id}-content`
    const rootRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (command) setManual(command.type === "expand")
    }, [command])

    // Failed save: open every block that needs attention (F-04)
    const incompleteRef = React.useRef(incomplete)
    React.useLayoutEffect(() => { incompleteRef.current = incomplete })
    React.useEffect(() => {
        const form = rootRef.current?.closest("form")
        if (!form) return
        const reveal = () => { if (incompleteRef.current) setManual(true) }
        form.addEventListener(REVEAL_EVENT, reveal)
        return () => form.removeEventListener(REVEAL_EVENT, reveal)
    }, [])

    const status = openCount > 0
        ? <span className="text-fg-muted">{openFieldsText(openCount)}</span>
        : hasError
            ? <span className="text-danger">Fehler</span>
            : <span className="text-success">vollständig</span>

    return (
        <div
            ref={rootRef}
            className={cn(
                "rounded-panel border bg-surface",
                hasError ? "border-danger/40" : "border-border"
            )}
            onFocusCapture={() => { if (manual === null) setManual(expanded) }}
        >
            <div className="flex items-center gap-1 pr-1">
                <button
                    type="button"
                    id={id}
                    data-no={no}
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    onClick={() => setManual(!expanded)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-panel px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                    <ChevronRight
                        className={cn("h-4 w-4 shrink-0 text-fg-muted transition-transform", expanded && "rotate-90")}
                        aria-hidden="true"
                    />
                    <span className="sr-only">{label} </span>
                    <span className="shrink-0 font-mono text-xs font-semibold text-fg">#{no}</span>
                    <span title={summary} className="min-w-0 flex-1 truncate text-sm text-fg-muted">
                        {summary || "Noch keine Angaben"}
                    </span>
                    <span className="shrink-0 text-xs">{status}</span>
                </button>
                <button
                    type="button"
                    aria-label={`${label} #${no} duplizieren`}
                    onClick={onDuplicate}
                    className="rounded-control p-1.5 text-fg-subtle hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    aria-label={`${label} #${no} entfernen`}
                    onClick={onRemove}
                    className="rounded-control p-1.5 text-fg-subtle hover:bg-danger-subtle hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            </div>
            {/* Collapsed content stays mounted so its fields keep counting and validating */}
            <div id={contentId} hidden={!expanded} className="border-t border-border px-3 pb-3 pt-3">
                {children}
            </div>
        </div>
    )
}
