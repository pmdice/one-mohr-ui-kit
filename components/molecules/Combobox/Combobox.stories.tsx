import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Combobox, type ComboboxOption } from './Combobox'
import { FormField } from '@/components/forms/FormField'

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

export const Static: Story = {
    render: () => {
        const [value, setValue] = useState<string | null>(null)
        return (
            <div className="w-72">
                <FormField label="Material" required>
                    <Combobox options={MATERIALS} value={value} onChange={setValue} />
                </FormField>
            </div>
        )
    },
}

const ARTICLES: ComboboxOption[] = Array.from({ length: 3000 }, (_, i) => ({
    value: `A-${10000 + i}`,
    label: `A-${10000 + i}`,
    description: `Gehäuse Variante ${i % 37}`,
}))

function searchArticles(query: string, signal: AbortSignal): Promise<ComboboxOption[]> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            const term = query.toLowerCase()
            resolve(ARTICLES.filter(a => a.label.toLowerCase().includes(term) || a.description!.toLowerCase().includes(term)).slice(0, 20))
        }, 300 + Math.random() * 300)
        signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('aborted', 'AbortError')) })
    })
}

/** Server search with debounce and loading state; 3000 articles, 300–600 ms latency. */
export const ServerSearch: Story = {
    render: () => {
        const [value, setValue] = useState<string | null>(null)
        return (
            <div className="w-72">
                <FormField label="Bestehender Artikel" required hint="Nummer oder Bezeichnung">
                    <Combobox loadOptions={searchArticles} value={value} onChange={setValue} valueLabel={value ?? undefined} />
                </FormField>
            </div>
        )
    },
}
