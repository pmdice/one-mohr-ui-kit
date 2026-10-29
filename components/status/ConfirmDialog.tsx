"use client"

import * as React from "react"
import { Button } from "@/components/atoms/Button/Button"
import { Dialog } from "@/components/molecules/Dialog/Dialog"
import { cn } from "@/lib/utils"

/**
 * Asks before a final or far-reaching step (S-06): names the consequences, the button says what happens.
 * Built on `Dialog` as an `alertdialog`; focus starts on "Abbrechen".
 */
export function ConfirmDialog({ open, title, consequences, confirmLabel, reason, reasonLabel = "Grund", onConfirm, onCancel, tone = "danger" }: {
    open: boolean
    title: string
    consequences: string[]
    confirmLabel: string
    reason?: "required" | "optional"
    reasonLabel?: string
    onConfirm: (reason?: string) => void
    onCancel: () => void
    tone?: "danger" | "default"
}) {
    const cancelRef = React.useRef<HTMLButtonElement>(null)
    const reasonRef = React.useRef<HTMLTextAreaElement>(null)
    const [text, setText] = React.useState("")
    const [error, setError] = React.useState(false)
    const id = React.useId()

    React.useEffect(() => {
        if (!open) return
        setText("")
        setError(false)
    }, [open])

    const confirm = () => {
        const value = text.trim()
        if (reason === "required" && !value) {
            setError(true)
            reasonRef.current?.focus()
            return
        }
        onConfirm(reason ? value || undefined : undefined)
    }

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            title={title}
            role="alertdialog"
            initialFocus={cancelRef}
            hideClose
            description={
                <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
                    {consequences.map((c) => <li key={c}>{c}</li>)}
                </ul>
            }
            footer={
                <>
                    <Button ref={cancelRef} variant="outline" onClick={onCancel}>Abbrechen</Button>
                    <Button variant={tone === "danger" ? "destructive" : "default"} onClick={confirm}>{confirmLabel}</Button>
                </>
            }
        >
            {reason && (
                <div className="flex flex-col gap-1">
                    <label htmlFor={`${id}-reason`} className="text-sm font-medium text-fg">
                        {reasonLabel}{reason === "optional" && <span className="font-normal text-fg-muted"> (optional)</span>}
                    </label>
                    <textarea
                        ref={reasonRef}
                        id={`${id}-reason`}
                        rows={2}
                        value={text}
                        aria-invalid={error || undefined}
                        aria-describedby={error ? `${id}-error` : undefined}
                        onChange={(e) => { setText(e.target.value); if (error && e.target.value.trim()) setError(false) }}
                        className={cn("rounded-control border bg-surface px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus", error ? "border-danger" : "border-border-strong")}
                    />
                    {error && <p id={`${id}-error`} className="m-0 text-xs text-danger">Bitte einen Grund angeben</p>}
                </div>
            )}
        </Dialog>
    )
}
