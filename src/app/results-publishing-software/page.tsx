import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, BarChart3, MessageSquare, ShieldCheck, CalendarDays, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Results Publishing Software | SchoolBase',
  description:
    'Publish exam results faster with SchoolBase. Automatic grade calculations, digital broadsheets and parent notifications simplify result management.',
  keywords: [
    'results publishing software',
    'school results management',
    'exam results software',
    'digital broadsheet',
    'school report publishing',
  ],
}

export default function ResultsPublishingSoftwarePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">RESULTS PUBLISHING SOFTWARE</p>
            <h1 className="text-4xl font-bold text-foreground">
              Results Publishing Software for Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              SchoolBase helps schools publish exam results quickly with automatic grade calculations, report cards and instant parent notifications.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
                Start Free Trial
              </Link>
              <Link href="/use-cases/results-publishing" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              icon: <BarChart3 className="h-8 w-8 text-brand" />,
              title: 'Automatic Grade Calculations',
              desc: 'Enter scores once and let SchoolBase calculate totals, averages and grade boundaries automatically.',
            },
            {
              icon: <CalendarDays className="h-8 w-8 text-brand" />,
              title: 'Publish Faster',
              desc: 'Get results to students and parents in minutes instead of days.',
            },
            {
              icon: <MessageSquare className="h-8 w-8 text-brand" />,
              title: 'Parent Notifications',
              desc: 'Send results directly to parents on WhatsApp with a click.',
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-brand" />,
              title: 'Accurate Records',
              desc: 'Every result is saved and auditable so schools can trust their academic reporting.',
            },
            {
              icon: <CheckCircle className="h-8 w-8 text-brand" />,
              title: 'Digital Broadsheets',
              desc: 'Create professional broadsheets and export polished PDF reports for stakeholders.',
            },
            {
              icon: <Zap className="h-8 w-8 text-brand" />,
              title: 'Teacher Friendly',
              desc: 'Designed for busy teachers so marks entry is fast and error-free.',
            },
          ].map((item, index) => (
            <div key={index} className="rounded-xl border border-brand/10 bg-white p-8 shadow-sm">
              <div className="mb-4">{item.icon}</div>
              <h2 className="text-xl font-semibold text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand/5 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground">Publish Exam Results with Confidence</h2>
            <p className="mt-4 text-slate-600">
              SchoolBase makes result release simple, accurate and shareable. No more paper reports, no more delayed communication.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { title: 'Instant Reports', detail: 'Publish result slips and report cards in one click.' },
                { title: 'Grade Analytics', detail: 'See subject performance, class trends and student progress.' },
                { title: 'Parent Sharing', detail: 'Send results directly to parents and students via WhatsApp.' },
              ].map((item, index) => (
                <div key={index} className="rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-white p-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">Make result publishing a strength for your school</h2>
          <p className="mt-4 text-slate-600">
            With SchoolBase, you can publish results quickly, reduce errors and keep teachers, students and parents aligned.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
              Start Free Trial
            </Link>
            <Link href="/use-cases/results-publishing" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
