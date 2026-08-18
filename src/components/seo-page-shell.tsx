import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, BadgeCheck, Sparkles } from 'lucide-react'

interface FeatureItem {
  title: string
  description: string
  icon: LucideIcon
}

interface ProofItem {
  title: string
  detail: string
}

interface SeoPageShellProps {
  eyebrow: string
  title: string
  description: string
  highlights: string[]
  features: FeatureItem[]
  proofItems: ProofItem[]
  primaryCtaLabel: string
  primaryHref: string
  secondaryCtaLabel: string
  secondaryHref: string
}

export function SeoPageShell({
  eyebrow,
  title,
  description,
  highlights,
  features,
  proofItems,
  primaryCtaLabel,
  primaryHref,
  secondaryCtaLabel,
  secondaryHref,
}: SeoPageShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
            <p className="mt-5 text-lg leading-8 text-muted">{description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className="rounded-lg bg-brand px-6 py-3 text-center font-semibold text-white transition hover:bg-brand/90">
                {primaryCtaLabel}
              </Link>
              <Link href={secondaryHref} className="rounded-lg border border-brand px-6 py-3 text-center font-semibold text-brand transition hover:bg-brand/5">
                {secondaryCtaLabel}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((highlight) => (
                <span key={highlight} className="rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-medium text-brand">
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="rounded-2xl border border-brand/10 bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-foreground">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-brand/5 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              <Sparkles className="h-4 w-4" />
              Built for modern school teams
            </div>
            <h2 className="mt-4 text-3xl font-bold text-foreground">Why school leaders choose Little Lillies School</h2>
            <p className="mt-4 max-w-3xl text-slate-600">
              Our platform combines fee automation, parent communication, exam release, and school websites in one school management system that works beautifully for day-to-day operations.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {proofItems.map((item) => (
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

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-white p-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to simplify school operations?</h2>
          <p className="mt-4 text-slate-600">
            Launch faster, communicate better, and keep every parent and teacher in the loop with Little Lillies School.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={primaryHref} className="rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand/90">
              {primaryCtaLabel}
            </Link>
            <Link href={secondaryHref} className="rounded-lg border border-brand px-6 py-3 font-semibold text-brand transition hover:bg-brand/5">
              {secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
