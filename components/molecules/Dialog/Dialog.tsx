"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const FOCUSABLE = 'button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), a[href]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'

const SIZES = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" } as const

/** Ids of the dialogs this one is opened from; a nested dialog keeps the focus it took. */
const Ancestors = React.createContext<string[]>([])

/** Open dialogs share one scroll lock on the page. */
let locks = 0

/** Open dialogs; the deepest (last opened among equals) is the one on top. */
const openDialogs: { id: string; depth: number; panel: () => HTMLElement | null }[] = []
const isTop = (id: string) => {
    const top = openDialogs.reduce<(typeof openDialogs)[number] | null>((best, d) => (!best || d.depth >= best.depth ? d : best), null)
    return top?.id === id
}
const focusInto = (panel: HTMLElement | null) => (panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel)?.focus()

/**
 * The one modal for the kit: labelled, focus starts inside and stays there, Escape and the backdrop close it,
 * focus returns to where it came from, the page behind does not scroll (G-07). `alertdialog` for questions
 * that need an answer (S-06).
 */
export function Dialog({ open, onClose, title, description, role = "dialog", initialFocus, footer, size = "md", closeLabel = "Schliessen", hideClose, className, children }: {
    open: boolean
    onClose: () => void
    title: string
    description?: React.ReactNode
    role?: "dialog" | "alertdialog"
    /** Where focus starts; otherwise the first field or button in the content. */
    initialFocus?: React.RefObject<HTMLElement | null>
    /** Buttons, right-aligned below the content. */
    footer?: React.ReactNode
    size?: keyof typeof SIZES
    closeLabel?: string
    hideClose?: boolean
    className?: string
    children?: React.ReactNode
}) {
    const id = React.useId()
    const ancestors = React.useContext(Ancestors)
    const chain = React.useMemo(() => [...ancestors, id], [ancestors, id])
    const panelRef = React.useRef<HTMLDivElement>(null)
    const bodyRef = React.useRef<HTMLDivElement>(null)
    const backdropRef = React.useRef<HTMLDivElement>(null)
    const closeRef = React.useRef(onClose)
    React.useEffect(() => { closeRef.current = onClose })

    React.useEffect(() => {
        if (!open) return
        const returnTo = document.activeElement as HTMLElement | null
        // Portalled to body, the dialog takes the density of the place it was opened from (G-06)
        const density = returnTo?.closest("[data-density]")?.getAttribute("data-density")
        if (density) backdropRef.current?.setAttribute("data-density", density)
        const host = returnTo?.closest<HTMLElement>("[data-dialog-chain]")
        // A dialog opened from inside this one already holds the focus
        // Registered before moving focus, so the dialog below does not pull it back
        const entry = { id, depth: chain.length, panel: () => panelRef.current }
        openDialogs.push(entry)
        const nestedHasFocus = host != null && host !== panelRef.current && (host.dataset.dialogChain ?? "").split(" ").includes(id)
        if (!nestedHasFocus) {
            const target = initialFocus?.current ?? bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current
            target?.focus()
        }
        locks += 1
        document.body.style.overflow = "hidden"

        // Focus that left the dialog (an element removed, a click outside) is brought back on the next move
        const onFocusIn = (e: FocusEvent) => {
            const target = e.target as HTMLElement
            if (!isTop(id) || panelRef.current?.contains(target) || target.closest?.("[data-floating]")) return
            focusInto(panelRef.current)
        }
        // Escape with focus outside every dialog (e.g. on body) still closes the top one
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !e.defaultPrevented && isTop(id)) { e.preventDefault(); closeRef.current() }
        }
        document.addEventListener("focusin", onFocusIn)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("focusin", onFocusIn)
            document.removeEventListener("keydown", onKey)
            openDialogs.splice(openDialogs.indexOf(entry), 1)
            locks -= 1
            if (locks === 0) document.body.style.overflow = ""
            if (nestedHasFocus) return
            if (returnTo?.isConnected) { returnTo.focus(); return }
            // The trigger is gone: fall back to the dialog this one was opened from, if it is still open
            const parent = openDialogs.filter((d) => ancestors.includes(d.id)).pop()
            focusInto(parent?.panel() ?? null)
        }
    }, [open, id, initialFocus, chain, ancestors])

    if (!open || typeof document === "undefined") return null
    const hasBody = children !== undefined && children !== null && children !== false && children !== ""

    const onKeyDown = (e: React.KeyboardEvent) => {
        // React events bubble through portals: the innermost open dialog answers and stops here
        if (e.key === "Escape") {
            // Handled inside already (an open list, a calendar): that is all Escape should do
            if (e.defaultPrevented) return
            e.preventDefault(); e.stopPropagation(); onClose(); return
        }
        if (e.key !== "Tab") return
        e.stopPropagation()
        const els = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
        if (els.length === 0) { e.preventDefault(); return }
        const first = els[0], last = els[els.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === panelRef.current)) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    return createPortal(
        <Ancestors.Provider value={chain}>
            <div
                ref={backdropRef}
                data-testid="dialog-backdrop"
                onKeyDown={onKeyDown}
                onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 motion-safe:animate-[fade-in_var(--dur-base)_var(--ease-out)]"
            >
                <div
                    ref={panelRef}
                    role={role}
                    aria-modal="true"
                    aria-labelledby={`${id}-title`}
                    aria-describedby={description ? `${id}-description` : undefined}
                    tabIndex={-1}
                    data-dialog-chain={chain.join(" ")}
                    className={cn(
                        "flex max-h-[85vh] w-full flex-col rounded-panel bg-surface-raised text-fg shadow-overlay focus:outline-none motion-safe:animate-[dialog-in_var(--dur-base)_var(--ease-out)]",
                        SIZES[size],
                        className
                    )}
                >
                    <div className="flex items-start gap-4 px-5 pt-5">
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <h2 id={`${id}-title`} className="m-0 text-base font-semibold text-fg">{title}</h2>
                            {description && <div id={`${id}-description`} className="text-sm text-fg-muted">{description}</div>}
                        </div>
                        {!hideClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label={closeLabel}
                                className="-mr-1 -mt-1 rounded-control p-1 text-fg-subtle hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                    <div ref={bodyRef} className={cn("min-h-0 flex-1 overflow-y-auto px-5 pb-5 text-sm", hasBody && "pt-4")}>{hasBody && children}</div>
                    {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
                </div>
            </div>
        </Ancestors.Provider>,
        document.body
    )
}
