import * as React from "react"
import { CloudOff, RefreshCw } from "lucide-react"

const changes = (n: number) => (n === 1 ? "1 Änderung" : `${n} Änderungen`)

/** Without a connection one works on as far as possible, and a band says what that means (R-10). */
export function ConnectionBanner({ online, waiting = 0 }: { online: boolean; waiting?: number }) {
    if (online && waiting === 0) return null
    return (
        <div role="status" className="flex items-center gap-2 rounded-panel border border-warning bg-warning-subtle px-4 py-2 text-sm text-fg">
            {online
                ? <><RefreshCw className="h-4 w-4 shrink-0 animate-spin text-fg-muted motion-reduce:animate-none" aria-hidden="true" />Verbindung wieder da. {changes(waiting)} {waiting === 1 ? "wird" : "werden"} gesendet …</>
                : <><CloudOff className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />Keine Verbindung. {waiting > 0 ? `${changes(waiting)} werden gespeichert, sobald die Verbindung zurück ist.` : "Änderungen werden gespeichert, sobald die Verbindung zurück ist."}</>}
        </div>
    )
}
