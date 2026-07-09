import { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About SchoolBase | School Management Platform',
  description:
    'Learn about SchoolBase and our mission to simplify school management for West African schools with fee collection, WhatsApp parent communication, and result publishing.',
  openGraph: {
    title: 'About SchoolBase',
    description:
      'Discover how SchoolBase is transforming school management for West African schools.',
    url: 'https://schoolbase.live/about',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            Our Mission
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted leading-relaxed">
            To become the most intuitive school management platform for West African schools.
            Every day, thousands of school owners trust SchoolBase to manage fees,
            communicate with parents, and run their schools efficiently.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
            <p className="mt-6 text-muted leading-relaxed">
              SchoolBase was founded by ClickBase Technologies Ltd with a simple
              observation: West African schools were struggling with paper-based
              administration, missing fee payments, and no direct parent
              communication channels.
            </p>
            <p className="mt-4 text-muted leading-relaxed">
              We built SchoolBase to solve these problems. In 2025, we launched and
              today, we're helping schools across Nigeria, Ghana, Liberia, Sierra Leone, and The Gambia operate smarter.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-8">
            <h3 className="text-2xl font-bold text-foreground">Why SchoolBase?</h3>
            <ul className="mt-6 space-y-4 text-muted">
              <li className="flex gap-3">
                <span className="text-brand">✓</span>
                <span>
                  <strong>Live in 48 hours:</strong> No long implementation. Go live
                  in two days.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand">✓</span>
                <span>
                  <strong>All-in-one platform:</strong> Fees, results, WhatsApp,
                  website, all included.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand">✓</span>
                <span>
                  <strong>Affordable:</strong> Prices start from ₦35,000/term. No
                  hidden costs.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand">✓</span>
                <span>
                  <strong>Built for West Africa:</strong> We understand schools in Nigeria, Ghana, Liberia, Sierra Leone, and The Gambia.
                  Bank transfers, cash, Paystack.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand">✓</span>
                <span>
                  <strong>Dedicated support:</strong> Our team helps you every step of
                  the way.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-foreground">The Team</h3>
            <p className="mt-4 text-muted leading-relaxed">
              SchoolBase is powered by ClickBase Technologies Ltd, a software company
              with deep roots in education technology. We're committed to building
              tools that school owners actually want to use.
            </p>
          </div>

          <div className="flex gap-4">
            <Button href="/purchase">Start Free Trial</Button>
            <Button variant="secondary" href="/contact">
              Get in Touch
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
