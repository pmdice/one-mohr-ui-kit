"use client"

import * as React from "react"
import { Button } from "@/components/atoms/Button/Button"
import { Textarea } from "@/components/atoms/Textarea/Textarea"
import { Dialog } from "@/components/molecules/Dialog/Dialog"

/** Ask for access instead of a dead end (B-07): what, to whom, and why; the link to this place goes along. */
export function AccessRequestDialog({ open, what, to, onSend, onClose }: {
    open: boolean
    /** "Aufträge ändern" */
    what: string
    /** Who decides: "Teamleitung Produktion". */
    to: string
    onSend: (reason: string) => Promise<void> | void
    onClose: () => void
}) {
    const [reason, setReason] = React.useState("")
    const [missing, setMissing] = React.useState(false)
    const [busy, setBusy] = React.useState(false)
    const [failed, setFailed] = React.useState(false)
    const field = React.useRef<HTMLTextAreaElement>(null)
    const id = React.useId()

    const send = async () => {
        if (!reason.trim()) { setMissing(true); field.current?.focus(); return }
        setBusy(true)
        setFailed(false)
        // A failed request says so here and keeps what was typed (R-07)
        try { await onSend(reason.trim()) } catch { setFailed(true) } finally { setBusy(false) }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={`Zugriff anfragen: ${what}`}
            description={`Die Anfrage geht an ${to}, mit einem Link auf diese Seite.`}
            footer={<><Button variant="outline" onClick={onClose}>Abbrechen</Button><Button onClick={send} busy={busy}>Anfrage senden</Button></>}
        >
            <div className="flex flex-col gap-1">
                <label htmlFor={`${id}-reason`} className="text-sm font-medium text-fg">Wofür brauchen Sie den Zugriff?</label>
                <Textarea
                    ref={field}
                    id={`${id}-reason`}
                    rows={3}
                    value={reason}
                    maxLength={300}
                    aria-invalid={missing || undefined}
                    aria-describedby={missing ? `${id}-error` : undefined}
                    onChange={(e) => { setReason(e.target.value); if (e.target.value.trim()) setMissing(false) }}
                />
                {missing && <p id={`${id}-error`} className="m-0 text-xs text-danger">Bitte kurz sagen, wofür Sie den Zugriff brauchen.</p>}
                {failed && <p role="alert" className="m-0 text-xs text-danger">Anfrage nicht gesendet. Erneut versuchen.</p>}
            </div>
        </Dialog>
    )
}
