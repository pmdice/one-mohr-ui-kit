"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu as MenuIcon, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface NavItem {
    label: string
    href: string
    icon: LucideIcon
    isExternal?: boolean
}

export interface NavbarProps {
    /** The Brand Name or Logo Component */
    logo?: React.ReactNode
    /** Array of navigation items */
    items: NavItem[]
    /** The href for the contact button (optional) */
    contactHref?: string
    /** Optional class name for the wrapper */
    className?: string
}

export function Navbar({
                           logo = "Brand.",
                           items,
                           contactHref = "/contact",
                           className
                       }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)
    const navRef = React.useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    // Handle click outside to close menu
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isMenuOpen])

    return (
        <div className={cn("fixed top-8 left-1/2 -translate-x-1/2 z-50", className)}>
            <motion.nav
                ref={navRef}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    width: isMenuOpen ? 420 : 360 // Responsive width animation
                }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                style={{ borderRadius: 24 }}
                className="bg-background/70 backdrop-blur-xl border border-border/50 shadow-lg overflow-hidden"
            >
                <div className="px-8 py-4">
                    <div className="flex items-center justify-between relative">
                        {/* Toggle Button */}
                        <motion.button
                            layout
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-sm text-foreground/60 hover:text-foreground transition-colors whitespace-nowrap flex items-center gap-2"
                        >
                            <MenuIcon className="w-5 h-5 md:hidden" />
                            <span className="hidden md:inline">{isMenuOpen ? "Close" : "Menu"}</span>
                        </motion.button>

                        {/* Centered Logo */}
                        <div className="absolute left-1/2 -translate-x-1/2 text-xl font-serif text-foreground whitespace-nowrap">
                            {logo}
                        </div>

                        {/* Contact Link */}
                        <motion.div layout>
                            <Link
                                href={contactHref}
                                className="text-sm text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <span className="hidden md:inline">Contact</span>
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Dropdown Content */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            key="menu-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-6 pt-2 space-y-2">
                                {items.map((item, index) => {
                                    const Icon = item.icon
                                    const isActive = item.href === "/"
                                        ? pathname === "/"
                                        : pathname?.startsWith(item.href)

                                    const content = (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span className="text-base font-medium">{item.label}</span>
                                            </div>
                                            {item.isExternal && (
                                                <ArrowUpRight className="w-4 h-4 opacity-50" />
                                            )}
                                        </div>
                                    )

                                    return (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, y: -10, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                            transition={{
                                                delay: index * 0.05,
                                                type: "spring",
                                                bounce: 0.3
                                            }}
                                        >
                                            <Link
                                                href={item.href}
                                                target={item.isExternal ? "_blank" : undefined}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={cn(
                                                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                                                    isActive
                                                        ? "bg-foreground text-background shadow-md"
                                                        : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                                                )}
                                            >
                                                {content}
                                            </Link>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </div>
    )
}