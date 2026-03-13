import type { Preview, Decorator } from '@storybook/nextjs-vite'
import React from 'react'
import { ThemeProvider } from '../components/providers/theme-provider'
import '../app/globals.css'

const withTheme: Decorator = (Story, context) => {
    const theme = (context.globals.theme as string) ?? 'light'

    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    return React.createElement(
        ThemeProvider as React.ComponentType<any>,
        { attribute: 'class', forcedTheme: theme, enableSystem: false, disableTransitionOnChange: true },
        React.createElement(Story as React.ElementType)
    )
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
    },
    decorators: [withTheme],
    parameters: {
        backgrounds: { disable: true },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
}

export default preview
