"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"

export type ErrorSummaryItem = { id: string; label: string; href: string }

interface FormErrorSummaryProps {
    title: string
    items: ErrorSummaryItem[]
}

/** F-04: what needs attention after a failed save, with jump links to each place. */
export function FormErrorSummary({ title, items }: FormErrorSummaryProps) {
    const titleId = React.useId()

    const jump = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        const target = document.getElementById(href.slice(1))
        if (!target) return
        event.preventDefault()
        target.scrollIntoView?.({ block: "center" })
        target.focus({ preventScroll: true })
    }

    return (
        <div
            role="alert"
            aria-labelledby={titleId}
            className="rounded-panel border border-danger/30 bg-danger-subtle px-4 py-3"
        >
            <p id={titleId} className="flex items-center gap-2 text-sm font-medium text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {title}
            </p>
            <ul className="mt-1.5 flex flex-col gap-0.5 pl-6">
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={item.href}
                            onClick={(e) => jump(e, item.href)}
                            className="text-sm text-fg underline decoration-danger/40 underline-offset-2 hover:decoration-danger"
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}
