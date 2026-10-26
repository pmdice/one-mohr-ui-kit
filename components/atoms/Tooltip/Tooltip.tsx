"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type TooltipSide = "top" | "bottom" | "left" | "right"

interface TooltipProps {
    content: React.ReactNode
    side?: TooltipSide
    children: React.ReactElement
    className?: string
    /** Render into document.body with fixed position, so a scrolling or clipping parent cannot cut it off */
    portal?: boolean
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

/** Fixed coordinates next to the trigger, for portal tooltips. */
function fixedPosition(rect: DOMRect, side: TooltipSide): React.CSSProperties {
    const gap = 8
    switch (side) {
        case "right": return { left: rect.right + gap, top: rect.top + rect.height / 2, transform: "translateY(-50%)" }
        case "left": return { left: rect.left - gap, top: rect.top + rect.height / 2, transform: "translate(-100%, -50%)" }
        case "bottom": return { left: rect.left + rect.width / 2, top: rect.bottom + gap, transform: "translateX(-50%)" }
        default: return { left: rect.left + rect.width / 2, top: rect.top - gap, transform: "translate(-50%, -100%)" }
    }
}

export function Tooltip({ content, side = "top", children, className, portal = false }: TooltipProps) {
    const [visible, setVisible] = React.useState(false)
    const [position, setPosition] = React.useState<React.CSSProperties | null>(null)
    const triggerRef = React.useRef<HTMLSpanElement>(null)
    const shouldReduce = useReducedMotion()

    const show = () => {
        if (portal && triggerRef.current) setPosition(fixedPosition(triggerRef.current.getBoundingClientRect(), side))
        setVisible(true)
    }

    const bubble = (
        <motion.div
            role="tooltip"
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, ...SIDE_OFFSET[side] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, ...SIDE_OFFSET[side] }}
            transition={shouldReduce ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}
            className={cn(
                "pointer-events-none z-50 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1.5 text-xs font-medium text-surface shadow-md",
                !portal && cn("absolute", SIDE_CLASS[side]),
                className
            )}
        >
            {content}
        </motion.div>
    )

    return (
        <span
            ref={triggerRef}
            className="relative inline-flex"
            onMouseEnter={show}
            onMouseLeave={() => setVisible(false)}
            onFocus={show}
            onBlur={() => setVisible(false)}
        >
            {children}
            {portal
                // Fixed wrapper outside any clipping parent; framer animates only the bubble inside
                ? visible && createPortal(
                    <div className="pointer-events-none fixed z-50" style={position ?? undefined}>{bubble}</div>,
                    document.body
                )
                : <AnimatePresence>{visible && bubble}</AnimatePresence>}
        </span>
    )
}
