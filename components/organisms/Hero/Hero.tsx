"use client"

import * as React from "react"
import { ThemeToggle } from "@/components/atoms/ThemeToggle/ThemeToggle"

interface HeroProps {
    title: string
    subtitle: string
}


export function Hero({ title, subtitle }: HeroProps) {

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

        </section>
    )
}