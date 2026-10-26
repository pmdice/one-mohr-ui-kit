import * as React from "react"
import { Button } from "@/components/atoms/Button/Button"
import { formatNumber } from "./format"

interface BulkBarProps {
    count: number
    /** Selected rows not on the current page */
    hiddenCount: number
    actions: { label: string; onSelect: () => void }[]
    onClear: () => void
}

/** Actions for several rows at once (L-10). */
export function BulkBar({ count, hiddenCount, actions, onClear }: BulkBarProps) {
    return (
        <div role="region" aria-label="Auswahl" className="flex flex-wrap items-center gap-2 rounded-panel border border-accent/40 bg-accent-subtle px-3 py-1.5 text-sm text-fg">
            <span className="font-medium tabular-nums">
                {formatNumber(count)} ausgewählt{hiddenCount > 0 && <span className="font-normal text-fg-muted"> · {formatNumber(hiddenCount)} nicht sichtbar</span>}
            </span>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
            {actions.map((a) => <Button key={a.label} type="button" size="sm" variant="secondary" onClick={a.onSelect}>{a.label}</Button>)}
            <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={onClear}>Auswahl aufheben</Button>
        </div>
    )
}
