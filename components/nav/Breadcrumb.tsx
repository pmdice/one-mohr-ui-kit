import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { NavLink } from "./NavLink"

export type Crumb = { label: string; href: string }

/**
 * Path by belonging (N-01): the chain of parents up to the top list, the same however the
 * page was reached. Every crumb is a page; the last one is the current page.
 */
export function Breadcrumb({ trail, className }: { trail: Crumb[]; className?: string }) {
    return (
        <nav aria-label="Pfad" className={cn("min-w-0", className)}>
            <ol className="m-0 flex min-w-0 list-none items-center gap-1 p-0 text-sm">
                {trail.map((crumb, index) => {
                    const last = index === trail.length - 1
                    return (
                        <li key={crumb.href} className={cn("flex items-center gap-1", last ? "min-w-0 flex-1" : "min-w-0 shrink")}>
                            {last ? (
                                <span aria-current="page" title={crumb.label} className="truncate font-medium text-fg">
                                    {crumb.label}
                                </span>
                            ) : (
                                <>
                                    <NavLink
                                        href={crumb.href}
                                        title={crumb.label}
                                        className="block max-w-[16rem] truncate rounded-control text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                    >
                                        {crumb.label}
                                    </NavLink>
                                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
                                </>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
