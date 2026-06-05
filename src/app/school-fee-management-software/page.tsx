import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, DollarSign, ClipboardList, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'School Fee Management Software | SchoolBase',
  description:
    'Automate school fee collection, invoicing and payment tracking with SchoolBase. Reduce overdue fees, simplify bursar workflows, and keep parents informed.',
  keywords: [
    'school fee management software',
    'fee collection software',
    'school billing system',
    'school payment tracking',
    'school fee automation',
  ],
}

export default function SchoolFeeManagementSoftwarePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">FEE MANAGEMENT SOFTWARE</p>
            <h1 className="text-4xl font-bold text-foreground">
              School Fee Management Software for Better Cashflow
            </h1>
            <p className="mt-4 text-lg text-muted">
              SchoolBase helps bursars move from manual invoices and paper receipts to automated fee collection, payment tracking and student account management.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
                Start Free Trial
              </Link>
              <Link href="/solutions/school-fee-management" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
                See Fee Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              icon: <ClipboardList className="h-8 w-8 text-brand" />,
              title: 'Automated Invoicing',
              desc: 'Create invoices for classes, students and fee categories in seconds. No more hand-written notes.',
            },
            {
              icon: <DollarSign className="h-8 w-8 text-brand" />,
              title: 'Payment Tracking',
              desc: 'Track all payments in one dashboard and know exactly who has paid and who still owes.',
            },
            {
              icon: <TrendingUp className="h-8 w-8 text-brand" />,
              title: 'Reduce Overdue Fees',
              desc: 'Send reminders automatically and recover more revenue without chasing parents manually.',
            },
            {
              icon: <AlertTriangle className="h-8 w-8 text-brand" />,
              title: 'Clear Parent Communication',
              desc: 'Parents receive invoices and payment reminders directly on WhatsApp, reducing confusion and disputes.',
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-brand" />,
              title: 'Safe Records',
              desc: 'Student fee history is stored securely, with audit trails for every payment and invoice.',
            },
            {
              icon: <CheckCircle className="h-8 w-8 text-brand" />,
              title: 'Faster Bursar Workflows',
              desc: 'Spend less time reconciling and more time reviewing financial health and school performance.',
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
            <h2 className="text-3xl font-bold text-foreground">Turn Fee Management into a Strength</h2>
            <p className="mt-4 text-slate-600">
              With SchoolBase, fee collection becomes faster, transparent and predictable for your school. Parents get clarity, bursars get control, and cashflow improves.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { title: 'Fee Plans', detail: 'Flexible billing, installments, discounts and bursar approvals.' },
                { title: 'Reminders', detail: 'Automated WhatsApp reminders to reduce late payments.' },
                { title: 'Receipts', detail: 'Instant digital receipts and payment proof for parents.' },
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
          <h2 className="text-3xl font-bold text-foreground">Give your school a modern fee management system</h2>
          <p className="mt-4 text-slate-600">
            Stop using paper, spreadsheets and manual follow-up. Move to software that already handles the way African schools collect fees.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
              Start Free Trial
            </Link>
            <Link href="/solutions/school-fee-management" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
              See Fee Features
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
