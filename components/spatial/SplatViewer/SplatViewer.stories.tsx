import type { Meta, StoryObj } from '@storybook/react';
import { SplatViewer } from './SplatViewer';

const meta: Meta<typeof SplatViewer> = {
    title: 'Spatial/SplatViewer',
    component: SplatViewer,
    parameters: {
        layout: 'fullscreen',
        nextjs: {
            appDirectory: true,
        },
        docs: {
            inlineStories: false, // render in an iframe to avoid Docs layout/zoom affecting canvas sizing
            story: { height: '520px' },
            description: {
                component:
                    'A basic Gaussian Splat viewer built with React Three Fiber and Spark. Use the controls to orbit and zoom.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        url: {
            control: 'text',
            description: 'URL to a .splat / .ply / supported splat file',
        },
    },
};

export default meta;
type Story = StoryObj<typeof SplatViewer>;

export const Default: Story = {
    args: {
        url: '/models/example.spz',
    },
    render: (args) => (
        <div className="h-[520px] w-full">
            <SplatViewer {...args} />
        </div>
    ),
};
