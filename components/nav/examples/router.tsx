"use client"

import * as React from "react"

type RouterState = { stack: string[]; navigate: (href: string) => void; replace: (href: string) => void; back: () => void }

const RouterContext = React.createContext<RouterState | null>(null)

/** A tiny in-memory router for the example; real apps pass their own Link to LinkProvider. */
export function MemoryRouter({ initial, children }: { initial: string; children: React.ReactNode }) {
    const [stack, setStack] = React.useState([initial])
    const value = React.useMemo<RouterState>(() => ({
        stack,
        navigate: (href) => setStack((s) => [...s, href]),
        replace: (href) => setStack((s) => [...s.slice(0, -1), href]),
        back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    }), [stack])
    return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

function useRouter(): RouterState {
    const router = React.useContext(RouterContext)
    if (!router) throw new Error("MemoryRouter missing")
    return router
}

export function useLocation(): { href: string; path: string; query: URLSearchParams } {
    const { stack } = useRouter()
    const href = stack[stack.length - 1]
    const [path, search = ""] = href.split("?")
    return { href, path, query: new URLSearchParams(search) }
}

export const useNavigate = () => useRouter().navigate
export const useReplace = () => useRouter().replace
export const useBack = () => useRouter().back

/** Link for LinkProvider: plain clicks navigate in memory, ⌘/Ctrl/Shift-clicks keep browser behaviour. */
export function RouterLink({ href, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    const navigate = useNavigate()
    return (
        <a
            href={href}
            onClick={(event) => {
                onClick?.(event)
                if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                event.preventDefault()
                navigate(href)
            }}
            {...props}
        />
    )
}

/** Build an href from a path and params, dropping empty values. */
export function hrefOf(path: string, params: Record<string, string | number | undefined | null> = {}): string {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== "") query.set(key, String(value))
    const qs = query.toString()
    return qs ? `${path}?${qs}` : path
}
