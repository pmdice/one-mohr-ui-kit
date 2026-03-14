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

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
    const [activeTab, setActiveTab] = React.useState(defaultTab ?? tabs[0]?.id)
    const shouldReduce = useReducedMotion()

    return (
        <div className={cn("w-full", className)}>
            {/* Tab strip */}
            <div className="relative flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative z-10 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            activeTab === tab.id
                                ? "text-neutral-900 dark:text-white"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                    >
                        {/* Sliding pill indicator */}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-neutral-900"
                                transition={shouldReduce ? { duration: 0 } : { type: "spring", bounce: 0.2, duration: 0.35 }}
                            />
                        )}
                        <span className="relative">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="mt-4">
                {tabs.map(tab =>
                    tab.id === activeTab ? (
                        <motion.div
                            key={tab.id}
                            initial={shouldReduce ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={shouldReduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
                        >
                            {tab.content}
                        </motion.div>
                    ) : null
                )}
            </div>
        </div>
    )
}
