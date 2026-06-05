import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Zap, Award, MessageSquare, ShieldCheck, CalendarDays } from 'lucide-react'

export const metadata: Metadata = {
  title: 'School Management Software | SchoolBase',
  description:
    'SchoolBase is modern school management software for African schools. Manage fees, attendance, results, parent communication and secure school data on one platform.',
  keywords: [
    'school management software',
    'school software',
    'school administration system',
    'best school management software',
    'African school software',
    'school management platform',
  ],
}

export default function SchoolManagementSoftwarePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">SCHOOL MANAGEMENT SOFTWARE</p>
            <h1 className="text-4xl font-bold text-foreground">
              School Management Software Built for African Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              SchoolBase brings fees, attendance, results, parent communication and school data together in one trusted platform.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
                Start Free Trial
              </Link>
              <Link href="/demo" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
                Request a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              icon: <Zap className="h-8 w-8 text-brand" />, 
              title: 'Automate School Operations',
              desc: 'Save time across fees, attendance, assessments and parent updates with one platform built for school teams.',
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-brand" />,
              title: 'Secure School Data',
              desc: 'Student records, fee history and academic performance are protected with role-based access and daily backups.',
            },
            {
              icon: <MessageSquare className="h-8 w-8 text-brand" />,
              title: 'Keep Parents Informed',
              desc: 'Send WhatsApp announcements, fee reminders and result notifications without extra tools or manual follow-up.',
            },
            {
              icon: <CalendarDays className="h-8 w-8 text-brand" />,
              title: 'Go Live Fast',
              desc: 'Set up in 48 hours, move from spreadsheets to a live school software system without months of IT work.',
            },
            {
              icon: <CheckCircle className="h-8 w-8 text-brand" />,
              title: 'Trusted by School Leaders',
              desc: 'Built for principals, bursars, and teachers who want a reliable school software system that works on mobile.',
            },
            {
              icon: <Award className="h-8 w-8 text-brand" />,
              title: 'Designed for African Schools',
              desc: 'Local payment, local curriculum support, local service. No one-size-fits-all software here.',
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
            <h2 className="text-3xl font-bold text-foreground">Why Schools Choose SchoolBase</h2>
            <p className="mt-4 text-slate-600">
              We built SchoolBase to make school management simple, reliable and affordable. Every feature is designed for schools that need fast setup, clear reports, and happy parents.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { title: 'Fees & Invoicing', detail: 'Automated billing, online payment tracking, receipt generation.' },
                { title: 'Attendance & Reports', detail: 'Digital attendance with parent alerts and absence summaries.' },
                { title: 'Results & Broadsheets', detail: 'Publish exam results, auto-calculate grades, export reports.' },
                { title: 'Parent Communication', detail: 'WhatsApp updates, announcements, and fee reminders.' },
                { title: 'Staff Collaboration', detail: 'Role-based access and centralized school data for your team.' },
                { title: 'Local Support', detail: 'WhatsApp support, local onboarding and quick implementation.' },
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
          <h2 className="text-3xl font-bold text-foreground">Start with the best school management software</h2>
          <p className="mt-4 text-slate-600">
            If you want school software that works for fees, results, attendance and parents, SchoolBase is built for your school.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
              Start Free Trial
            </Link>
            <Link href="/demo" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
