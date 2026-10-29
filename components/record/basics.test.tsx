import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { formatDue } from './due'
import { CopyButton } from './CopyButton'
import { KeyFacts } from './KeyFacts'
import { EmptyValue, Property, PropertyList } from './PropertyList'
import { RecordMeta } from './RecordMeta'

describe('formatDue', () => {
    const today = '2026-10-29'
    it.each([
        ['2026-10-29', 'heute', false],
        ['2026-10-30', 'morgen', false],
        ['2026-11-03', 'in 5 Tagen', false],
        ['2026-10-28', 'seit gestern überfällig', true],
        ['2026-10-27', 'seit 2 Tagen überfällig', true],
    ])('%s is "%s"', (iso, relative, overdue) => {
        expect(formatDue(iso, today)).toMatchObject({ relative, overdue })
    })

    it('always gives the absolute date with weekday', () => {
        expect(formatDue('2026-11-13', today).absolute).toBe('Fr, 13.11.2026')
    })

    it('past dates can be neutral (a delivery that happened)', () => {
        expect(formatDue('2026-10-27', today, { past: 'neutral' })).toMatchObject({ relative: 'vor 2 Tagen', overdue: false })
        expect(formatDue('2026-10-28', today, { past: 'neutral' })).toMatchObject({ relative: 'gestern', overdue: false })
    })
})

describe('CopyButton', () => {
    afterEach(() => { vi.useRealTimers() })

    it('copies and says so for two seconds', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined)
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
        vi.useFakeTimers({ shouldAdvanceTime: true })
        render(<CopyButton value="26100013" label="Auftragsnummer" />)
        await userEvent.click(screen.getByRole('button', { name: 'Auftragsnummer kopieren' }))
        expect(writeText).toHaveBeenCalledWith('26100013')
        expect(screen.getByRole('status')).toHaveTextContent('Kopiert')
        await act(async () => { vi.advanceTimersByTime(2100) })
        expect(screen.getByRole('status')).toHaveTextContent('')
    })

    it('without the clipboard it says how to copy by hand', async () => {
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
        render(<CopyButton value="26100013" label="Auftragsnummer" />)
        await userEvent.click(screen.getByRole('button', { name: 'Auftragsnummer kopieren' }))
        expect(screen.getByRole('status')).toHaveTextContent('Mit Ctrl+C kopieren')
    })

    it('when the browser refuses it says so as well', async () => {
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('no')) }, configurable: true })
        render(<CopyButton value="26100013" label="Auftragsnummer" />)
        await userEvent.click(screen.getByRole('button', { name: 'Auftragsnummer kopieren' }))
        expect(await screen.findByText('Mit Ctrl+C kopieren')).toBeInTheDocument()
    })
})

describe('KeyFacts', () => {
    it('is a list of label and value with a word of context, warning on the value only', () => {
        render(<KeyFacts facts={[{ label: 'Liefertermin', value: 'Fr, 13.11.2026', detail: 'in 15 Tagen' }, { label: 'Fortschritt', value: '1 von 4', detail: 'Positionen fertig', tone: 'warning' }]} />)
        expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Liefertermin', 'Fortschritt'])
        expect(screen.getByText('1 von 4')).toHaveAttribute('data-tone', 'warning')
        expect(screen.getByText('in 15 Tagen')).toBeInTheDocument()
    })
})

describe('PropertyList', () => {
    it('pairs labels and values; an empty value says what is missing and offers to add', async () => {
        const onAdd = vi.fn()
        render(
            <PropertyList label="Eigenschaften">
                <Property label="Kunde">Dähler + Blaser</Property>
                <Property label="Liefertermin"><EmptyValue text="Kein Liefertermin" onAdd={onAdd} /></Property>
            </PropertyList>
        )
        expect(screen.getByRole('region', { name: 'Eigenschaften' })).toBeInTheDocument()
        expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Kunde', 'Liefertermin'])
        expect(screen.getAllByRole('definition')[0]).toHaveTextContent('Dähler + Blaser')
        expect(screen.getByText('Kein Liefertermin')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Liefertermin hinzufügen' }))
        expect(onAdd).toHaveBeenCalled()
    })
})

describe('RecordMeta', () => {
    it('says who and when, links to the history and lets the id be copied', () => {
        const now = Date.UTC(2026, 9, 29, 12)
        render(<RecordMeta now={now} created={{ by: 'P. Mohr', at: now - 3 * 86_400_000 }} updated={{ by: 'S. Keller', at: now - 5 * 60_000 }} id="8812" historyHref="#verlauf" />)
        expect(screen.getByText(/Angelegt von P\. Mohr/)).toBeInTheDocument()
        expect(screen.getByText(/Geändert von S\. Keller · vor 5 min/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Ganzer Verlauf' })).toHaveAttribute('href', '#verlauf')
        expect(screen.getByRole('button', { name: 'Interne ID kopieren' })).toBeInTheDocument()
    })
})
