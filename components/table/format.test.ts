import { describe, it, expect } from 'vitest'
import { EMPTY, formatDate, formatNumber } from './format'

describe('format', () => {
    it('groups thousands with ’ and shows empty values as —', () => {
        expect(formatNumber(1234567)).toBe('1’234’567')
        expect(formatNumber(0)).toBe('0')
        expect(formatNumber(12.5)).toBe('12.5')
        expect(formatNumber(null)).toBe(EMPTY)
        expect(formatNumber(undefined)).toBe('—')
    })

    it('writes dates as DD.MM.YYYY', () => {
        expect(formatDate('2026-10-21')).toBe('21.10.2026')
        expect(formatDate(null)).toBe(EMPTY)
    })
})
