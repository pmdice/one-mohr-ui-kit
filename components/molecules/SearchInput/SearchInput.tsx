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
                    className="flex h-10 w-full rounded-full border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={placeholder}
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
            <Button type="button" onClick={handleSearch} disabled={disabled}>
                Search
            </Button>
        </div>
    )
}