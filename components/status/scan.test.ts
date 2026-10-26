import { describe, it, expect } from 'vitest'
import { resolveScan, type ScanTarget } from './scan'

const T = (over: Partial<ScanTarget> = {}): ScanTarget => ({ code: '26100013-1/4', label: '26100013 – 1/4', station: null, locked: null, visits: [], ...over })
const base = { station: 'guss', stationLabel: 'Guss', lastScans: new Map<string, number>(), now: 10_000 }

describe('resolveScan', () => {
    it('scans in where the slip is not, out where it is', () => {
        expect(resolveScan({ ...base, code: '26100013 – 1/4', targets: [T()] })).toMatchObject({ kind: 'in', visit: 1, message: '26100013 – 1/4 eingescannt in Guss' })
        expect(resolveScan({ ...base, code: '26100013-1/4', targets: [T({ station: 'guss', visits: [{ station: 'guss' }] })] })).toMatchObject({ kind: 'out', message: '26100013 – 1/4 ausgescannt aus Guss' })
    })

    it('counts a second visit of the same station', () => {
        const r = resolveScan({ ...base, code: '26100013-1/4', targets: [T({ station: 'polissage', visits: [{ station: 'guss' }, { station: 'polissage' }] })] })
        expect(r).toMatchObject({ kind: 'in', visit: 2, message: '26100013 – 1/4 eingescannt in Guss (2. Durchlauf)' })
    })

    it('shows the code it read when it is unknown', () => {
        expect(resolveScan({ ...base, code: ' 99999 ', targets: [T()] })).toMatchObject({ kind: 'unknown', message: 'Unbekannter Code: 99999' })
    })

    it('refuses a closed slip and says why', () => {
        expect(resolveScan({ ...base, code: '26100013-1/4', targets: [T({ locked: 'storniert' })] })).toMatchObject({ kind: 'locked', message: '26100013 – 1/4 ist storniert. Kein Scan möglich.' })
    })

    it('ignores the same code within 3 seconds, accepts it after', () => {
        const lastScans = new Map([['26100013-1/4', 8_000]])
        expect(resolveScan({ ...base, lastScans, code: '26100013 – 1/4', targets: [T()] })).toMatchObject({ kind: 'duplicate', message: 'Schon erfasst: 26100013 – 1/4' })
        expect(resolveScan({ ...base, lastScans, now: 11_000, code: '26100013-1/4', targets: [T()] }).kind).toBe('in')
    })

    it('does not block a different code scanned right after', () => {
        const lastScans = new Map([['26100013-1/4', 9_500]])
        const other = T({ code: '26100013-2/4', label: '26100013 – 2/4' })
        expect(resolveScan({ ...base, lastScans, code: '26100013-2/4', targets: [T(), other] }).kind).toBe('in')
    })
})
