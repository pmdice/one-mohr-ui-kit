"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ThemeToggle } from "@/components/atoms/ThemeToggle/ThemeToggle"
import { Badge } from "@/components/atoms/Badge/Badge"

interface HeroProps {
    title: string
    subtitle: string
}

export function Hero({ title, subtitle }: HeroProps) {
    const shouldReduce = useReducedMotion()
    return (
        <section className="relative container mx-auto grid items-center gap-6 py-12 text-center md:py-20">
            <div className="absolute top-0 right-0">
                <ThemeToggle />
            </div>

            <motion.div
                initial={shouldReduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduce ? { duration: 0 } : { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="flex justify-center"
            >
                <Badge variant="outline">In active development · v0.1</Badge>
            </motion.div>

            <motion.h1
                initial={shouldReduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduce ? { duration: 0 } : { duration: 0.55, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl"
            >
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {title}
                </span>
            </motion.h1>

            <motion.p
                initial={shouldReduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduce ? { duration: 0 } : { duration: 0.55, delay: 0.16, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl"
            >
                {subtitle}
            </motion.p>
        </section>
    )
}
