import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean
}

export function Label({ className, children, required, ...props }: LabelProps) {
    return (
        <label
            className={cn("block text-sm font-medium text-fg", className)}
            {...props}
        >
            {children}
            {required && (
                <span className="ml-1 text-danger" aria-hidden="true">*</span>
            )}
        </label>
    )
}
