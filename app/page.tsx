import { Hero } from "@/components/organisms/Hero/Hero"

export default function Home() {
  return (
      <main className="min-h-screen bg-slate-50 p-8 md:p-24">
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
          <div className="mb-8 border-b pb-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Design System Showcase
            </p>
          </div>

          <Hero
              title="Local.ch Design System"
              subtitle="A scalable, atomic component library built with Next.js 16, TypeScript, and Tailwind CSS. Designed for performance and accessibility."
          />
        </div>
      </main>
  )
}