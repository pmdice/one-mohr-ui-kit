import { describe, it, expect } from 'vitest'
import { orderSchema, type OrderInput } from './orderSchema'

const position = (overrides: Partial<OrderInput['positions'][number]> = {}): OrderInput['positions'][number] => ({
    no: 1, typ: 'neu', material: 'alsi10mg', qty: '10', articleId: '', note: '', extras: [], ...overrides,
})

const order = (positions: OrderInput['positions']): OrderInput => ({
    customer: 'Kunde AG', orderNo: 'A-2026-001', dueDate: '2026-11-30', remark: '', positions,
})

const issuesAt = (input: OrderInput) => {
    const result = orderSchema.safeParse(input)
    return result.success ? {} : Object.fromEntries(result.error.issues.map((i) => [i.path.join('.'), i.message]))
}

describe('orderSchema conditional fields (F-10)', () => {
    it('requires article only for template type', () => {
        expect(orderSchema.safeParse(order([position({ typ: 'neu' })])).success).toBe(true)
        expect(issuesAt(order([position({ typ: 'vorlage' })]))).toEqual({
            'positions.0.articleId': 'Bestehenden Artikel wählen',
        })
    })

    it('requires file number only for 3d print', () => {
        expect(orderSchema.safeParse(order([position({ extras: [{ art: 'waerme', fileNo: '', note: '' }] })])).success).toBe(true)
        expect(issuesAt(order([position({ extras: [{ art: '3d', fileNo: ' ', note: '' }] })]))).toEqual({
            'positions.0.extras.0.fileNo': 'Dateinummer fehlt',
        })
    })

    it('reports conditional errors together with other errors', () => {
        expect(issuesAt(order([position({ typ: 'vorlage', qty: '' })]))).toEqual({
            'positions.0.qty': 'Menge fehlt',
            'positions.0.articleId': 'Bestehenden Artikel wählen',
        })
    })

    it('strips inactive conditional values from output', () => {
        const result = orderSchema.parse(order([position({
            typ: 'neu', articleId: 'A-1', extras: [{ art: 'waerme', fileNo: 'F-9', note: '' }],
        })]))
        expect(result.positions[0]).not.toHaveProperty('articleId')
        expect(result.positions[0].extras[0]).not.toHaveProperty('fileNo')
    })

    it('keeps active conditional values in output', () => {
        const result = orderSchema.parse(order([position({
            typ: 'vorlage', articleId: 'A-1', extras: [{ art: '3d', fileNo: 'F-9', note: '' }],
        })]))
        expect(result.positions[0].articleId).toBe('A-1')
        expect(result.positions[0].extras[0].fileNo).toBe('F-9')
    })
})

describe('orderSchema quantity', () => {
    const qty = (value: string) => {
        const result = orderSchema.safeParse(order([position({ qty: value })]))
        return result.success ? result.data.positions[0].qty : result.error.issues[0].message
    }

    it('parses swiss thousands separators', () => {
        expect(qty("1'000")).toBe(1000)
        expect(qty('1 000')).toBe(1000)
    })

    it('rejects decimals with a clear message', () => {
        expect(qty('12,5')).toBe('Menge muss eine ganze Zahl sein')
    })

    it('rejects zero and empty', () => {
        expect(qty('0')).toBe('Menge muss mindestens 1 sein')
        expect(qty('')).toBe('Menge fehlt')
    })
})

describe('orderSchema header', () => {
    it('requires customer, order number and due date', () => {
        const result = orderSchema.safeParse({ ...order([position()]), customer: '', orderNo: '', dueDate: '' })
        expect(result.success).toBe(false)
        expect(result.error!.issues.map((i) => i.path.join('.'))).toEqual(['customer', 'orderNo', 'dueDate'])
    })
})
