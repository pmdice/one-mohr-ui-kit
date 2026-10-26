"use client"

import * as React from "react"
import { Menu, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useShortcut } from "./shortcuts"
import { Sidebar, type NavGroup } from "./Sidebar"

const STORAGE_KEY = "nav:sidebar-collapsed"
const NARROW = "(max-width: 1023px)"

function readCollapsed(): boolean {
    try { return localStorage.getItem(STORAGE_KEY) === "1" } catch { return false }
}

function writeCollapsed(value: boolean) {
    try { localStorage.setItem(STORAGE_KEY, value ? "1" : "0") } catch { /* storage blocked: state is per session then */ }
}

function useNarrow(): boolean {
    const [narrow, setNarrow] = React.useState(false)
    React.useEffect(() => {
        if (typeof window.matchMedia !== "function") return
        const query = window.matchMedia(NARROW)
        const update = () => setNarrow(query.matches)
        update()
        query.addEventListener?.("change", update)
        return () => query.removeEventListener?.("change", update)
    }, [])
    return narrow
}

interface AppShellProps {
    logo: React.ReactNode
    groups: NavGroup[]
    activeId?: string
    /** Usually a GlobalSearch */
    search?: React.ReactNode
    headerEnd?: React.ReactNode
    children: React.ReactNode
    className?: string
}

/** App frame: header, sidebar, content. The sidebar folds to icons (N-12) and becomes a drawer on narrow screens. */
export function AppShell({ logo, groups, activeId, search, headerEnd, children, className }: AppShellProps) {
    const [collapsed, setCollapsed] = React.useState(false)
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const narrow = useNarrow()

    React.useEffect(() => { setCollapsed(readCollapsed()) }, [])

    const toggle = () => {
        if (narrow) { setDrawerOpen((o) => !o); return }
        setCollapsed((c) => { writeCollapsed(!c); return !c })
    }
    useShortcut("[", toggle)

    // Navigating closes the drawer
    React.useEffect(() => { setDrawerOpen(false) }, [activeId])
    React.useEffect(() => {
        if (!drawerOpen) return
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false) }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [drawerOpen])

    const iconsOnly = !narrow && collapsed
    const toggleLabel = iconsOnly ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"

    return (
        <div className={cn("flex min-h-screen flex-col bg-surface-sunken text-fg", className)}>
            <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-surface px-3">
                {narrow && (
                    <button
                        type="button"
                        aria-label="Menü öffnen"
                        aria-expanded={drawerOpen}
                        onClick={() => setDrawerOpen(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-control text-fg-muted hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                        <Menu className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}
                <div className="flex shrink-0 items-center">{logo}</div>
                <div className="flex min-w-0 flex-1 justify-center">{search}</div>
                <div className="flex shrink-0 items-center gap-2">{headerEnd}</div>
            </header>
            <div className="flex min-h-0 flex-1">
                {narrow && drawerOpen && (
                    <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" onClick={() => setDrawerOpen(false)} /* token-guard: allow */ />
                )}
                <aside
                    className={cn(
                        "flex shrink-0 flex-col border-r border-border bg-surface",
                        narrow
                            ? cn("fixed inset-y-0 left-0 z-50 w-64 transition-transform", drawerOpen ? "translate-x-0" : "-translate-x-full")
                            : cn("sticky top-12 h-[calc(100vh-3rem)]", iconsOnly ? "w-14" : "w-56")
                    )}
                    hidden={narrow && !drawerOpen}
                >
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <Sidebar groups={groups} activeId={activeId} collapsed={iconsOnly} />
                    </div>
                    {!narrow && (
                        <div className={cn("flex border-t border-border p-2", iconsOnly ? "justify-center" : "justify-end")}>
                            <button
                                type="button"
                                aria-label={toggleLabel}
                                aria-expanded={!iconsOnly}
                                title={`${toggleLabel} ([)`}
                                onClick={toggle}
                                className="flex h-7 w-7 items-center justify-center rounded-control text-fg-subtle hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                            >
                                <PanelLeft className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </aside>
                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    )
}
