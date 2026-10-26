/** One form for every way an identifier gets written: "26100013 – 1/4" = "26100013-1/4" (N-06). */
export function normalizeIdentifier(raw: string): string {
    return raw
        .trim()
        .toLowerCase()
        .replace(/#/g, "")
        .replace(/[\s–—-]+/g, "-")
        .replace(/^-|-$/g, "")
}

/** How a query matches an identifier or one of its aliases: exactly, as its start, or not at all. */
export function matchesIdentifier(query: string, id: string, aliases: string[] = []): "exact" | "prefix" | null {
    const q = normalizeIdentifier(query)
    if (!q) return null
    const candidates = [id, ...aliases].map(normalizeIdentifier)
    if (candidates.includes(q)) return "exact"
    if (candidates.some((c) => c.startsWith(q))) return "prefix"
    return null
}
