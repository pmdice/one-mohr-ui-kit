export interface Rule {
    id: string
    title: string
    summary: string
    /** Storybook docs id of the rule page */
    docsId: string
}

export interface RuleGroup {
    title: string
    description: string
    rules: Rule[]
}
