import type { Metadata } from 'next'
import { BadgeCheck, GraduationCap, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Meet the Team Behind SchoolBase | School Management Platform',
  description:
    'Learn about the SchoolBase team building modern school management software for principals, bursars, teachers, and parents across West Africa.',
  keywords: [
    'schoolbase team',
    'school management team',
    'education technology team',
    'school software company',
  ],
  alternates: {
    canonical: 'https://schoolbase.live/team',
  },
  openGraph: {
    title: 'Meet the Team Behind SchoolBase',
    description:
      'The SchoolBase team combines product design, engineering, education expertise, and support to help schools run better.',
    url: 'https://schoolbase.live/team',
    type: 'website',
  },
}

const teamMembers = [
  {
    name: 'Raymond Ikenna Nwokpor',
    role: 'Founder & CEO',
    focus: 'Product vision, growth, and long-term strategy for school technology across Africa.',
    accent: 'Leadership',
  },
  {
    name: 'Product & Operations Team',
    role: 'Product, Support & Delivery',
    focus: 'Turn school pain points into faster onboarding, better workflows, and simpler support.',
    accent: 'Customer-first',
  },
  {
    name: 'Engineering Team',
    role: 'Software & Platform Engineering',
    focus: 'Build reliable tools for fees, results, parent communication, and school websites.',
    accent: 'Reliable by design',
  },
  {
    name: 'Education Partnerships',
    role: 'Implementation & Success',
    focus: 'Help schools move from spreadsheets and paper to a digital system they can actually use.',
    accent: 'Onboarding excellence',
  },
]

const strengths = [
  {
    icon: GraduationCap,
    title: 'Built for Real School Work',
    description: 'We design around the way principals, bursars, teachers, and parents already work every day.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted and Secure',
    description: 'From fee records to result publishing, our team builds with reliability, privacy, and continuity in mind.',
  },
  {
    icon: Sparkles,
    title: 'Always Improving',
    description: 'We keep shipping practical features so schools can move faster and serve families better.',
  },
]

const highlights = [
  'Fast setup for new schools and administrators',
  'Simple workflows for fees, exams, parent messaging, and reporting',
  'Hands-on support from onboarding through daily operations',
  'Clear visibility for school owners who need better control',
]

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-surface/80 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">
                SchoolBase Team
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                The people behind a smarter way to run schools.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                Our team brings together education insight, product design, engineering, and support to help schools modernize without unnecessary complexity.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/purchase">Book a Demo</Button>
                <Button variant="secondary" href="/contact">
                  Talk to the Team
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand">Why schools choose us</p>
                  <p className="text-sm text-muted">Practical support, real product depth, and fast results</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                    <BadgeCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                    <p className="text-sm leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">Meet the team</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A focused team building school software that people actually enjoy using.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {teamMembers.map((member) => (
              <article key={member.name} className="rounded-2xl border border-border bg-surface p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand">
                    {member.name
                      .split(' ')
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">{member.accent}</p>
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted">{member.role}</p>
                <p className="mt-3 text-sm leading-7 text-muted">{member.focus}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface/70 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">What makes us different</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                A team that understands both technology and education.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted">
                We do not believe in bloated software or long implementation projects. We build practical tools that help schools feel lighter, faster, and more organized from day one.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {strengths.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-brand/10 via-white to-brand/5 p-10 shadow-sm">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">Ready to meet us</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Let us show you how SchoolBase can work for your school.
                </h2>
                <p className="mt-4 text-lg leading-8 text-muted">
                  From onboarding to everyday support, we help schools shift to a cleaner, faster operating model without the usual friction.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href="/purchase">Start Free Trial</Button>
                <Button variant="secondary" href="/contact">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'SchoolBase',
            url: 'https://schoolbase.live/team',
            description:
              'SchoolBase builds modern school management software for fees, parents, results, and website operations.',
            slogan: 'Smarter school operations for modern schools.',
          }),
        }}
      />
    </main>
  )
}
