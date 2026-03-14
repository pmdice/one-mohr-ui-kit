import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Button } from '@/components/atoms/Button/Button'
import { Info } from 'lucide-react'

const meta: Meta<typeof Tooltip> = {
    title: 'Atoms/Tooltip',
    component: Tooltip,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        side: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    },
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
    render: () => (
        <Tooltip content="This is a tooltip">
            <Button variant="outline">Hover me</Button>
        </Tooltip>
    ),
}

export const AllSides: Story = {
    render: () => (
        <div className="grid grid-cols-2 gap-8 p-16">
            {(['top', 'bottom', 'left', 'right'] as const).map(side => (
                <Tooltip key={side} content={`Tooltip on ${side}`} side={side}>
                    <Button variant="outline" size="sm">{side}</Button>
                </Tooltip>
            ))}
        </div>
    ),
}

export const OnIcon: Story = {
    render: () => (
        <Tooltip content="More information about this field" side="right">
            <button aria-label="Info" className="text-slate-400 hover:text-slate-600 transition-colors">
                <Info className="h-4 w-4" />
            </button>
        </Tooltip>
    ),
}
