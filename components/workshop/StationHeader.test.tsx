import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { StationHeader, StationPicker } from './StationHeader'

describe('StationHeader', () => {
    it('shows the station big, the waiting scans and the sound switch', async () => {
        const onSoundChange = vi.fn()
        render(<StationHeader station="Guss" waiting={2} online={false} sound onSoundChange={onSoundChange} onChangeStation={vi.fn()} />)
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Station Guss')
        expect(screen.getByText('2 Scans warten auf Verbindung')).toBeInTheDocument()
        expect(screen.getByText('Keine Verbindung')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Ton' }))
        expect(onSoundChange).toHaveBeenCalledWith(false)
    })

    it('lists rejected scans with their reason apart from the waiting ones', async () => {
        const onDismiss = vi.fn()
        render(<StationHeader station="Guss" waiting={0} online sound onSoundChange={vi.fn()} onChangeStation={vi.fn()}
            rejected={[{ id: 'r1', code: '26100013-2/4', reason: '26100013 – 2/4 ist fertig' }]} onDismissRejected={onDismiss} />)
        expect(screen.queryByText(/warten auf Verbindung/)).toBeNull()
        const region = screen.getByRole('region', { name: 'Abgelehnte Scans' })
        expect(region).toHaveTextContent('26100013-2/4')
        expect(region).toHaveTextContent('26100013 – 2/4 ist fertig. Zettel ins Büro bringen.')
        await userEvent.click(screen.getByRole('button', { name: '26100013-2/4 aus der Liste nehmen' }))
        expect(onDismiss).toHaveBeenCalledWith('r1')
    })

    it('picks a station with big buttons', async () => {
        const onPick = vi.fn()
        render(<StationPicker stations={[{ id: 'guss', label: 'Guss' }, { id: '3d', label: '3D' }]} onPick={onPick} />)
        await userEvent.click(screen.getByRole('button', { name: '3D' }))
        expect(onPick).toHaveBeenCalledWith('3d')
    })
})
