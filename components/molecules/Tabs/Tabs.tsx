"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface TabItem {
    id: string
    label: string
    content: React.ReactNode
}

interface TabsProps {
    tabs: TabItem[]
    defaultTab?: string
    className?: string
}

/** Switches content within one page. Same underline look as PageTabs, so the kit has one tab style (N-11). */
export function Tabs({ tabs, defaultTab, className }: TabsProps) {
    const [activeTab, setActiveTab] = React.useState(defaultTab ?? tabs[0]?.id)
    const shouldReduce = useReducedMotion()
    const baseId = React.useId()

    const onKeyDown = (event: React.KeyboardEvent) => {
        const index = tabs.findIndex((t) => t.id === activeTab)
        const next = event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1 : null
        if (next === null) return
        const tab = tabs[(next + tabs.length) % tabs.length]
        setActiveTab(tab.id)
        document.getElementById(`${baseId}-tab-${tab.id}`)?.focus()
    }

    return (
        <div className={cn("w-full", className)}>
            <div role="tablist" onKeyDown={onKeyDown} className="flex gap-4 border-b border-border">
                {tabs.map((tab) => {
                    const active = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            id={`${baseId}-tab-${tab.id}`}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            aria-controls={`${baseId}-panel-${tab.id}`}
                            tabIndex={active ? 0 : -1}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "-mb-px border-b-2 px-0.5 pb-2 pt-1 text-sm transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                                active ? "border-accent font-medium text-fg" : "border-transparent text-fg-muted hover:text-fg"
                            )}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {tabs.map((tab) =>
                tab.id === activeTab ? (
                    <motion.div
                        key={tab.id}
                        id={`${baseId}-panel-${tab.id}`}
                        role="tabpanel"
                        aria-labelledby={`${baseId}-tab-${tab.id}`}
                        className="mt-4"
                        initial={shouldReduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={shouldReduce ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}
                    >
                        {tab.content}
                    </motion.div>
                ) : null
            )}
        </div>
    )
}
