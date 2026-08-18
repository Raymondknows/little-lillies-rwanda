import Link from "next/link"
import { CheckCircle, X, Zap, Award, TrendingDown, Users } from "lucide-react"

export const metadata = {
  title: "SchoolBase vs Google Forms - Better School Management | SchoolBase",
  description:
    "Compare SchoolBase vs Google Forms. Google Forms is free but manual. SchoolBase adds automation, WhatsApp notifications, and real school workflows.",
}

export default function VsGoogleFormsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">COMPARISON</p>
            <h1 className="text-4xl font-bold text-foreground">SchoolBase vs Google Forms</h1>
            <p className="mt-4 text-lg text-muted">
              Google Forms is a quick fix, but it was never built for school operations. SchoolBase is made for fee collection, attendance, results, and parent communication.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Verdict */}
      <div className="bg-gradient-to-r from-brand/10 to-transparent py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg bg-white p-8 border border-red-200">
              <h3 className="font-bold text-lg text-red-600 mb-4">Google Forms</h3>
              <div className="space-y-2 text-sm">
                <p>✅ Free to use</p>
                <p>✅ Easy to set up basic forms</p>
                <p>❌ Manual attendance tracking</p>
                <p>❌ No fee automation</p>
                <p>❌ No parent notifications</p>
                <p>❌ Not built for school workflows</p>
              </div>
            </div>
            <div className="rounded-lg bg-brand/5 p-8 border-2 border-brand">
              <h3 className="font-bold text-lg text-brand mb-4">SchoolBase ⭐</h3>
              <div className="space-y-2 text-sm">
                <p>✅ Built for schools</p>
                <p>✅ Attendance, fees, results, WhatsApp</p>
                <p>✅ Automated workflows</p>
                <p>✅ Mobile-first experience</p>
                <p>✅ Support for parents and teachers</p>
                <p>✅ Scales with your school</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Why Google Forms Falls Short</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border bg-slate-100">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Feature</th>
                <th className="px-4 py-3 text-center font-semibold">Google Forms</th>
                <th className="px-4 py-3 text-center font-semibold text-brand">SchoolBase</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Attendance Tracking', '✗ Manual spreadsheets + forms', '✓ One-click attendance with reports'],
                ['Fee Collection', '✗ No billing automation', '✓ Automatic invoices + reminders'],
                ['Result Publishing', '✗ Manual data export only', '✓ Publish grades to parents instantly'],
                ['Parent Communication', '✗ No direct messaging', '✓ WhatsApp alerts built-in'],
                ['Mobile Experience', '✗ Poor for teachers', '✓ Optimized for phones'],
                ['Data Security', '✗ No school-grade data controls', '✓ Secure roles and backups'],
                ['Workflows for Schools', '✗ Generic forms only', '✓ Designed for school workflows',],
                ['Support', '✗ Community help only', '✓ Real support via WhatsApp',],
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3 font-medium text-foreground border-b">{row[0]}</td>
                  <td className="px-4 py-3 text-center border-b text-slate-600">{row[1]}</td>
                  <td className="px-4 py-3 text-center border-b text-[#0A66C2] font-semibold">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Why It Matters */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Schools Need More Than Forms</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Save Time',
                text: 'SchoolBase automates attendance, payments, and reporting so staff can focus on teaching.',
              },
              {
                title: 'Reduce Errors',
                text: 'No manual copy/paste between sheets. Calculations and notifications are automatic.',
              },
              {
                title: 'Improve Parent Communications',
                text: 'Parents get updates on WhatsApp without having to check email or paper notes.',
              },
            ].map((item, idx) => (
              <div key={idx} className="rounded-lg bg-white p-8 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0A66C2] to-[#084a9a] text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Stop using forms as a school system</h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            Get a real school management platform with the workflows your school actually needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/purchase"
              className="bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#084a9a] transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
