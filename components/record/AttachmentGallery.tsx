"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog } from "@/components/molecules/Dialog/Dialog"
import { formatBytes } from "@/components/inputs/parse"

export interface Attachment { id: string; name: string; src: string; size?: number }

const pager = "flex h-control w-[var(--control-h)] items-center justify-center rounded-control border border-border-strong text-fg hover:bg-surface-hover disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"

/** Pictures of the record as previews; large in a dialog, paged with the arrow keys (D-09). */
export function AttachmentGallery({ title, items }: { title: string; items: Attachment[] }) {
    const [open, setOpen] = React.useState<number | null>(null)
    const current = open === null ? null : items[open]
    const go = React.useCallback((step: number) => setOpen((i) => (i === null ? i : Math.min(items.length - 1, Math.max(0, i + step)))), [items.length])

    // The arrows page wherever the focus sits in the (modal) dialog
    const isOpen = open !== null
    React.useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") { e.preventDefault(); go(1) }
            if (e.key === "ArrowLeft") { e.preventDefault(); go(-1) }
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [isOpen, go])

    return (
        <section aria-label={title} className="flex flex-col gap-2">
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2 p-0">
                {items.map((item, index) => (
                    <li key={item.id}>
                        <button
                            type="button"
                            onClick={() => setOpen(index)}
                            aria-label={`${item.name} gross anzeigen`}
                            className="block aspect-square w-full overflow-hidden rounded-control border border-border bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element -- record attachments come from the app's storage */}
                            <img src={item.src} alt="" className="h-full w-full object-cover" />
                        </button>
                    </li>
                ))}
            </ul>
            {current && open !== null && (
                <Dialog
                    open
                    size="lg"
                    title={current.name}
                    description={`Bild ${open + 1} von ${items.length}${current.size ? ` · ${formatBytes(current.size)}` : ""}`}
                    onClose={() => setOpen(null)}
                    footer={
                        <>
                            <button type="button" className={pager} aria-label="Vorheriges Bild" disabled={open === 0} onClick={() => go(-1)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
                            <button type="button" className={pager} aria-label="Nächstes Bild" disabled={open === items.length - 1} onClick={() => go(1)}><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
                        </>
                    }
                >
                    <div className="flex justify-center rounded-control bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
                        <img src={current.src} alt={current.name} className="max-h-[60vh] object-contain" />
                    </div>
                </Dialog>
            )}
        </section>
    )
}
