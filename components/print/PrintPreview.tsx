"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Printer } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"

const subscribeNothing = () => () => {}

/**
 * Shows what comes out of the printer before it does (P-01): pages at a glance, how many, and the hint to
 * print at actual size so barcodes keep their width (P-03).
 */
export function PrintPreview({ title, pages, onPrint = () => window.print() }: {
    title: string
    /** One PrintSheet per page. */
    pages: React.ReactNode[]
    onPrint?: () => void
}) {
    const count = pages.length === 1 ? "1 Seite" : `${pages.length} Seiten`
    // The printer gets its own copy at real size, directly under body (after hydration, so server and client match)
    const mounted = React.useSyncExternalStore(subscribeNothing, () => true, () => false)
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border bg-surface px-4 py-2 text-sm text-fg">
                <span className="flex flex-col">
                    <span className="font-medium">{title}</span>
                    <span className="text-xs text-fg-muted">{count} · A4 hoch</span>
                </span>
                <span className="flex items-center gap-3">
                    <span className="text-xs text-fg-muted">Im Druckdialog „Tatsächliche Grösse“ wählen – in tatsächlicher Grösse bleiben Barcodes lesbar.</span>
                    <Button size="sm" onClick={onPrint}><Printer className="h-3.5 w-3.5" aria-hidden="true" />Drucken</Button>
                </span>
            </div>
            <div className="flex flex-wrap gap-4">
                {pages.map((page, i) => (
                    // Half size on screen only
                    <div key={i} className="h-[148.5mm] w-[105mm] overflow-hidden shadow-overlay">
                        <div className="origin-top-left scale-50">{page}</div>
                    </div>
                ))}
            </div>
            {mounted && createPortal(<div className="print-root" aria-hidden="true">{pages}</div>, document.body)}
        </div>
    )
}
