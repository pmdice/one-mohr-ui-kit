import * as React from "react"
import { Eye } from "lucide-react"

/** A calm note on top of a page that can only be read (B-03): that, why, and who may change (B-07). */
export function ReadOnlyNotice({ area, who, onRequest }: { area: string; who: string[]; onRequest?: () => void }) {
    return (
        <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-panel border border-border bg-surface-sunken px-4 py-2 text-sm text-fg">
            <Eye className="h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
            <span>Sie können {area} nur lesen. Ändern dürfen: {who.join(", ")}.</span>
            {onRequest && (
                <button type="button" onClick={onRequest} className="rounded-control font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    Zugriff anfragen
                </button>
            )}
        </div>
    )
}
