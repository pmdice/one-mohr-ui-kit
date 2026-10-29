import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CODE128, encode128B, modules } from './code128'
import { Barcode } from './Barcode'

describe('Code 128 table', () => {
    it('has 107 patterns; data and start symbols are 11 modules, stop is 13', () => {
        expect(CODE128).toHaveLength(107)
        CODE128.forEach((p, i) => {
            const sum = [...p].reduce((a, c) => a + Number(c), 0)
            expect(sum, `value ${i}`).toBe(i === 106 ? 13 : 11)
        })
    })

    it('every symbol has an even number of bar modules (the code’s own parity check)', () => {
        CODE128.slice(0, 106).forEach((p, i) => {
            const bars = Number(p[0]) + Number(p[2]) + Number(p[4])
            expect(bars % 2, `value ${i}`).toBe(0)
        })
    })

    it('patterns are unique', () => {
        expect(new Set(CODE128).size).toBe(107)
    })
})

describe('encode128B', () => {
    it('adds start B, the checksum and stop', () => {
        // ABC: (104 + 33·1 + 34·2 + 35·3) mod 103 = 1
        expect(encode128B('ABC')).toEqual([104, 33, 34, 35, 1, 106])
    })

    it('encodes a slip number', () => {
        const values = encode128B('26100013-3')
        expect(values[0]).toBe(104)
        expect(values.at(-1)).toBe(106)
        expect(values).toHaveLength(10 + 3)
    })

    it('refuses characters Code B cannot carry', () => {
        expect(() => encode128B('Größe')).toThrow('Zeichen „ö“ kann nicht als Barcode gedruckt werden')
        expect(() => encode128B('')).toThrow('Leerer Barcode')
    })

    it('modules count matches: 11 per symbol, 13 for stop', () => {
        const m = modules(encode128B('ABC'))
        expect([...m].reduce((a, c) => a + Number(c), 0)).toBe(5 * 11 + 13)
    })
})

describe('Barcode', () => {
    it('is an image named by its value, with the value as text below and a quiet zone', () => {
        const { container } = render(<Barcode value="26100013-3" />)
        expect(screen.getByRole('img', { name: 'Barcode 26100013-3' })).toBeInTheDocument()
        expect(screen.getByText('26100013-3')).toBeInTheDocument()
        const svg = container.querySelector('svg')!
        const first = Number(container.querySelector('rect[data-bar]')!.getAttribute('x'))
        // 10 modules of 0.33 mm quiet zone before the first bar
        expect(first).toBeCloseTo(3.3)
        expect(svg.getAttribute('width')).toMatch(/mm$/)
    })
})
