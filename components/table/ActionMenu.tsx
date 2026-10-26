"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export type MenuItem = { id: string; label: string; onSelect: () => void; disabled?: boolean }

/** "…" menu for the less frequent actions of a row (L-11). ARIA menu button pattern. */
export function ActionMenu({ items, label = "Weitere Aktionen", className }: { items: MenuItem[]; label?: string; className?: string }) {
    const [open, setOpen] = React.useState(false)
    const [position, setPosition] = React.useState<React.CSSProperties>({})
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const menuRef = React.useRef<HTMLDivElement>(null)
    const menuId = React.useId()

    const itemsEls = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])

    React.useEffect(() => {
        if (!open) return
        itemsEls()[0]?.focus()
        const onDown = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", onDown)
        return () => document.removeEventListener("mousedown", onDown)
    }, [open])

    // Fixed position next to the button, in a portal: table scroll containers would clip it.
    // Opens upwards when there is not enough room below.
    const place = () => {
        const rect = buttonRef.current?.getBoundingClientRect()
        if (!rect) return
        const height = items.length * 32 + 8
        const below = window.innerHeight - rect.bottom
        const right = window.innerWidth - rect.right
        setPosition(below < height + 8 && rect.top > height + 8
            ? { right, bottom: window.innerHeight - rect.top + 4 }
            : { right, top: rect.bottom + 4 })
    }
    const toggleOpen = (next: boolean) => {
        if (next) place()
        setOpen(next)
    }

    const close = (refocus: boolean) => {
        setOpen(false)
        if (refocus) buttonRef.current?.focus()
    }

    const onMenuKeyDown = (e: React.KeyboardEvent) => {
        const els = itemsEls()
        const index = els.indexOf(document.activeElement as HTMLElement)
        const focus = (i: number) => els[(i + els.length) % els.length]?.focus()
        switch (e.key) {
            case "ArrowDown": e.preventDefault(); focus(index + 1); break
            case "ArrowUp": e.preventDefault(); focus(index - 1); break
            case "Home": e.preventDefault(); focus(0); break
            case "End": e.preventDefault(); focus(els.length - 1); break
            case "Escape": e.preventDefault(); e.stopPropagation(); close(true); break
            case "Tab": close(false); break
        }
    }

    const select = (item: MenuItem) => {
        if (item.disabled) return
        close(true)
        item.onSelect()
    }

    return (
        <div className={cn("relative inline-flex", className)}>
            <button
                ref={buttonRef}
                type="button"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                onClick={() => toggleOpen(!open)}
                onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); toggleOpen(true) } }}
                className="flex h-7 w-7 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
            {open && createPortal(
                <div
                    ref={menuRef}
                    id={menuId}
                    role="menu"
                    aria-label={label}
                    onKeyDown={onMenuKeyDown}
                    style={position}
                    className="fixed z-50 min-w-44 rounded-panel border border-border bg-surface-raised py-1 shadow-lg"
                >
                    {items.map((item) => (
                        <div
                            key={item.id}
                            role="menuitem"
                            tabIndex={-1}
                            aria-disabled={item.disabled || undefined}
                            onClick={() => select(item)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(item) } }}
                            className={cn(
                                "cursor-pointer px-3 py-1.5 text-sm text-fg outline-none hover:bg-surface-hover focus:bg-surface-hover",
                                item.disabled && "cursor-default opacity-50"
                            )}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    )
}
