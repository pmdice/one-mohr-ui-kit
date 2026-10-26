import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { Pagination, usePageSize } from './Pagination'

afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })

describe('Pagination', () => {
    it('shows the range and pages', async () => {
        const onPageChange = vi.fn()
        const onPageSizeChange = vi.fn()
        render(<Pagination page={2} pageSize={25} total={312} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />)
        expect(screen.getByText('26–50 von 312')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Nächste Seite' }))
        expect(onPageChange).toHaveBeenCalledWith(3)
        await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Pro Seite' }), '50')
        expect(onPageSizeChange).toHaveBeenCalledWith(50)
    })

    it('disables the edges and handles an empty list', () => {
        const { rerender } = render(<Pagination page={1} pageSize={25} total={20} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)
        expect(screen.getByText('1–20 von 20')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Vorherige Seite' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Nächste Seite' })).toBeDisabled()
        rerender(<Pagination page={1} pageSize={25} total={0} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)
        expect(screen.getByText('0 Einträge')).toBeInTheDocument()
    })
})

function SizeProbe() {
    const [size, setSize] = usePageSize('slips')
    return <button onClick={() => setSize(100)}>{size}</button>
}

describe('usePageSize', () => {
    it('remembers the size per list on this device', async () => {
        const { unmount } = render(<SizeProbe />)
        await userEvent.click(screen.getByRole('button', { name: '25' }))
        unmount()
        render(<SizeProbe />)
        expect(screen.getByRole('button', { name: '100' })).toBeInTheDocument()
    })

    it('works when storage is blocked', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('x') })
        render(<SizeProbe />)
        expect(screen.getByRole('button', { name: '25' })).toBeInTheDocument()
    })
})
