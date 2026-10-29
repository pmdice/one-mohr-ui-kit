import type { Meta, StoryObj } from '@storybook/react'
import { OrderRecord } from './OrderRecord'

const meta: Meta<typeof OrderRecord> = {
    title: 'Datensatz/Beispiel: Auftrag',
    component: OrderRecord,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof OrderRecord>

/** Ein Auftrag mit allen Regeln D-01–D-10. Werte anklicken zum Ändern; oben lässt sich das Speichern scheitern lassen. */
export const Standard: Story = {}
