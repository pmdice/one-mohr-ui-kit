"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type TooltipSide = "top" | "bottom" | "left" | "right"

interface TooltipProps {
    content: React.ReactNode
    side?: TooltipSide
    children: React.ReactElement
    className?: string
}

const SIDE_CLASS: Record<TooltipSide, string> = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full top-1/2 -translate-y-1/2 ml-2",
}

const SIDE_OFFSET: Record<TooltipSide, object> = {
    top:    { y: 4 },
    bottom: { y: -4 },
    left:   { x: 4 },
    right:  { x: -4 },
}

export function Tooltip({ content, side = "top", children, className }: TooltipProps) {
    const [visible, setVisible] = React.useState(false)

    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
        >
            {children}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        role="tooltip"
                        initial={{ opacity: 0, ...SIDE_OFFSET[side] }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, ...SIDE_OFFSET[side] }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-md dark:bg-neutral-700",
                            SIDE_CLASS[side],
                            className
                        )}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    )
}
