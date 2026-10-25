import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    /** Marker shown after the text; which one is decided by the section's convention (F-01). */
    marker?: "required" | "optional" | null
}

export function Label({ className, children, marker, ...props }: LabelProps) {
    return (
        <label
            className={cn("block text-sm font-medium text-fg", className)}
            {...props}
        >
            {children}
            {marker === "required" && (
                <>
                    <span className="ml-0.5 text-danger" aria-hidden="true">*</span>
                    <span className="sr-only"> (Pflicht)</span>
                </>
            )}
            {marker === "optional" && (
                <span className="ml-1 font-normal text-fg-subtle">(optional)</span>
            )}
        </label>
    )
}
