"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Label } from "@/components/atoms/Label/Label"

interface FormFieldProps {
    label?: string
    required?: boolean
    /** Validation error — shown in red, replaces hint */
    error?: string
    /** Helper text shown below the field */
    hint?: string
    htmlFor?: string
    children: React.ReactNode
    className?: string
}

export function FormField({ label, required, error, hint, htmlFor, children, className }: FormFieldProps) {
    const shouldReduce = useReducedMotion()
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            {label && (
                <Label htmlFor={htmlFor} required={required}>
                    {label}
                </Label>
            )}
            {children}
            <AnimatePresence mode="wait">
                {error ? (
                    <motion.p
                        key="error"
                        role="alert"
                        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        transition={shouldReduce ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}
                        className="text-xs text-red-500"
                    >
                        {error}
                    </motion.p>
                ) : hint ? (
                    <motion.p
                        key="hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={shouldReduce ? { duration: 0 } : { duration: 0.15 }}
                        className="text-xs text-slate-400 dark:text-slate-500"
                    >
                        {hint}
                    </motion.p>
                ) : null}
            </AnimatePresence>
        </div>
    )
}
