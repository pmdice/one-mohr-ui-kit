"use client"

import { Hero } from "@/components/organisms/Hero/Hero"
import { Button } from "@/components/atoms/Button/Button"
import { Badge } from "@/components/atoms/Badge/Badge"
import { FadeIn } from "@/components/atoms/FadeIn/FadeIn"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/molecules/Card/Card"
import { Accordion } from "@/components/molecules/Accordion/Accordion"
import { Tabs } from "@/components/molecules/Tabs/Tabs"
import { useToast } from "@/components/molecules/Toast/Toast"
import { SearchInput } from "@/components/molecules/SearchInput/SearchInput"
import { ArrowRight, Layers, Zap, Accessibility, Package } from "lucide-react"

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {children}
        </p>
    )
}

function Divider() {
    return <hr className="my-16 border-slate-100 dark:border-slate-800" />
}

const ACCORDION_ITEMS = [
    {
        id: "q1",
        title: "Why Framer Motion instead of CSS animations?",
        content: "Spring physics produce naturally-feeling motion that's impossible to replicate with CSS easing curves. Framer Motion also provides layout animations, AnimatePresence for exit transitions, and gesture hooks — all in a single, composable API.",
    },
    {
        id: "q2",
        title: "Is this accessible?",
        content: "Yes. Every component ships with proper ARIA attributes, keyboard navigation, and focus-visible states. The Storybook setup includes @storybook/addon-a11y so accessibility is verified in the component browser.",
    },
    {
        id: "q3",
        title: "How large is the bundle?",
        content: "The core library targets tree-shakeability — import only what you use. Framer Motion is the heaviest dependency at ~50KB gzipped, but it's peer-dep so your app only pays the cost once regardless of how many components you use.",
    },
    {
        id: "q4",
        title: "Can I publish this as @patrickmohr/ui?",
        content: "That's the plan. The next step is adding a proper build pipeline (tsup or unbuild) to compile to ESM + CJS with type declarations, then publishing to npm.",
    },
]

