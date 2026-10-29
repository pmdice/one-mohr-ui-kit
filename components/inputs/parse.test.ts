import { describe, it, expect } from 'vitest'
import { formatBytes, formatDate, formatMoney, formatNumber, parseDate, parseMoney, parseNumber, weekday } from './parse'

describe('parseNumber', () => {
    it.each([
        ['1,5', 1.5],
        ['1.5', 1.5],
        ["1'234.5", 1234.5],
        ['1’234,5', 1234.5],
        ['1 234', 1234],
        ['  -12 ', -12],
        ['0', 0],
    ])('reads %s', (text, value) => {
        expect(parseNumber(text)).toEqual({ ok: true, value })
    })

    it('reads empty as no value', () => {
        expect(parseNumber('   ')).toEqual({ ok: true, value: null })
    })

    it('says why it cannot read', () => {
        expect(parseNumber('1,2,3')).toEqual({ ok: false, reason: 'Mehr als ein Komma oder Punkt' })
        expect(parseNumber('zwölf')).toEqual({ ok: false, reason: 'Keine Zahl' })
        expect(parseNumber('1.5', { decimals: 0 })).toEqual({ ok: false, reason: 'Nur ganze Zahlen' })
    })

    it('rounds to the allowed decimals', () => {
        expect(parseNumber('1.23456', { decimals: 2 })).toEqual({ ok: true, value: 1.23 })
    })
})

describe('formatNumber', () => {
    it('groups with ’ and keeps fixed decimals when asked', () => {
        expect(formatNumber(1234567.5)).toBe('1’234’567.5')
        expect(formatNumber(1234.5, { decimals: 2 })).toBe('1’234.50')
        expect(formatNumber(-1500, { decimals: 0 })).toBe('-1’500')
        expect(formatNumber(null)).toBe('')
    })
})

describe('money in cents', () => {
    it.each([
        ['19.99', 1999],
        ['0.1', 10],
        ['0.2', 20],
        ["1'234.5", 123450],
        ['12', 1200],
        ['-3.05', -305],
    ])('reads %s as %i cents without floating point drift', (text, cents) => {
        expect(parseMoney(text)).toEqual({ ok: true, cents })
    })

    it('refuses more than two decimals', () => {
        expect(parseMoney('1.234')).toEqual({ ok: false, reason: 'Höchstens zwei Stellen nach dem Punkt' })
    })

    it('formats cents', () => {
        expect(formatMoney(123450)).toBe('1’234.50')
        expect(formatMoney(5)).toBe('0.05')
        expect(formatMoney(-305)).toBe('-3.05')
        expect(formatMoney(null)).toBe('')
    })
})

describe('parseDate', () => {
    const today = '2026-10-29'
    it.each([
        ['14.11.2026', '2026-11-14'],
        ['14.11.26', '2026-11-14'],
        ['14.11.', '2026-11-14'],
        ['14.11', '2026-11-14'],
        ['1.2.2027', '2027-02-01'],
        ['14112026', '2026-11-14'],
        ['heute', '2026-10-29'],
        ['Morgen', '2026-10-30'],
        ['+3', '2026-11-01'],
        ['2026-11-14', '2026-11-14'],
        ['29.02.2028', '2028-02-29'],
    ])('reads %s', (text, value) => {
        expect(parseDate(text, today)).toEqual({ ok: true, value })
    })

    it('reads empty as no date', () => {
        expect(parseDate('', today)).toEqual({ ok: true, value: null })
    })

    it('says why it cannot read', () => {
        expect(parseDate('31.02.2027', today)).toEqual({ ok: false, reason: 'Diesen Tag gibt es nicht' })
        expect(parseDate('29.02.2027', today)).toEqual({ ok: false, reason: 'Diesen Tag gibt es nicht' })
        expect(parseDate('nächste Woche', today)).toEqual({ ok: false, reason: 'Kein Datum. Beispiel: 14.11.2026, morgen, +3' })
    })
})

describe('date display', () => {
    it('writes Swiss dates and short weekdays', () => {
        expect(formatDate('2026-11-14')).toBe('14.11.2026')
        expect(formatDate(null)).toBe('')
        expect(weekday('2026-11-13')).toBe('Fr')
        expect(weekday('2026-11-16')).toBe('Mo')
    })
})

describe('formatBytes', () => {
    it('uses B, KB and MB with one decimal', () => {
        expect(formatBytes(512)).toBe('512 B')
        expect(formatBytes(2048)).toBe('2 KB')
        expect(formatBytes(14.2 * 1024 * 1024)).toBe('14.2 MB')
    })
})

describe('date steps', () => {
    it('keeps the day or falls back to the last day of a shorter month', async () => {
        const { addMonths, addDays } = await import('./parse')
        expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
        expect(addMonths('2028-01-31', 1)).toBe('2028-02-29')
        expect(addMonths('2026-12-15', 1)).toBe('2027-01-15')
        expect(addMonths('2026-01-15', -1)).toBe('2025-12-15')
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    })
})
