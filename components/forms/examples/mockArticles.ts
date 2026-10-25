import type { ComboboxOption } from "@/components/molecules/Combobox/Combobox"

/** 3000 fake articles, as a real article master would have — too many to list, so it is searched. */
export const ARTICLES: ComboboxOption[] = Array.from({ length: 3000 }, (_, i) => ({
    value: `A-${10000 + i}`,
    label: `A-${10000 + i}`,
    description: `Gehäuse Variante ${i % 37}`,
}))

/** Simulated server search with 300–600 ms latency; honours the abort signal. */
export function searchArticles(query: string, signal: AbortSignal): Promise<ComboboxOption[]> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            const term = query.toLowerCase()
            resolve(
                ARTICLES
                    .filter((a) => a.label.toLowerCase().includes(term) || a.description!.toLowerCase().includes(term))
                    .slice(0, 20)
            )
        }, 300 + Math.random() * 300)
        signal.addEventListener("abort", () => {
            clearTimeout(timer)
            reject(new DOMException("aborted", "AbortError"))
        })
    })
}
