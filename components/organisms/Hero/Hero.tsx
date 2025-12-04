"use client"

import * as React from "react"
import { Button } from "@/components/atoms/Button/Button"
import { SearchInput } from "@/components/molecules/SearchInput/SearchInput"
import { ThemeToggle } from "@/components/atoms/ThemeToggle/ThemeToggle"

interface HeroProps {
    title: string
    subtitle: string
    onCtaClick?: () => void
}

const allComponents = [
    { name: "Button", path: "/components/atoms/Button" },
    { name: "SearchInput", path: "/components/molecules/SearchInput" },
    { name: "Hero", path: "/components/organisms/Hero" },
]

export function Hero({ title, subtitle }: HeroProps) {
    const [searchTerm, setSearchTerm] = React.useState("")
    const [searchResults, setSearchResults] = React.useState(allComponents)

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        if (term) {
            const results = allComponents.filter((component) =>
                component.name.toLowerCase().includes(term.toLowerCase())
            )
            setSearchResults(results)
        } else {
            setSearchResults(allComponents)
        }
    }

    return (
        <section className="container mx-auto grid items-center gap-8 py-12 text-center md:py-20">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="flex flex-col items-center gap-4">
                <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {title}
                    </span>
                </h1>
                <p className="mx-auto max-w-3xl text-lg text-slate-700 sm:text-xl">
                    {subtitle}
                </p>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg">Get Started</Button>
                <Button variant="outline" size="lg">Documentation</Button>
            </div>

            <div className="mx-auto mt-10 w-full max-w-md">
                <p className="mb-3 text-center text-sm text-slate-700">Search the documentation:</p>
                <SearchInput
                    placeholder="Find components, hooks, and more..."
                    onSearch={handleSearch}
                />
                <div className="mt-4 text-left">
                    {searchResults.map((result) => (
                        <div key={result.name} className="p-2 border-b">
                            <p className="font-semibold">{result.name}</p>
                            <p className="text-sm text-slate-600">{result.path}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}