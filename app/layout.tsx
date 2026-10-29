import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NoticeProvider } from "@/components/feedback/Notices";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "One Mohr UI Kit",
    description: "Handbuch für Firmensoftware: Regeln mit React-Komponenten als Referenz-Umsetzung.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <NoticeProvider>
                {children}
            </NoticeProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}