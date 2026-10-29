import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Content on the left, properties on the right (D-01). On narrow screens the properties come first,
 * right under the header, so the facts are seen before the details.
 */
export function RecordLayout({ main, aside, className }: { main: React.ReactNode; aside: React.ReactNode; className?: string }) {
    return (
        <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]", className)}>
            <aside aria-label="Angaben zum Datensatz" className="flex flex-col gap-4 lg:order-2">{aside}</aside>
            <div className="flex min-w-0 flex-col gap-6 lg:order-1">{main}</div>
        </div>
    )
}
