import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Which fields carry a marker (F-01): mark the minority.
 * "required" → required fields get `*`; "optional" → optional fields get "(optional)".
 * Chosen per section by the developer, never computed at runtime, so a conditional
 * field appearing does not flip every marker on the page.
 */
export type MarkerConvention = "required" | "optional"

const MarkerContext = React.createContext<MarkerConvention>("required")

export function useMarkerConvention(): MarkerConvention {
    return React.useContext(MarkerContext)
}

export function MarkerConventionProvider({ markers, children }: { markers: MarkerConvention; children: React.ReactNode }) {
    return <MarkerContext.Provider value={markers}>{children}</MarkerContext.Provider>
}

interface FormSectionProps {
    title: string
    description?: string
    markers?: MarkerConvention
    id?: string
    className?: string
    children: React.ReactNode
}

export function FormSection({ title, description, markers = "required", id, className, children }: FormSectionProps) {
    const generatedId = React.useId()
    const headingId = `${id ?? generatedId}-title`
    return (
        <section id={id} aria-labelledby={headingId} className={cn("flex flex-col gap-stack", className)}>
            <header>
                <h2 id={headingId} className="text-sm font-semibold text-fg">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
            </header>
            <MarkerConventionProvider markers={markers}>{children}</MarkerConventionProvider>
        </section>
    )
}
