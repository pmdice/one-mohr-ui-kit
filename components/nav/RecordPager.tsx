"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { NavLink } from "./NavLink"
import { useShortcut } from "./shortcuts"

interface RecordPagerProps {
    /** The set the record was opened from, in its order */
    ids: string[]
    currentId: string
    hrefFor: (id: string) => string
    /** e.g. "im Auftrag" or "· Offen" */
    label: string
    /** Navigate for J/K; without it the pager clicks its own link */
    onNavigate?: (href: string) => void
    shortcuts?: boolean
}

/** Previous / next within the set a record was opened from (N-04). */
export function RecordPager({ ids, currentId, hrefFor, label, onNavigate, shortcuts = true }: RecordPagerProps) {
    const index = ids.indexOf(currentId)
    const usable = index >= 0 && ids.length > 1
    const prev = usable && index > 0 ? hrefFor(ids[index - 1]) : null
    const next = usable && index < ids.length - 1 ? hrefFor(ids[index + 1]) : null
    const prevRef = React.useRef<HTMLAnchorElement>(null)
    const nextRef = React.useRef<HTMLAnchorElement>(null)

    const go = (href: string | null, ref: React.RefObject<HTMLAnchorElement | null>) => {
        if (!href) return
        if (onNavigate) onNavigate(href)
        else ref.current?.click()
    }
    useShortcut("j", () => go(next, nextRef), { enabled: usable && shortcuts })
    useShortcut("k", () => go(prev, prevRef), { enabled: usable && shortcuts })

    if (!usable) return null

    return (
        <div className="flex items-center gap-1 text-xs text-fg-muted">
            <PagerLink ref={prevRef} href={prev} label="Vorheriges" hint="K"><ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /></PagerLink>
            <span className="tabular-nums whitespace-nowrap">{index + 1}/{ids.length} {label}</span>
            <PagerLink ref={nextRef} href={next} label="Nächstes" hint="J"><ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></PagerLink>
        </div>
    )
}

const PagerLink = React.forwardRef<HTMLAnchorElement, { href: string | null; label: string; hint: string; children: React.ReactNode }>(
    function PagerLink({ href, label, hint, children }, ref) {
        const className = cn(
            "flex h-6 w-6 items-center justify-center rounded-control border border-border",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
            href ? "text-fg-muted hover:bg-surface-hover hover:text-fg" : "cursor-default opacity-40"
        )
        if (!href) return <a ref={ref} role="link" aria-label={label} aria-disabled="true" className={className}>{children}</a>
        return <NavLink ref={ref} href={href} aria-label={label} title={`${label} (${hint})`} className={className}>{children}</NavLink>
    }
)
