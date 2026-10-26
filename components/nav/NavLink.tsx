"use client"

import * as React from "react"

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** The app's link component (Next Link, Inertia Link, …); the kit never imports a router itself. */
export type LinkComponent = React.ComponentType<AnchorProps & { ref?: React.Ref<HTMLAnchorElement> }>

function PlainLink({ ref, ...props }: AnchorProps & { ref?: React.Ref<HTMLAnchorElement> }) {
    return <a ref={ref} {...props} />
}

const LinkContext = React.createContext<LinkComponent>(PlainLink)

export function LinkProvider({ component, children }: { component: LinkComponent; children: React.ReactNode }) {
    return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
}

export function NavLink(props: AnchorProps & { ref?: React.Ref<HTMLAnchorElement> }) {
    // The component comes from context and is stable; createElement keeps the hooks lint from mistaking it for an inline one
    return React.createElement(React.useContext(LinkContext), props)
}
