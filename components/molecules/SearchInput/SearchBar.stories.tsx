import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from '@storybook/test';
import { SearchInput } from './SearchInput';

/**
 * A molecule that combines an input field with a search button.
 * * **Atomic Design Level:** Molecule
 * **Usage:** Used in Headers, Hero sections, and Data Tables.
 */
const meta: Meta<typeof SearchInput> = {
    title: 'Molecules/SearchInput',
    component: SearchInput,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'Standard search component with integrated submit button. Supports accessible keyboard navigation (Enter key).'
            }
        }
    },
    tags: ['autodocs'],
    argTypes: {
        placeholder: {
            control: 'text',
            description: 'Placeholder text prompt',
            table: { category: 'Content' }
        },
        className: {
            control: false,
            description: 'Internal utility for styling overrides',
            table: { disable: true }
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the input and button interactions',
            table: { category: 'State' }
        },
        onSearch: {
            description: 'Callback fired when button is clicked or Enter is pressed',
            table: { category: 'Events' }
        }
    },
    args: {
        onSearch: fn(),
    },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
    args: {
        placeholder: 'Search...',
    },
};

/**
 * Demonstrates the interactive flow: Typing + Clicking Search.
 * Look at the "Interactions" tab in Storybook to see this test pass automatically.
 */
export const InteractiveTest: Story = {
    args: {
        placeholder: 'Try typing here...',
    },
    play: async ({ canvasElement, args }) => {
        // 1. Setup the canvas scope
        const canvas = within(canvasElement);

        // 2. Simulate User Typing
        const input = canvas.getByPlaceholderText('Try typing here...');
        await userEvent.type(input, 'Next.js 14', { delay: 100 });

        // 3. Simulate Click
        const button = canvas.getByRole('button', { name: /search/i });
        await userEvent.click(button);

        // 4. Assert (The Test)
        // Verifies the onSearch mock was called with the exact text typed
        await expect(args.onSearch).toHaveBeenCalledWith('Next.js 14');
    }
};

export const CustomPlaceholder: Story = {
    args: {
        placeholder: 'Filter users by ID...',
    },
};

export const WithPredefinedTerm: Story = {
    render: (args) => (
        <div className="w-[400px] border p-6 rounded-xl border-dashed border-slate-300 bg-slate-50">
            <p className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">Sidebar Context</p>
            <SearchInput {...args} />
        </div>
    ),
    args: {
        placeholder: 'Search within container...',
    },
};

export const DisabledState: Story = {
    args: {
        placeholder: 'Cannot search right now...',
        disabled: true,
    },
};