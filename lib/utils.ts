import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge the token scales from app/tokens.css. Without this it reads
// `text-control` as a color and silently drops `text-fg` / `text-accent-fg` next to it.
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: ["control"],
            radius: ["control", "panel"],
        },
    },
})

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
