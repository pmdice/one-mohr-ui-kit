import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress",
    {
        variants: {
            variant: {
                default:     "bg-accent text-accent-fg hover:bg-accent-hover",
                destructive: "bg-danger text-danger-fg hover:bg-danger-hover",
                outline:     "border border-border-strong bg-transparent text-fg hover:bg-surface-hover",
                secondary:   "bg-surface-sunken text-fg hover:bg-surface-hover",
                ghost:       "text-fg hover:bg-surface-hover",
                link:        "text-accent underline-offset-4 hover:underline",
            },
            size: {
                default: "h-control px-control text-control",
                sm: "h-7 px-2.5 text-xs",
                lg: "h-11 px-5 text-base",
                icon: "h-control w-[var(--control-h)]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    /**
     * If true, the button will render as its child element (e.g., a Link)
     * while maintaining button styling. Useful for semantic HTML.
     */
    asChild?: boolean
    /**
     * Work in progress: shows a spinner and swallows clicks, but stays enabled
     * so focus is not lost and the reason stays visible.
     */
    busy?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, busy = false, onClick, children, ...props }, ref) => {
        // SENIOR PATTERN: Polymorphism
        // If asChild is true, we render a Slot (which merges props onto the child).
        // If false, we render a standard button.
        const Comp = asChild ? Slot : "button"

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (busy) {
                event.preventDefault()
                return
            }
            onClick?.(event)
        }

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                aria-busy={busy || undefined}
                onClick={handleClick}
                {...props}
            >
                {asChild ? children : (
                    <>
                        {busy && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                        {children}
                    </>
                )}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
