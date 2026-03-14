import type { Meta, StoryObj } from '@storybook/react'
import { Tabs } from './Tabs'

const TABS = [
    { id: 'overview', label: 'Overview', content: <p className="text-sm text-slate-600 dark:text-slate-400">Overview content: high-level summary of the component's purpose and capabilities.</p> },
    { id: 'usage',    label: 'Usage',    content: <p className="text-sm text-slate-600 dark:text-slate-400">Usage content: import the component and pass a <code>tabs</code> array of <code>{"{ id, label, content }"}</code>.</p> },
    { id: 'api',      label: 'API',      content: <p className="text-sm text-slate-600 dark:text-slate-400">API content: <code>tabs</code>, <code>defaultTab</code>, <code>className</code> props available.</p> },
]

const meta: Meta<typeof Tabs> = {
    title: 'Molecules/Tabs',
    component: Tabs,
    parameters: { layout: 'padded' },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
    render: () => <div className="w-[480px]"><Tabs tabs={TABS} /></div>,
}

export const FourTabs: Story = {
    render: () => (
        <div className="w-[560px]">
            <Tabs tabs={[
                ...TABS,
                { id: 'changelog', label: 'Changelog', content: <p className="text-sm text-slate-600 dark:text-slate-400">v1.0.0 – Initial release with spring-based sliding indicator.</p> },
            ]} />
        </div>
    ),
}
