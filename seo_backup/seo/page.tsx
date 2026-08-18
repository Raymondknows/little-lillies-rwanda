import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, BookOpen, Globe2, MessageSquareText, Receipt } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SEO Resources for SchoolBase | School Management Software',
  description:
    'Explore SEO-friendly school management landing pages for West African schools, including private schools, primary schools, secondary schools, and more.',
  keywords: [
    'school management SEO pages',
    'school software landing pages',
    'school management website pages',
    'West African school SEO',
  ],
}

const pages = [
  {
    title: 'Private Schools',
    href: '/school-management-software-for-private-schools',
    description: 'Modern school management software for private schools and growing institutions.',
  },
  {
    title: 'Primary Schools',
    href: '/school-management-software-for-primary-schools',
    description: 'Simple and practical school software for primary school teams.',
  },
  {
    title: 'Secondary Schools',
    href: '/school-management-software-for-secondary-schools',
    description: 'Powerful school software for results, broadsheets, and academic reporting.',
  },
  {
    title: 'Boarding Schools',
    href: '/school-management-software-for-boarding-schools',
    description: 'Reliable school operations software for boarding schools and hostels.',
  },
  {
    title: 'International Schools',
    href: '/school-management-software-for-international-schools',
    description: 'Flexible school management software for international schools.',
  },
  {
    title: 'Early Childhood Schools',
    href: '/school-management-software-for-early-childhood-schools',
    description: 'Simple platform for nursery, preschool, and early learning schools.',
  },
]

export default function SeoResourcesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">SEO LANDING PAGES</p>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Search-ready pages for every school type</h1>
            <p className="mt-5 text-lg leading-8 text-muted">
              SchoolBase now includes dedicated SEO landing pages that speak directly to school owners, principals, and administrators searching for better school software.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-medium text-brand">West African focus</span>
              <span className="rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-medium text-brand">High-intent keywords</span>
              <span className="rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-medium text-brand">Conversion-ready CTAs</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <Link key={page.href} href={page.href} className="rounded-2xl border border-border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                {page.title.includes('Private') ? <Receipt className="h-6 w-6" /> : page.title.includes('Primary') ? <BookOpen className="h-6 w-6" /> : page.title.includes('Secondary') ? <Globe2 className="h-6 w-6" /> : <MessageSquareText className="h-6 w-6" />}
              </div>
              <h2 className="mt-5 text-xl font-semibold text-foreground">{page.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{page.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 font-semibold text-brand">
                View page <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-brand/5 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground">Why these pages work for SEO</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {[
                {
                  title: 'Search intent matched',
                  detail: 'Each page targets exact phrases used by school owners and administrators looking for software solutions.',
                },
                {
                  title: 'Strong on-page structure',
                  detail: 'Clear headlines, supporting copy, proof blocks, and conversion-focused CTAs make the pages scan-friendly and persuasive.',
                },
                {
                  title: 'Brand alignment',
                  detail: 'The design uses the same colors, spacing, and visual language as the rest of the public site.',
                },
                {
                  title: 'Built for conversion',
                  detail: 'Every page guides visitors toward a demo, trial, or feature discovery path.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 text-brand">
                    <BadgeCheck className="h-5 w-5" />
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
