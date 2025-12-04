import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from './Navbar';
import { Home, Briefcase, FlaskConical, FileText } from 'lucide-react';

const meta: Meta<typeof Navbar> = {
    title: 'Organisms/Navbar',
    component: Navbar,
    parameters: {
        layout: 'fullscreen', // Navbar is fixed position, so it needs space
        nextjs: {
            appDirectory: true,
        },
    },
    tags: ['autodocs'],
    argTypes: {
        logo: { control: 'text' },
    },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

const demoItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Projects", icon: Briefcase, href: "/projects" },
    { label: "The Lab", icon: FlaskConical, href: "/lab" },
    { label: "Writing", icon: FileText, href: "https://substack.com", isExternal: true },
];

export const Default: Story = {
    args: {
        items: demoItems,
        logo: "OMUK.",
    },
    render: (args) => (
        <div className="min-h-[400px] w-full bg-slate-100 relative pt-20">
            <p className="text-center text-slate-400 text-sm pt-10">Click &#39;Menu&#39; to interact</p>
            {/* The Navbar is fixed, so it overlays this div */}
            <Navbar {...args} />
        </div>
    )
};