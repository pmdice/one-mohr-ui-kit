import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200",
                destructive: "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg hover:scale-105 transition-all duration-200",
                outline: "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 hover:text-slate-900 hover:scale-105 transition-all duration-200",
                secondary: "bg-slate-200 text-black/90 hover:bg-slate-300 hover:text-black hover:scale-105 transition-all duration-200",
                ghost: "hover:bg-slate-100 hover:text-slate-900",
                link: "text-blue-600 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-6 py-2",
                sm: "h-9 px-4",
                lg: "h-11 px-8 text-base",
                icon: "h-10 w-10",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        // SENIOR PATTERN: Polymorphism
        // If asChild is true, we render a Slot (which merges props onto the child).
        // If false, we render a standard button.
        const Comp = asChild ? Slot : "button"

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }