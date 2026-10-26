import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Combobox, type ComboboxOption } from './Combobox'
import { FormField } from '@/components/forms/FormField'
import { searchArticles } from '@/components/forms/examples/mockArticles'

const meta: Meta = {
    title: 'Molecules/Combobox',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

const MATERIALS: ComboboxOption[] = [
    { value: 'alsi10mg', label: 'AlSi10Mg', description: 'Aluminium-Gusslegierung' },
    { value: 'alsi7mg', label: 'AlSi7Mg', description: 'Aluminium-Gusslegierung' },
    { value: 'cusn12', label: 'CuSn12', description: 'Zinnbronze' },
    { value: 'gjl250', label: 'EN-GJL-250', description: 'Grauguss' },
    { value: 'gjs400', label: 'EN-GJS-400', description: 'Sphäroguss' },
]

function StaticDemo() {
    const [value, setValue] = useState<string | null>(null)
    return (
        <div className="w-72">
            <FormField label="Material" required>
                <Combobox options={MATERIALS} value={value} onChange={setValue} />
            </FormField>
        </div>
    )
}

export const Static: Story = { render: () => <StaticDemo /> }

/** Server search with debounce and loading state; 3000 articles, 300–600 ms latency. */
function ServerSearchDemo() {
    const [value, setValue] = useState<string | null>(null)
    return (
        <div className="w-72">
            <FormField label="Bestehender Artikel" required hint="Nummer oder Bezeichnung">
                <Combobox loadOptions={searchArticles} value={value} onChange={setValue} valueLabel={value ?? undefined} />
            </FormField>
        </div>
    )
}

export const ServerSearch: Story = { render: () => <ServerSearchDemo /> }
