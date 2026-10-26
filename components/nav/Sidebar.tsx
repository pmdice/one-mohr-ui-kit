"use client"

import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Tooltip } from "@/components/atoms/Tooltip/Tooltip"
import { cn } from "@/lib/utils"
import { NavLink } from "./NavLink"

export type NavEntry = { id: string; label: string; href: string; icon: LucideIcon; children?: NavEntry[] }
export type NavGroup = { id: string; label?: string; entries: NavEntry[]; collapsible?: boolean }

interface SidebarProps {
    groups: NavGroup[]
    /** Entry of the list the page was opened from (N-02) */
    activeId?: string
    /** Icons only, names in tooltips (N-12) */
    collapsed?: boolean
    className?: string
}

const contains = (entries: NavEntry[], id?: string): boolean =>
    !!id && entries.some((e) => e.id === id || contains(e.children ?? [], id))

/** Main menu: one entry per list (N-09), grouped by how often it is used (N-10). */
export function Sidebar({ groups, activeId, collapsed = false, className }: SidebarProps) {
    return (
        <nav aria-label="Hauptmenü" className={cn("flex flex-col gap-4 py-3", collapsed ? "px-2" : "px-3", className)}>
            {groups.map((group) => (
                <SidebarGroup key={group.id} group={group} activeId={activeId} collapsed={collapsed} />
            ))}
        </nav>
    )
}

function SidebarGroup({ group, activeId, collapsed }: { group: NavGroup; activeId?: string; collapsed: boolean }) {
    const holdsActive = contains(group.entries, activeId)
    const [open, setOpen] = React.useState(!group.collapsible || holdsActive)
    React.useEffect(() => { if (holdsActive) setOpen(true) }, [holdsActive])
    const listId = React.useId()
    const showEntries = collapsed || open

    return (
        <div className="flex flex-col gap-0.5">
            {group.label && !collapsed && (
                group.collapsible ? (
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={listId}
                        onClick={() => setOpen((o) => !o)}
                        className="flex items-center gap-1 rounded-control px-2 py-1 text-left text-xs font-medium text-fg-subtle transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                        <ChevronRight className={cn("h-3 w-3 transition-transform", open && "rotate-90")} aria-hidden="true" />
                        {group.label}
                    </button>
                ) : (
                    <p className="m-0 px-2 py-1 text-xs font-medium text-fg-subtle">{group.label}</p>
                )
            )}
            {showEntries && (
                <ul id={listId} className="m-0 flex list-none flex-col gap-0.5 p-0">
                    {group.entries.map((entry) => (
                        <SidebarEntry key={entry.id} entry={entry} activeId={activeId} collapsed={collapsed} />
                    ))}
                </ul>
            )}
        </div>
    )
}

function SidebarEntry({ entry, activeId, collapsed, nested = false }: { entry: NavEntry; activeId?: string; collapsed: boolean; nested?: boolean }) {
    const active = entry.id === activeId
    // Collapsed, nested views are hidden: their parent carries the mark (but is not the current page)
    const marked = active || (collapsed && contains(entry.children ?? [], activeId))
    const Icon = entry.icon
    const link = (
        <NavLink
            href={entry.href}
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? entry.label : undefined}
            data-active={marked || undefined}
            className={cn(
                "flex items-center gap-2 rounded-control text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                collapsed ? "h-8 w-8 justify-center" : "h-7 px-2",
                nested && !collapsed && "pl-8 text-xs",
                marked ? "bg-surface-hover font-medium text-fg" : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            )}
        >
            {!nested && <Icon className={cn("h-4 w-4 shrink-0", marked ? "text-accent" : "text-fg-subtle")} aria-hidden="true" />}
            {!collapsed && <span className="truncate">{entry.label}</span>}
        </NavLink>
    )

    return (
        <li>
            {collapsed ? <Tooltip content={entry.label} side="right" portal>{link}</Tooltip> : link}
            {!collapsed && entry.children && (
                <ul className="m-0 mt-0.5 flex list-none flex-col gap-0.5 p-0">
                    {entry.children.map((child) => (
                        <SidebarEntry key={child.id} entry={child} activeId={activeId} collapsed={collapsed} nested />
                    ))}
                </ul>
            )}
        </li>
    )
}
