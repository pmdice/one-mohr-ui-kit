import { describe, it, expect } from 'vitest'
import { initialMax, nextNumber } from './numbering'

describe('stable numbering', () => {
    it('next number is highest ever assigned + 1', () => {
        expect(nextNumber(4)).toBe(5)
    })

    it('initial max is the highest existing number', () => {
        expect(initialMax([{ no: 1 }, { no: 3 }])).toBe(3)
    })

    it('initial max of an empty list is 0', () => {
        expect(initialMax([])).toBe(0)
    })
})
