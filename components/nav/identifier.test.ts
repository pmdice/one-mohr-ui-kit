import { describe, it, expect } from 'vitest'
import { matchesIdentifier, normalizeIdentifier } from './identifier'

describe('normalizeIdentifier', () => {
    it('brings every way of writing a slip number to one form', () => {
        expect(normalizeIdentifier('26100013 – 1/4')).toBe('26100013-1/4')
        expect(normalizeIdentifier('26100013-1/4')).toBe('26100013-1/4')
        expect(normalizeIdentifier('26100013 1/4')).toBe('26100013-1/4')
        expect(normalizeIdentifier(' #26100013—1/4 ')).toBe('26100013-1/4')
    })

    it('ignores case', () => {
        expect(normalizeIdentifier('AB-12')).toBe('ab-12')
    })
})

describe('matchesIdentifier', () => {
    it('matches an alias exactly', () => {
        expect(matchesIdentifier('26100013-1', '26100013 – 1/4', ['26100013-1'])).toBe('exact')
    })

    it('matches the start of an identifier as prefix', () => {
        expect(matchesIdentifier('26100013', '26100013 – 1/4')).toBe('prefix')
        expect(matchesIdentifier('2610', '26100013')).toBe('prefix')
    })

    it('returns null when nothing matches', () => {
        expect(matchesIdentifier('999', '26100013')).toBeNull()
        expect(matchesIdentifier('', '26100013')).toBeNull()
    })
})
