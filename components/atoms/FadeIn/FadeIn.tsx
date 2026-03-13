"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface FadeInProps {
    children: React.ReactNode
    delay?: number
    direction?: "up" | "down" | "left" | "right" | "none"
    className?: string
}

const directionOffset = {
    up:    { y: 24, x: 0 },
    down:  { y: -24, x: 0 },
    left:  { y: 0, x: 24 },
    right: { y: 0, x: -24 },
    none:  { y: 0, x: 0 },
}

export function FadeIn({ children, delay = 0, direction = "up", className }: FadeInProps) {
    const ref = React.useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })
    const { x, y } = directionOffset[direction]

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x, y }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}
