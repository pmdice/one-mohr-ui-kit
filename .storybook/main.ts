import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
    "stories": [
        "../handbook/**/*.mdx",
        "../components/**/*.mdx",
        "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
    ],
    "addons": [
        "@chromatic-com/storybook",
        "@storybook/addon-a11y",
        "@storybook/addon-docs"
    ],
    "framework": "@storybook/nextjs-vite",
    "staticDirs": []
};
export default config;