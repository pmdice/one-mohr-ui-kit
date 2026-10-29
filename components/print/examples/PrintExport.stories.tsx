import type { Meta, StoryObj } from '@storybook/react'
import { PrintExport } from './PrintExport'

const meta: Meta<typeof PrintExport> = {
    title: 'Druck/Beispiel: Druck & Export',
    component: PrintExport,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof PrintExport>

/** Station wählen, dann exportieren (CSV für Excel) oder die Laufzettel in der Vorschau ansehen und drucken. */
export const Standard: Story = { args: { today: '2026-10-29' } }
