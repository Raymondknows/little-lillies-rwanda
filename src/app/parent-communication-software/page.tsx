import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, MessageSquare, Zap, Bell, ShieldCheck, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Parent Communication Software | SchoolBase',
  description:
    'Keep parents connected with WhatsApp announcements, fee reminders and result updates. SchoolBase is parent communication software built for schools.',
  keywords: [
    'parent communication software',
    'school communication app',
    'school parent messaging',
    'WhatsApp communication for schools',
    'school notification system',
  ],
}

export default function ParentCommunicationSoftwarePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">PARENT COMMUNICATION SOFTWARE</p>
            <h1 className="text-4xl font-bold text-foreground">
              Parent Communication Software for Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              Send announcements, fee reminders, and academic updates to parents on WhatsApp with a software platform built for school communication.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
                Start Free Trial
              </Link>
              <Link href="/use-cases/parent-communication" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
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
              icon: <MessageSquare className="h-8 w-8 text-brand" />,
              title: 'WhatsApp Messaging',
              desc: 'Send school updates, exam schedules, and emergency notices directly to parents on WhatsApp.',
            },
            {
              icon: <Bell className="h-8 w-8 text-brand" />,
              title: 'Automatic Reminders',
              desc: 'Remind parents about fees, meetings and result releases without extra manual effort.',
            },
            {
              icon: <CheckCircle className="h-8 w-8 text-brand" />,
              title: 'Two-Way Communication',
              desc: 'Allow parents to reply when you want them to, while keeping school messages clear and trackable.',
            },
            {
              icon: <Zap className="h-8 w-8 text-brand" />,
              title: 'Fast Setup',
              desc: 'Start sending messages in hours, with templates and school contact groups already configured.',
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-brand" />,
              title: 'Safe Messaging',
              desc: 'Use secure communication practices and keep data protected while sharing school news.',
            },
            {
              icon: <Users className="h-8 w-8 text-brand" />,
              title: 'Parent Adoption',
              desc: 'Parents trust messages that arrive on WhatsApp and papers that are easy to follow.',
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
            <h2 className="text-3xl font-bold text-foreground">Keep Every Parent Connected</h2>
            <p className="mt-4 text-slate-600">
              When parents receive updates clearly and on time, your school runs more smoothly. SchoolBase makes communication predictable and simple.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { title: 'Announcements', detail: 'Share school news, exam dates and event reminders.' },
                { title: 'Fee Messages', detail: 'Send payment reminders that parents can act on immediately.' },
                { title: 'Report Sharing', detail: 'Deliver student progress and results quickly.' },
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
          <h2 className="text-3xl font-bold text-foreground">Switch to parent communication software built for schools</h2>
          <p className="mt-4 text-slate-600">
            SchoolBase makes it easy to keep parents informed, reduce confusion and improve school-parent collaboration.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
              Start Free Trial
            </Link>
            <Link href="/use-cases/parent-communication" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
