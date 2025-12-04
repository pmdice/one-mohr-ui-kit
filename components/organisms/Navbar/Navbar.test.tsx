import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from './Navbar'
import { Home, Briefcase, FlaskConical, FileText } from 'lucide-react'
import { describe, it, expect, vi } from 'vitest'

// Mock usePathname since it's used in the component
vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}))

const mockItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Projects", icon: Briefcase, href: "/projects" },
    { label: "Lab", icon: FlaskConical, href: "/lab" },
    { label: "Writing", icon: FileText, href: "https://example.com", isExternal: true },
]

describe('Navbar', () => {
    it('renders the logo correctly', () => {
        render(<Navbar items={mockItems} logo="TestBrand." />)
        expect(screen.getByText('TestBrand.')).toBeInTheDocument()
    })

    it('renders the contact link', () => {
        render(<Navbar items={mockItems} />)
        expect(screen.getByText('Contact')).toBeInTheDocument()
        expect(screen.getByText('Contact').closest('a')).toHaveAttribute('href', '/contact')
    })

    it('toggles the menu when clicking the menu button', () => {
        render(<Navbar items={mockItems} />)

        // Initial state: Menu content should NOT be visible
        // Note: Framer Motion might keep it in DOM with opacity 0, but usually AnimatePresence removes it.
        // We check for the button first.
        const toggleButton = screen.getByRole('button', { name: /menu/i })

        // Open Menu
        fireEvent.click(toggleButton)

        // Now items should be visible
        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('Projects')).toBeInTheDocument()

        // Check if the button text changed to "Close"
        expect(screen.getByText('Close')).toBeInTheDocument()

        // Close Menu
        fireEvent.click(toggleButton)

        // Wait for removal
    })

    it('renders external links with correct attributes', () => {
        render(<Navbar items={mockItems} />)

        // Open menu to access links
        const toggleButton = screen.getByRole('button', { name: /menu/i })
        fireEvent.click(toggleButton)

        const externalLink = screen.getByText('Writing').closest('a')
        expect(externalLink).toHaveAttribute('href', 'https://example.com')
        expect(externalLink).toHaveAttribute('target', '_blank')
    })
})