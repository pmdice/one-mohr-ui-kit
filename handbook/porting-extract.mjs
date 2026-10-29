// Reads the "Übertragen" bullets of one rule page. Shared by the generator and its test, so they cannot drift.

/** @param {string} mdx @returns {{ id: string, title: string, notes: string[] } | null} */
export function extractPorting(mdx) {
    const heading = mdx.match(/^# ([A-Z]-\d{2}) · (.+)$/m)
    if (!heading) return null
    const section = mdx.split(/^## Übertragen\s*$/m)[1] ?? ""
    const notes = section
        .split(/^## /m)[0]
        .split("\n")
        .filter((line) => line.startsWith("- "))
        .map((line) => line.slice(2).trim())
    return { id: heading[1], title: heading[2].trim(), notes }
}
