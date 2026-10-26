import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { Breadcrumb, type Crumb } from "./Breadcrumb"
import { NavLink } from "./NavLink"
import { PageTabs, type PageTab } from "./PageTabs"

interface PageHeaderProps {
    /** Path by belonging (N-01); its last crumb names the same object as `title` */
    trail: Crumb[]
    /** Way back to the list the page was opened from (N-03) */
    back?: { label: string; href: string }
    title: string
    badges?: React.ReactNode
    /** At most one filled button */
    primaryAction?: React.ReactNode
    moreActions?: React.ReactNode
    /** Usually a RecordPager (N-04) */
    pager?: React.ReactNode
    tabs?: { tabs: PageTab[]; current: string }
}

/** The same head on every object page (N-05): what this is, where it belongs, what to do here. */
export function PageHeader({ trail, back, title, badges, primaryAction, moreActions, pager, tabs }: PageHeaderProps) {
    return (
        <header className="flex flex-col gap-3">
            <div className="flex min-w-0 items-center gap-3">
                {back && (
                    <>
                        <NavLink
                            href={back.href}
                            className="flex shrink-0 items-center gap-0.5 rounded-control text-sm text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                            {back.label}
                        </NavLink>
                        <span className="h-4 w-px shrink-0 bg-border" aria-hidden="true" />
                    </>
                )}
                <Breadcrumb trail={trail} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h1 className="m-0 truncate text-xl font-semibold text-fg">{title}</h1>
                    {badges}
                </div>
                <div className="flex items-center gap-2">
                    {pager}
                    {moreActions}
                    {primaryAction}
                </div>
            </div>
            {tabs && <PageTabs tabs={tabs.tabs} current={tabs.current} />}
        </header>
    )
}
