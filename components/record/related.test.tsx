import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { RelatedList } from './RelatedList'
import { AttachmentGallery } from './AttachmentGallery'

describe('RelatedList', () => {
    it('names the count in the title and links to all when there are more than five', () => {
        render(
            <RelatedList title="Laufzettel" count={12} moreHref="/laufzettel?auftrag=26100013" emptyText="Noch keine Laufzettel">
                <li>26100013-1</li><li>26100013-2</li>
            </RelatedList>
        )
        expect(screen.getByRole('heading', { name: 'Laufzettel 12' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Alle 12 anzeigen' })).toHaveAttribute('href', '/laufzettel?auftrag=26100013')
    })

    it('has no "all" link when everything is shown', () => {
        render(<RelatedList title="Positionen" count={3} moreHref="/x" emptyText="Keine"><li>1</li><li>2</li><li>3</li></RelatedList>)
        expect(screen.queryByRole('link')).toBeNull()
    })

    it('empty says so and offers the action', async () => {
        const onAction = vi.fn()
        render(<RelatedList title="Laufzettel" count={0} emptyText="Noch keine Laufzettel" emptyAction={{ label: 'Laufzettel drucken', onClick: onAction }} />)
        expect(screen.getByText('Noch keine Laufzettel')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Laufzettel drucken' }))
        expect(onAction).toHaveBeenCalled()
    })
})

const PICS = [
    { id: 'a', name: 'Ring vorne.jpg', src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' },
    { id: 'b', name: 'Ring seitlich.jpg', src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' },
    { id: 'c', name: 'Gussbaum.jpg', src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' },
]

describe('AttachmentGallery', () => {
    it('opens a picture large and pages with the arrow keys, stopping at the ends', async () => {
        render(<AttachmentGallery title="Fotos" items={PICS} />)
        await userEvent.click(screen.getByRole('button', { name: 'Ring seitlich.jpg gross anzeigen' }))
        const dialog = screen.getByRole('dialog', { name: 'Ring seitlich.jpg' })
        expect(within(dialog).getByText('Bild 2 von 3')).toBeInTheDocument()
        await userEvent.keyboard('{ArrowRight}')
        expect(screen.getByRole('dialog', { name: 'Gussbaum.jpg' })).toBeInTheDocument()
        await userEvent.keyboard('{ArrowRight}')
        expect(screen.getByRole('dialog', { name: 'Gussbaum.jpg' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Nächstes Bild' })).toBeDisabled()
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
        expect(screen.getByRole('dialog', { name: 'Ring vorne.jpg' })).toBeInTheDocument()
    })

    it('Escape closes and focus returns to the picture', async () => {
        render(<AttachmentGallery title="Fotos" items={PICS} />)
        const thumb = screen.getByRole('button', { name: 'Ring vorne.jpg gross anzeigen' })
        await userEvent.click(thumb)
        await userEvent.keyboard('{Escape}')
        expect(screen.queryByRole('dialog')).toBeNull()
        expect(thumb).toHaveFocus()
    })
})
