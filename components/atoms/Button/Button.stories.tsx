import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from '@storybook/test';
import { Button } from './Button';
import { Search } from 'lucide-react';

/**
 * The primary interactive element for user actions.
 * * * **Polymorphic:** Can be rendered as a `button` or `a` (link) tag using `asChild`.
 * * **Accessibility:** Fully keyboard accessible with focus-visible states.
 */
const meta: Meta<typeof Button> = {
    title: 'Atoms/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A robust, polymorphic button component that enforces Design System tokens.'
            }
        }
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
            description: 'Visual style variant',
            table: { category: 'Appearance' }
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon'],
            description: 'Button size dimensions',
            table: { category: 'Appearance' }
        },
        asChild: {
            control: false,
            description: 'Render as child element (for polymorphism)',
            table: { category: 'Logic' }
        },
        onClick: {
            table: { category: 'Events' }
        }
    },
    args: {
        onClick: fn(),
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    args: {
        variant: 'default',
        children: 'Default Button',
    },
};

/**
 * Demonstrates the interactive states (Hover, Focus, Click).
 * Check the "Interactions" tab to see the automated test.
 */
export const Interactive: Story = {
    args: {
        variant: 'secondary',
        children: 'Click Me',
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button', { name: /click me/i });

        // Simulate User Interaction
        await userEvent.hover(button);
        await userEvent.click(button);

        // Assert
        await expect(args.onClick).toHaveBeenCalled();
    }
};

/**
 * Demonstrates composition with Icons.
 * Icons should typically be sized to 16px (w-4 h-4) and have margin.
 */
export const WithIcon: Story = {
    args: {
        variant: 'default',
        children: (
            <>
                <Search className="mr-2 h-4 w-4" />
                Search Now
            </>
        ),
    },
};

/**
 * A circular button optimized for icons only.
 */
export const IconOnly: Story = {
    args: {
        variant: 'outline',
        size: 'icon',
        children: <Search className="h-4 w-4" />,
        'aria-label': 'Search',
    },
};

/**
 * Demonstrates Polymorphism using `asChild`.
 * This renders an `<a>` tag but LOOKS like a button.
 */
export const AsLink: Story = {
    args: {
        asChild: true,
        variant: 'default',
        children: <a href="https://google.com" target="_blank" rel="noreferrer">Go to Google</a>,
    },
};

export const Destructive: Story = {
    args: {
        variant: 'destructive',
        children: 'Delete Account',
    },
};

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost Action',
    },
};