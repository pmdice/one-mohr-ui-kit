import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Select } from './Select'

const MATERIALS = [
    { value: 'au750', label: 'Gelbgold 750' },
    { value: 'wg750', label: 'Weissgold 750' },
    { value: 'ag925', label: 'Silber 925' },
    { value: 'pt950', label: 'Platin 950' },
    { value: 'inox', label: 'INOX' },
]

function Controlled({ initial = '' }: { initial?: string }) {
    const [value, setValue] = useState(initial)
    return (
        <div className="w-64">
            <Select options={MATERIALS} value={value} onChange={setValue} placeholder="Material wählen" />
        </div>
    )
}

const meta: Meta<typeof Select> = {
    title: 'Molecules/Select',
    component: Select,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = { render: () => <Controlled /> }

export const WithDefault: Story = { render: () => <Controlled initial="au750" /> }

export const Disabled: Story = {
    render: () => (
        <div className="w-64">
            <Select options={MATERIALS} disabled placeholder="Material wählen" />
        </div>
    ),
}
