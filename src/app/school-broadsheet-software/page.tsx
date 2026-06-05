import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, BarChart3, FileText, ShieldCheck, Zap, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'School Broadsheet Software | SchoolBase',
  description:
    'Create digital broadsheets, grade books and result reports with SchoolBase. Save time, reduce errors and share academic performance easily.',
  keywords: [
    'school broadsheet software',
    'digital broadsheet',
    'school grade book',
    'result report software',
    'academic performance tracking',
  ],
}

export default function SchoolBroadsheetSoftwarePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">BROADSHEET SOFTWARE</p>
            <h1 className="text-4xl font-bold text-foreground">
              Digital Broadsheet Software for Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              SchoolBase makes academic reporting easier with digital broadsheets, automatic grade calculation and clear student performance summaries.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
                Start Free Trial
              </Link>
              <Link href="/use-cases/school-broadsheet" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
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
              icon: <FileText className="h-8 w-8 text-brand" />,
              title: 'Automatic Grade Books',
              desc: 'Convert raw marks into broadsheets and report cards automatically, with wholeschool templates ready to use.',
            },
            {
              icon: <BarChart3 className="h-8 w-8 text-brand" />,
              title: 'Performance Analytics',
              desc: 'Track subject performance, class averages and learner growth at a glance.',
            },
            {
              icon: <Zap className="h-8 w-8 text-brand" />,
              title: 'Save Teacher Time',
              desc: 'Teachers enter marks once and SchoolBase handles the rest, including calculations and formatting.',
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-brand" />,
              title: 'Accurate Results',
              desc: 'Avoid manual errors with built-in verification and exam result auditing.',
            },
            {
              icon: <Award className="h-8 w-8 text-brand" />,
              title: 'Professional Reports',
              desc: 'Export polished PDF broadsheets and student result reports for parents and school leadership.',
            },
            {
              icon: <CheckCircle className="h-8 w-8 text-brand" />,
              title: 'Organised School Records',
              desc: 'Keep class performance, term summaries and exam histories in one secure platform.',
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
            <h2 className="text-3xl font-bold text-foreground">Move School Broadsheets Online</h2>
            <p className="mt-4 text-slate-600">
              SchoolBase gives your school a modern broadsheet system that is faster, more accurate and easier to share than spreadsheets or paper books.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { title: 'Grade Books', detail: 'Automatic broadsheets for exams, terms and year-end reports.' },
                { title: 'Tracking', detail: 'See student progress by subject, class and term.' },
                { title: 'Printing', detail: 'Export clean reports for parents or school leaders.' },
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
          <h2 className="text-3xl font-bold text-foreground">Bring your broadsheets into the digital age</h2>
          <p className="mt-4 text-slate-600">
            SchoolBase saves teachers time and gives principals the reports they need to improve academic outcomes.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
              Start Free Trial
            </Link>
            <Link href="/use-cases/school-broadsheet" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
