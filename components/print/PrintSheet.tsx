import * as React from "react"
import { formatDateTime } from "@/components/status/time"

/**
 * One A4 page for paper (P-01, P-04): white, black, no buttons; head with company, document and number,
 * foot with page and print date. Breaks after itself when printed.
 */
export function PrintSheet({ company, title, number, page, pages, printedAt, children }: {
    company: string
    title: string
    number?: string
    page: number
    pages: number
    printedAt: number
    children: React.ReactNode
}) {
    return (
        <section
            aria-label={`${title}, Seite ${page} von ${pages}`}
            className="print-sheet flex h-[297mm] w-[210mm] flex-col bg-white p-[12mm] font-sans text-[3.5mm] text-black"
        >
            <header className="mb-[6mm] flex items-baseline justify-between border-b border-black pb-[2mm]">
                <span className="font-semibold">{company}</span>
                <span>{title}{number && <> · <span className="font-mono">{number}</span></>}</span>
            </header>
            <div className="min-h-0 flex-1">{children}</div>
            <footer className="mt-[4mm] flex justify-between border-t border-black pt-[2mm] text-[3mm]">
                <span>Gedruckt {formatDateTime(printedAt)}</span>
                <span>Seite {page} von {pages}</span>
            </footer>
        </section>
    )
}
