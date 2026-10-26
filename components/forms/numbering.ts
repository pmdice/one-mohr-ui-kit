/**
 * Stable numbering for repeatable blocks (F-06): a block keeps its number for life.
 * Removing leaves a gap; numbers are never reused (except when undo restores that very block).
 */
export function nextNumber(maxEverAssigned: number): number {
    return maxEverAssigned + 1
}

export function initialMax(items: { no: number }[]): number {
    return items.reduce((max, item) => Math.max(max, item.no), 0)
}
