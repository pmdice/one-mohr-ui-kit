"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AccordionItem {
    id: string
    title: string
    content: React.ReactNode
}

interface AccordionProps {
    items: AccordionItem[]
    /** Allow multiple items open simultaneously */
    allowMultiple?: boolean
    className?: string
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
    const [openItems, setOpenItems] = React.useState<Set<string>>(new Set())
    const shouldReduce = useReducedMotion()

    const toggle = (id: string) => {
        setOpenItems(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                if (!allowMultiple) next.clear()
                next.add(id)
            }
            return next
        })
    }

    return (
        <div className={cn("divide-y divide-border", className)}>
            {items.map(item => {
                const isOpen = openItems.has(item.id)
                return (
                    <div key={item.id}>
                        <button
                            onClick={() => toggle(item.id)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-fg transition-colors hover:text-accent"
                        >
                            <span>{item.title}</span>
                            <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={shouldReduce ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}
                            >
                                <ChevronDown className="h-4 w-4 text-fg-muted" />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    key="content"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={shouldReduce ? { duration: 0 } : { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    className="overflow-hidden"
                                >
                                    <div className="pb-4 text-sm leading-relaxed text-fg-muted">
                                        {item.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}
