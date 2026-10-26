"use client"

import * as React from "react"

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** The app's link component (Next Link, Inertia Link, …); the kit never imports a router itself. */
export type LinkComponent = React.ComponentType<AnchorProps>

const LinkContext = React.createContext<LinkComponent | null>(null)

export function LinkProvider({ component, children }: { component: LinkComponent; children: React.ReactNode }) {
    return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
}

export const NavLink = React.forwardRef<HTMLAnchorElement, AnchorProps>(function NavLink(props, ref) {
    const Component = React.useContext(LinkContext)
    if (Component) return <Component {...props} />
    return <a ref={ref} {...props} />
})
