import * as React from "react"
import { Check, Minus } from "lucide-react"

export interface RightsRow { area: string; read: boolean; change: boolean; delete: boolean }

const Cell = ({ label, yes }: { label: string; yes: boolean }) => (
    <td className="px-3 py-2">
        <span className={yes ? "flex items-center gap-1 text-fg" : "flex items-center gap-1 text-fg-subtle"}>
            {yes ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Minus className="h-3.5 w-3.5" aria-hidden="true" />}
            <span className="sr-only">{label}: </span>{yes ? "ja" : "nein"}
        </span>
    </td>
)

/** "Was darf ich?" (B-05): what a role may do per area, in words. */
export function RightsSummary({ role, rows }: { role: string; rows: RightsRow[] }) {
    return (
        <div className="overflow-x-auto rounded-panel border border-border">
            <table aria-label={`Was ${role} darf`} className="w-full border-collapse bg-surface text-sm">
                <thead>
                    <tr className="border-b border-border text-left text-xs text-fg-muted">
                        <th scope="col" className="px-3 py-2 font-medium">Bereich</th>
                        <th scope="col" className="px-3 py-2 font-medium">Lesen</th>
                        <th scope="col" className="px-3 py-2 font-medium">Ändern</th>
                        <th scope="col" className="px-3 py-2 font-medium">Löschen</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {rows.map((r) => (
                        <tr key={r.area}>
                            <th scope="row" className="px-3 py-2 text-left font-normal text-fg">{r.area}</th>
                            <Cell label="Lesen" yes={r.read} />
                            <Cell label="Ändern" yes={r.change} />
                            <Cell label="Löschen" yes={r.delete} />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
