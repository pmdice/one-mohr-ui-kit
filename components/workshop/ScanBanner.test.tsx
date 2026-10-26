import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ScanBanner } from './ScanBanner'

describe('ScanBanner', () => {
    it('says EIN with the sentence and plays the tone once per scan', () => {
        const play = vi.fn()
        const r = { id: 1, kind: 'in' as const, message: '26100013 – 1/4 eingescannt in Guss' }
        const { rerender } = render(<ScanBanner result={r} play={play} />)
        expect(screen.getByRole('status')).toHaveTextContent('EIN26100013 – 1/4 eingescannt in Guss')
        rerender(<ScanBanner result={r} play={play} />)
        expect(play).toHaveBeenCalledTimes(1)
        expect(play).toHaveBeenCalledWith('in')
        rerender(<ScanBanner result={{ ...r, id: 2, kind: 'out', message: '… ausgescannt aus Guss' }} play={play} />)
        expect(screen.getByRole('status')).toHaveTextContent('AUS')
        expect(play).toHaveBeenLastCalledWith('out')
    })

    it('shows an error loudly with the next step', () => {
        render(<ScanBanner result={{ id: 1, kind: 'error', message: 'Code nicht erkannt.', next: 'Nummer unten eintippen oder Zettel ins Büro bringen.' }} play={vi.fn()} />)
        expect(screen.getByRole('alert')).toHaveTextContent('FEHLERCode nicht erkannt.Nummer unten eintippen oder Zettel ins Büro bringen.')
    })

    it('stays silent when the sound is off', () => {
        const play = vi.fn()
        render(<ScanBanner result={{ id: 1, kind: 'in', message: 'x' }} play={play} sound={false} />)
        expect(play).not.toHaveBeenCalled()
    })

    it('offers to take the scan back', async () => {
        const onUndo = vi.fn()
        render(<ScanBanner result={{ id: 1, kind: 'in', message: 'x' }} play={vi.fn()} onUndo={onUndo} />)
        await userEvent.click(screen.getByRole('button', { name: 'Scan zurücknehmen' }))
        expect(onUndo).toHaveBeenCalled()
    })

    it('invites the first scan when there is none yet', () => {
        render(<ScanBanner result={null} play={vi.fn()} />)
        expect(screen.getByText('Zettel vor die Kamera halten')).toBeInTheDocument()
    })
})
