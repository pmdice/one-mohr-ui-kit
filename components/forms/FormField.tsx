"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Label } from "@/components/atoms/Label/Label"
import { useMarkerConvention } from "./FormSection"
import { useRegisterRequired } from "./RequiredRegistry"

interface FormFieldProps {
    label: string
    required?: boolean
    /** Validation error — shown at the field (F-03), replaces hint */
    error?: string
    /** Helper text shown below the field */
    hint?: string
    /** Form path of the field (e.g. "positions.0.qty"); used for required-field tracking */
    name?: string
    /** Exactly one control element; it receives id and aria wiring */
    children: React.ReactElement<Record<string, unknown>>
    className?: string
}

export function FormField({ label, required = false, error, hint, name, children, className }: FormFieldProps) {
    useRegisterRequired(name, required)
    const shouldReduce = useReducedMotion()
    const convention = useMarkerConvention()
    const generatedId = React.useId()
    const controlId = (children.props.id as string | undefined) ?? `${generatedId}-control`
    const messageId = `${generatedId}-message`

    const marker = convention === "required"
        ? (required ? "required" : null)
        : (required ? null : "optional")

    const message = error ?? hint
    const control = React.cloneElement(children, {
        id: controlId,
        "aria-describedby": message ? messageId : undefined,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
    })

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <Label htmlFor={controlId} marker={marker}>{label}</Label>
            {control}
            <AnimatePresence mode="wait" initial={false}>
                {error ? (
                    <motion.p
                        key="error"
                        id={messageId}
                        role="alert"
                        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={shouldReduce ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}
                        className="text-xs text-danger"
                    >
                        {error}
                    </motion.p>
                ) : hint ? (
                    <p key="hint" id={messageId} className="text-xs text-fg-subtle">
                        {hint}
                    </p>
                ) : null}
            </AnimatePresence>
        </div>
    )
}
