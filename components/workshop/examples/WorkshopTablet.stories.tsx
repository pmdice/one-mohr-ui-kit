import type { Meta, StoryObj } from '@storybook/react'
import { WorkshopTablet } from './WorkshopTablet'

const meta: Meta<typeof WorkshopTablet> = {
    title: 'Werkstatt/Beispiel: Tablet an der Station',
    component: WorkshopTablet,
    parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'tablet' } },
}
export default meta
type Story = StoryObj<typeof WorkshopTablet>

/** Station Guss. Tippe einen Zettel an, um ihn vor die Kamera zu halten; ein zweites Mal (nach 3 s) scannt ihn aus. */
export const Standard: Story = { args: { initial: 'default' } }

/** Neues Tablet: zuerst die Station wählen. */
export const ErsteEinrichtung: Story = { name: 'Erste Einrichtung', args: { initial: 'setup' } }

/** Kamera verweigert: ein Satz, wie man sie erlaubt; die Eingabe trägt die Arbeit. */
export const KameraVerweigert: Story = { name: 'Kamera verweigert', args: { initial: 'denied' } }

/** WLAN weg: drei Scans warten. Verbindung einschalten sendet sie. */
export const OhneVerbindung: Story = { name: 'Ohne Verbindung', args: { initial: 'offline' } }
