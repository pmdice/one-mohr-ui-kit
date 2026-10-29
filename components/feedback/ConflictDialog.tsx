"use client"

import * as React from "react"
import { Button } from "@/components/atoms/Button/Button"
import { Dialog } from "@/components/molecules/Dialog/Dialog"
import { formatDateTime, formatRelative } from "@/components/status/time"

export interface ConflictChange { field: string; mine: React.ReactNode; theirs: React.ReactNode }

/**
 * Someone else changed the record since it was opened (R-08): who, when, field by field, and a choice.
 * Nothing is overwritten silently; the safe default is to go back to the form with the input intact.
 */
export function ConflictDialog({ open, changes, by, at, now, record = "diesen Auftrag", onKeepMine, onKeepTheirs, onCancel }: {
    open: boolean
    changes: ConflictChange[]
    by: string
    at: number
    now: number
    /** "diesen Auftrag", "diesen Kunden" … */
    record?: string
    onKeepMine: () => void
    onKeepTheirs: () => void
    onCancel: () => void
}) {
    const back = React.useRef<HTMLButtonElement>(null)
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            role="alertdialog"
            size="lg"
            initialFocus={back}
            hideClose
            title={`${by} hat ${record} inzwischen geändert`}
            description={<span title={formatDateTime(at)}>Geändert {formatRelative(at, now)}, nachdem Sie die Seite geöffnet haben. Wählen Sie für jede Abweichung, was gelten soll.</span>}
            footer={
                <>
                    <Button ref={back} variant="ghost" onClick={onCancel}>Zurück zum Formular</Button>
                    <Button variant="outline" onClick={onKeepTheirs}>Änderungen von {by} übernehmen</Button>
                    <Button onClick={onKeepMine}>Meine Änderungen speichern</Button>
                </>
            }
        >
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-xs text-fg-muted">
                            <th scope="col" className="py-2 pr-4 font-medium">Feld</th>
                            <th scope="col" className="py-2 pr-4 font-medium">Ihre Änderung</th>
                            <th scope="col" className="py-2 font-medium">Von {by}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {changes.map((c) => (
                            <tr key={c.field}>
                                <th scope="row" className="py-2 pr-4 text-left align-top font-normal text-fg-muted">{c.field}</th>
                                <td className="py-2 pr-4 align-top text-fg">{c.mine}</td>
                                <td className="py-2 align-top text-fg">{c.theirs}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Dialog>
    )
}
