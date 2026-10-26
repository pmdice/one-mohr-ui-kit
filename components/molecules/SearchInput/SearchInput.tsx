"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { cn } from "@/lib/utils"

interface SearchInputProps extends React.HTMLAttributes<HTMLDivElement> {
    onSearch?: (term: string) => void
    placeholder?: string
    disabled?: boolean
}

export function SearchInput({ className, onSearch, placeholder = "Search...", disabled = false, ...props }: SearchInputProps) {
    const [term, setTerm] = React.useState("")

    const handleSearch = () => {
        if (onSearch) onSearch(term)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className={cn("flex w-full max-w-sm items-center space-x-2", className)} {...props}>
            <div className="relative w-full">
                <input
                    type="text"
                    className="flex h-control w-full rounded-control border border-border-strong bg-surface pl-control pr-9 text-control text-fg placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={placeholder}
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-fg-muted pointer-events-none" />
            </div>
            <Button type="button" onClick={handleSearch} disabled={disabled}>
                Search
            </Button>
        </div>
    )
}