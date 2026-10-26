import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-control px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default:     "bg-accent-subtle text-accent",
                success:     "bg-success-subtle text-success",
                warning:     "bg-warning-subtle text-warning",
                destructive: "bg-danger-subtle text-danger",
                outline:     "border border-border-strong text-fg",
                secondary:   "bg-surface-sunken text-fg",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
