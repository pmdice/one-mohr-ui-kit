import type { Meta, StoryObj } from '@storybook/react'
import { Accordion } from './Accordion'

const ITEMS = [
    {
        id: 'a1',
        title: 'What is One Mohr UI Kit?',
        content: 'A production-ready React component library focused on animation, accessibility, and composability. Built with Framer Motion, Tailwind CSS v4, and TypeScript strict mode.',
    },
    {
        id: 'a2',
        title: 'Can I use it with Next.js?',
        content: 'Yes. The library is designed as a first-class Next.js companion. All components are either server-safe or explicitly marked as client components.',
    },
    {
        id: 'a3',
        title: 'How does the animation system work?',
        content: 'Every animated component uses Framer Motion under the hood. Spring physics are used by default for natural-feeling motion that respects reduced-motion preferences.',
    },
]

const meta: Meta<typeof Accordion> = {
    title: 'Molecules/Accordion',
    component: Accordion,
    parameters: { layout: 'padded' },
    tags: ['autodocs'],
    argTypes: {
        allowMultiple: { control: 'boolean' },
    },
}

export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
    args: { items: ITEMS, allowMultiple: false },
    render: (args) => <div className="w-[480px]"><Accordion {...args} /></div>,
}

export const AllowMultiple: Story = {
    args: { items: ITEMS, allowMultiple: true },
    render: (args) => <div className="w-[480px]"><Accordion {...args} /></div>,
}
