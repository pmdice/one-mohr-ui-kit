"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CardProps {
    /** When true, the card lifts and scales on hover via Framer Motion */
    interactive?: boolean
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    onClick?: React.MouseEventHandler<HTMLDivElement>
    id?: string
}

export function Card({ className, interactive = false, children, style, onClick, id }: CardProps) {
    const shouldReduce = useReducedMotion()
    const base = cn(
        "rounded-panel border border-border bg-surface-raised p-6 shadow-sm",
        className
    )

    if (interactive) {
        return (
            <motion.div
                whileHover={shouldReduce ? undefined : { y: -4 }}
                whileTap={shouldReduce ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(base, "transition-shadow hover:shadow-lg")}
                style={style}
                onClick={onClick}
                id={id}
            >
                {children}
            </motion.div>
        )
    }

    return (
        <div className={base} style={style} onClick={onClick} id={id}>
            {children}
        </div>
    )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("mb-4", className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-lg font-semibold text-fg", className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("mt-1 text-sm text-fg-muted", className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("", className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("mt-4 flex items-center gap-2", className)} {...props} />
}