const TABS_ITEMS = [
    {
        id: "components",
        label: "Components",
        content: (
            <div className="grid gap-3 sm:grid-cols-2">
                {[
                    { name: "Button", status: "stable" as const },
                    { name: "Badge", status: "stable" as const },
                    { name: "Card", status: "stable" as const },
                    { name: "Accordion", status: "stable" as const },
                    { name: "Tabs", status: "stable" as const },
                    { name: "Toast", status: "stable" as const },
                    { name: "SearchInput", status: "stable" as const },
                    { name: "FadeIn", status: "stable" as const },
                    { name: "Navbar", status: "stable" as const },
                    { name: "Dialog", status: "planned" as const },
                    { name: "Select", status: "planned" as const },
                    { name: "Tooltip", status: "planned" as const },
                ].map(({ name, status }) => (
                    <div key={name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{name}</span>
                        <Badge variant={status === "stable" ? "success" : "secondary"}>
                            {status}
                        </Badge>
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: "principles",
        label: "Principles",
        content: (
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3"><span className="font-medium text-slate-900 dark:text-white w-28 shrink-0">Motion-first</span> Animations are not decorative — they carry meaning, confirm actions, and guide focus.</li>
                <li className="flex gap-3"><span className="font-medium text-slate-900 dark:text-white w-28 shrink-0">Accessible</span> WCAG AA as a baseline. Keyboard nav, ARIA, and focus management ship by default.</li>
                <li className="flex gap-3"><span className="font-medium text-slate-900 dark:text-white w-28 shrink-0">Composable</span> Atomic design. Combine primitives into larger patterns without reaching for custom CSS.</li>
                <li className="flex gap-3"><span className="font-medium text-slate-900 dark:text-white w-28 shrink-0">Type-safe</span> Strict TypeScript throughout. CVA for variant props. No <code>any</code>.</li>
            </ul>
        ),
    },
    {
        id: "stack",
        label: "Stack",
        content: (
            <div className="flex flex-wrap gap-2">
                {["React 19", "Next.js 16", "TypeScript 5", "Tailwind CSS v4", "Framer Motion 12", "Radix UI", "CVA", "Storybook 10", "Vitest 4"].map(tech => (
                    <Badge key={tech} variant="outline">{tech}</Badge>
                ))}
            </div>
        ),
    },
]

export default function Home() {
    const { toast } = useToast()

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 md:px-16 md:py-16">
            <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-slate-700/50">
                <div className="p-6 md:p-12">

                    {/* Header tag */}
                    <div className="mb-8 border-b border-slate-100 pb-4 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            One Mohr UI Kit · Animated component library · In active development
                        </p>
                    </div>

                    {/* Hero */}
                    <Hero
                        title="One Mohr UI Kit"
                        subtitle="An animated, accessible React component library. Motion-first components that feel alive — built with Framer Motion, Tailwind CSS v4, and TypeScript strict mode."
                    />

                    <Divider />

                    {/* Why section */}
                    <FadeIn>
                        <SectionLabel>Why this library</SectionLabel>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: Zap, title: "Motion-first", desc: "Spring animations by default. Every interaction has physics." },
                                { icon: Accessibility, title: "Accessible", desc: "WCAG AA baseline. Keyboard navigation included." },
                                { icon: Layers, title: "Composable", desc: "Atomic design. Build complex UIs from simple primitives." },
                                { icon: Package, title: "Publishable", desc: "Headed to npm as @patrickmohr/ui with full type declarations." },
                            ].map(({ icon: Icon, title, desc }) => (
                                <Card key={title} interactive className="cursor-default">
                                    <Icon className="mb-3 h-5 w-5 text-blue-500" />
                                    <CardTitle className="text-base">{title}</CardTitle>
                                    <CardDescription>{desc}</CardDescription>
                                </Card>
                            ))}
                        </div>
                    </FadeIn>

                    <Divider />

                    {/* Buttons */}
                    <FadeIn>
                        <SectionLabel>Buttons</SectionLabel>
                        <div className="flex flex-wrap gap-3">
                            <Button>Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="link">Link</Button>
                            <Button disabled>Disabled</Button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3">
                            <Button size="sm">Small</Button>
                            <Button size="default">Default</Button>
                            <Button size="lg">Large</Button>
                            <Button size="lg">
                                Get started <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </FadeIn>

                    <Divider />

                    {/* Badges */}
                    <FadeIn>
                        <SectionLabel>Badges</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="default">New</Badge>
                            <Badge variant="success">Published</Badge>
                            <Badge variant="warning">Beta</Badge>
                            <Badge variant="destructive">Deprecated</Badge>
                            <Badge variant="outline">v2.0.0</Badge>
                            <Badge variant="secondary">Draft</Badge>
                        </div>
                    </FadeIn>

                    <Divider />

                    {/* Cards */}
                    <FadeIn>
                        <SectionLabel>Cards — hover to animate</SectionLabel>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { title: "Design tokens", desc: "CVA variants and Tailwind v4 custom properties for a consistent visual language.", badge: "stable" as const },
                                { title: "Motion system", desc: "Framer Motion spring animations with sensible defaults. Override per-component.", badge: "stable" as const },
                                { title: "Dark mode", desc: "next-themes integration. System preference or manual toggle, no flash.", badge: "stable" as const },
                            ].map(({ title, desc, badge }) => (
                                <Card key={title} interactive className="cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-base">{title}</CardTitle>
                                            <Badge variant="success">{badge}</Badge>
                                        </div>
                                        <CardDescription>{desc}</CardDescription>
                                    </CardHeader>
                                    <CardFooter>
                                        <Button variant="ghost" size="sm" className="px-0 text-blue-600">
                                            Explore <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </FadeIn>

                    <Divider />

                    {/* Tabs */}
                    <FadeIn>
                        <SectionLabel>Tabs — sliding spring indicator</SectionLabel>
                        <Tabs tabs={TABS_ITEMS} />
                    </FadeIn>

                    <Divider />

                    {/* Search */}
                    <FadeIn>
                        <SectionLabel>Search input</SectionLabel>
                        <SearchInput
                            placeholder="Search components..."
                            onSearch={(term) =>
                                toast({
                                    title: `Searching for "${term}"`,
                                    description: "Results would appear below.",
                                    variant: "info",
                                })
                            }
                        />
                    </FadeIn>

                    <Divider />

                    {/* Toast */}
                    <FadeIn>
                        <SectionLabel>Toast notifications</SectionLabel>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" onClick={() => toast({ title: "Changes saved", description: "Your work has been saved.", variant: "success" })}>
                                Success toast
                            </Button>
                            <Button variant="outline" onClick={() => toast({ title: "Something went wrong", description: "Please try again.", variant: "error" })}>
                                Error toast
                            </Button>
                            <Button variant="outline" onClick={() => toast({ title: "Heads up", description: "A new version is available.", variant: "info" })}>
                                Info toast
                            </Button>
                            <Button variant="outline" onClick={() => toast({ title: "Session expiring", description: "You'll be signed out in 5 minutes.", variant: "warning" })}>
                                Warning toast
                            </Button>
                        </div>
                    </FadeIn>

                    <Divider />

                    {/* Accordion */}
                    <FadeIn>
                        <SectionLabel>Accordion — animated expand / collapse</SectionLabel>
                        <Accordion items={ACCORDION_ITEMS} />
                    </FadeIn>

                    {/* Footer */}
                    <div className="mt-16 border-t border-slate-100 pt-8 dark:border-slate-800">
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                            One Mohr UI Kit · Built with React 19, Next.js 16, Framer Motion, Tailwind CSS v4
                        </p>
                    </div>

                </div>
            </div>
        </main>
    )
}
