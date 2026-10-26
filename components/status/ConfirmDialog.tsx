"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/atoms/Button/Button"
import { cn } from "@/lib/utils"

const FOCUSABLE = 'button:not([disabled]), textarea, input, select, a[href], [tabindex]:not([tabindex="-1"])'

/**
 * Asks before a final or far-reaching step (S-06): names the consequences, the button says what happens.
 * Focus starts on "Abbrechen", stays inside, and returns to where it came from.
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
    const panelRef = React.useRef<HTMLDivElement>(null)
    const cancelRef = React.useRef<HTMLButtonElement>(null)
    const returnTo = React.useRef<HTMLElement | null>(null)
    const [text, setText] = React.useState("")
    const [error, setError] = React.useState(false)
    const id = React.useId()

    React.useEffect(() => {
        if (!open) return
        returnTo.current = document.activeElement as HTMLElement | null
        setText("")
        setError(false)
        cancelRef.current?.focus()
        return () => returnTo.current?.focus()
    }, [open])

    if (!open || typeof document === "undefined") return null

    const confirm = () => {
        const value = text.trim()
        if (reason === "required" && !value) {
            setError(true)
            panelRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus()
            return
        }
        onConfirm(reason ? value || undefined : undefined)
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onCancel(); return }
        if (e.key !== "Tab") return
        const els = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
        if (els.length === 0) return
        const first = els[0], last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}>
            <div
                ref={panelRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={`${id}-title`}
                aria-describedby={`${id}-body`}
                onKeyDown={onKeyDown}
                className="w-full max-w-md rounded-panel bg-surface-raised p-5 shadow-xl ring-1 ring-border"
            >
                <h2 id={`${id}-title`} className="m-0 text-base font-semibold text-fg">{title}</h2>
                <ul id={`${id}-body`} className="mt-2 mb-0 flex list-disc flex-col gap-1 pl-5 text-sm text-fg-muted">
                    {consequences.map((c) => <li key={c}>{c}</li>)}
                </ul>
                {reason && (
                    <div className="mt-4 flex flex-col gap-1">
                        <label htmlFor={`${id}-reason`} className="text-sm font-medium text-fg">
                            {reasonLabel}{reason === "optional" && <span className="font-normal text-fg-muted"> (optional)</span>}
                        </label>
                        <textarea
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
                <div className="mt-5 flex justify-end gap-2">
                    <Button ref={cancelRef} variant="outline" size="sm" onClick={onCancel}>Abbrechen</Button>
                    <Button variant={tone === "danger" ? "destructive" : "default"} size="sm" onClick={confirm}>{confirmLabel}</Button>
                </div>
            </div>
        </div>,
        document.body
    )
}
