"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

interface ConditionalFieldProps {
    /** Whether the field applies right now, e.g. `typ === "vorlage"` */
    when: boolean
    children: React.ReactNode
}

/**
 * F-10: a field that only applies for a certain choice. Place it right next to or below
 * the field that triggers it. When it does not apply it is removed (not greyed out), so it
 * also stops counting as required. Typed values stay in form state (shouldUnregister: false)
 * and come back when switching back.
 *
 * Schema convention: make conditional fields required via `superRefine`, and strip values of
 * inactive fields in the output `transform`, so only what applies gets saved.
 */
export function ConditionalField({ when, children }: ConditionalFieldProps) {
    const shouldReduce = useReducedMotion()
    return (
        <AnimatePresence initial={false}>
            {when && (
                <motion.div
                    initial={shouldReduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    animate={shouldReduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                    exit={shouldReduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: shouldReduce ? 0 : 0.15, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
