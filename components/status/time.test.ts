import { describe, it, expect } from 'vitest'
import { formatDateTime, formatDuration, formatRelative } from './time'

const MIN = 60_000
const at = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime()

describe('time', () => {
    it('writes durations in hours and minutes, days from 24 h', () => {
        expect(formatDuration(59_000)).toBe('< 1 min')
        expect(formatDuration(45 * MIN)).toBe('45 min')
        expect(formatDuration(130 * MIN)).toBe('2 h 10 min')
        expect(formatDuration(120 * MIN)).toBe('2 h')
        expect(formatDuration(76 * 60 * MIN)).toBe('3 d 4 h')
    })

    it('writes date and time as DD.MM.YYYY HH:MM', () => {
        expect(formatDateTime(at(21, 14, 5))).toBe('21.10.2026 14:05')
    })

    it('is relative today, "gestern" yesterday and a date before', () => {
        const now = at(26, 14, 0)
        expect(formatRelative(now - 30_000, now)).toBe('gerade eben')
        expect(formatRelative(now - 5 * MIN, now)).toBe('vor 5 min')
        expect(formatRelative(at(26, 10, 30), now)).toBe('vor 3 h')
        expect(formatRelative(at(25, 14, 5), now)).toBe('gestern 14:05')
        expect(formatRelative(at(21, 9, 0), now)).toBe('21.10.2026')
    })
})
