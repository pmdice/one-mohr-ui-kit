import type { Preview, Decorator } from '@storybook/nextjs-vite'
import React from 'react'
import { ThemeProvider } from '../components/providers/theme-provider'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './fonts.css'
import '../app/globals.css'

/** Keeps the html class in step with the toolbar, so tokens under `.dark` apply to portals too. */
function ThemeFrame({ theme, children }: { theme: string; children: React.ReactNode }) {
    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])
    return React.createElement(
        ThemeProvider,
        { attribute: 'class', forcedTheme: theme, enableSystem: false, disableTransitionOnChange: true },
        children
    )
}

const withTheme: Decorator = (Story, context) =>
    React.createElement(ThemeFrame, { theme: (context.globals.theme as string) ?? 'light' }, React.createElement(Story as React.ElementType))

const withDensity: Decorator = (Story, context) => {
    const density = (context.globals.density as string) ?? 'compact'
    return React.createElement('div', { 'data-density': density }, React.createElement(Story as React.ElementType))
}

const preview: Preview = {
    globalTypes: {
        theme: {
            description: 'Color theme',
            defaultValue: 'light',
            toolbar: {
                title: 'Theme',
                icon: 'circlehollow',
                items: [
                    { value: 'light', icon: 'sun', title: 'Light' },
                    { value: 'dark', icon: 'moon', title: 'Dark' },
                ],
                dynamicTitle: true,
            },
        },
        density: {
            description: 'Density',
            defaultValue: 'compact',
            toolbar: {
                title: 'Density',
                icon: 'component',
                items: [
                    { value: 'compact', title: 'Compact (desk)' },
                    { value: 'comfortable', title: 'Comfortable (shop floor)' },
                ],
                dynamicTitle: true,
            },
        },
    },
    decorators: [withDensity, withTheme],
    parameters: {
        backgrounds: { disable: true },
        options: {
            storySort: {
                order: [
                    'Handbuch', ['Einleitung', 'Grundlagen', ['Übersicht', 'Tokens'], 'Komponenten', 'Formulare', 'Navigation', 'Listen', 'Status', 'Werkstatt'],
                    'Formulare', 'Navigation', 'Listen', 'Status', 'Werkstatt',
                ],
            },
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
}

export default preview
