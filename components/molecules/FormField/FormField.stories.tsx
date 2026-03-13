import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FormField } from './FormField'
import { Input } from '@/components/atoms/Input/Input'
import { Textarea } from '@/components/atoms/Textarea/Textarea'
import { Select } from '@/components/molecules/Select/Select'
import { Button } from '@/components/atoms/Button/Button'

const meta: Meta = {
    title: 'Molecules/FormField',
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj

export const Default: Story = {
    render: () => (
        <div className="w-80 space-y-4">
            <FormField label="Email" htmlFor="email" hint="We'll never share your email.">
                <Input id="email" type="email" placeholder="you@example.com" />
            </FormField>
            <FormField label="Password" htmlFor="password" required>
                <Input id="password" type="password" placeholder="••••••••" />
            </FormField>
            <Button className="w-full">Sign in</Button>
        </div>
    ),
}

export const WithErrors: Story = {
    render: () => (
        <div className="w-80 space-y-4">
            <FormField label="Email" htmlFor="email-err" error="Please enter a valid email address.">
                <Input id="email-err" type="email" placeholder="you@example.com" error defaultValue="not-an-email" />
            </FormField>
            <FormField label="Message" htmlFor="message-err" error="Message must be at least 20 characters.">
                <Textarea id="message-err" placeholder="Your message..." error defaultValue="too short" />
            </FormField>
        </div>
    ),
}

export const CompleteContactForm: Story = {
    render: () => {
        const [role, setRole] = useState('')
        return (
            <div className="w-96 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Contact us</h3>
                <div className="grid grid-cols-2 gap-3">
                    <FormField label="First name" htmlFor="first" required>
                        <Input id="first" placeholder="Jane" />
                    </FormField>
                    <FormField label="Last name" htmlFor="last" required>
                        <Input id="last" placeholder="Smith" />
                    </FormField>
                </div>
                <FormField label="Email" htmlFor="contact-email" required>
                    <Input id="contact-email" type="email" placeholder="jane@company.com" />
                </FormField>
                <FormField label="Role" htmlFor="role">
                    <Select
                        options={[
                            { value: 'eng', label: 'Engineering' },
                            { value: 'design', label: 'Design' },
                            { value: 'pm', label: 'Product' },
                            { value: 'other', label: 'Other' },
                        ]}
                        value={role}
                        onChange={setRole}
                        placeholder="Select your role"
                    />
                </FormField>
                <FormField label="Message" htmlFor="contact-msg" hint="Tell us how we can help.">
                    <Textarea id="contact-msg" placeholder="Your message..." />
                </FormField>
                <Button className="w-full">Send message</Button>
            </div>
        )
    },
}
