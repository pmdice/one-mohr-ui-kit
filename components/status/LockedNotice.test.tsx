import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LockedNotice } from './LockedNotice'

const STORNIERT = { id: 'storniert', label: 'Storniert', category: 'canceled' as const }
const at = new Date(2026, 9, 21, 9, 30).getTime()

describe('LockedNotice', () => {
    it('says what, when, who and why, and offers to reopen', async () => {
        const onReopen = vi.fn()
        render(<LockedNotice status={STORNIERT} at={at} by="P. Mohr" reason="Kunde hat abgesagt" canReopen onReopen={onReopen} />)
        expect(screen.getByRole('note')).toHaveTextContent('Storniert am 21.10.2026 von P. Mohr: Kunde hat abgesagt. Felder sind gesperrt.')
        await userEvent.click(screen.getByRole('button', { name: 'Wieder öffnen' }))
        expect(onReopen).toHaveBeenCalled()
    })

    it('says who may reopen when you may not', () => {
        render(<LockedNotice status={STORNIERT} at={at} by="P. Mohr" canReopen={false} reopenHint="Wieder öffnen können Admins." onReopen={vi.fn()} />)
        expect(screen.getByRole('note')).toHaveTextContent('Storniert am 21.10.2026 von P. Mohr. Felder sind gesperrt.Wieder öffnen können Admins.')
        expect(screen.queryByRole('button')).toBeNull()
    })
})
