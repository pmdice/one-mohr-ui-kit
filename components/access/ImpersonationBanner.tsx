import * as React from "react"
import { UserRound } from "lucide-react"

/** Seeing the app as someone else cannot be missed (B-06): with whom, what is recorded, and the way back. */
export function ImpersonationBanner({ as, role, onLeave }: { as: string; role: string; onLeave: () => void }) {
    return (
        <div role="region" aria-label={`Ansicht als ${as}`} className="sticky top-0 z-40 flex flex-wrap items-center gap-x-3 gap-y-1 bg-warning-subtle px-4 py-2 text-sm text-fg">
            <UserRound className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <span>Sie sehen die App als {as} ({role}). Änderungen werden mit Ihrem Namen und dem von {as} festgehalten.</span>
            <button type="button" onClick={onLeave} className="ml-auto rounded-control border border-border-strong bg-surface px-2.5 py-1 text-xs font-medium text-fg hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                Zurück zu meinem Konto
            </button>
        </div>
    )
}
