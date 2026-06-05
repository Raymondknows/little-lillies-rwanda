import Link from "next/link";
import { CheckCircle, X, Clock, Zap, TrendingUp, Shield } from "lucide-react";

export const metadata = {
  title: "SchoolBase vs Manual Systems | SchoolBase",
  description:
    "Compare digital school management vs manual paper/Excel systems. See time savings, cost savings, and accuracy improvements.",
};

export default function VsManualPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">COMPARISON</p>
            <h1 className="text-4xl font-bold text-foreground">
              SchoolBase vs Manual Systems
            </h1>
            <p className="mt-4 text-lg text-muted">
              Digital vs paper. SchoolBase automates what manual systems do by hand. See the real ROI.
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">The Real Cost of Manual Systems</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              icon: <Clock className="h-8 w-8 text-red-500" />,
              title: "Time Wasted",
              value: "40+ hours/week",
              desc: "Staff spend 40+ hours weekly on manual admin (results, fees, attendance).",
            },
            {
              icon: <X className="h-8 w-8 text-red-500" />,
              title: "Hidden Errors",
              value: "~₦50k/month",
              desc: "Calculation mistakes, miscalculations, lost data = lost revenue.",
            },
            {
              icon: <TrendingUp className="h-8 w-8 text-red-500" />,
              title: "Late Collections",
              value: "30-40%",
              desc: "Without automated reminders, 30-40% of fees are late/never collected.",
            },
            {
              icon: <Shield className="h-8 w-8 text-red-500" />,
              title: "Data Loss",
              value: "Ongoing",
              desc: "Lost result sheets, damaged attendance books, no backup. Irreplaceable data.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-6">
              <div className="mb-3">{item.icon}</div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-lg font-bold text-red-600">{item.value}</p>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-red-600">Manual System</th>
                  <th className="px-4 py-3 text-center font-semibold text-brand">SchoolBase</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Time to mark attendance", "10-15 min/class", "30 seconds/class"],
                  ["Results entry time", "2-3 hours/assessment", "30 minutes/assessment"],
                  ["Calculate positions/grades", "Manual (hours)", "Automatic (seconds)"],
                  ["Generate reports", "1-2 days", "1 minute"],
                  ["Parent notifications", "Manual letters", "Automatic WhatsApp"],
                  ["Fee reminders", "Manual follow-up", "Automatic SMS/WhatsApp"],
                  ["Data backup", "None (risky!)", "Daily automatic"],
                  ["Access from phone", "No", "Yes"],
                  ["Historical tracking", "Manual files", "Searchable database"],
                  ["Payment tracking", "Manual ledger", "Automatic reconciliation"],
                  ["Absence patterns", "Hard to identify", "Instant alerts"],
                  ["Error rate", "2-5%", "<0.1%"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-white/50">
                    <td className="px-4 py-3 text-foreground">{row[0]}</td>
                    <td className="px-4 py-3 text-center text-red-600">{row[1]}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-brand/10 px-2 py-1 text-brand">{row[2]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ROI Calculation */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Real ROI Calculation</h2>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Manual System Costs */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-8">
            <h3 className="font-bold text-red-600 text-lg mb-6">Manual System (Current Cost)</h3>
            <div className="space-y-4">
              <div className="flex justify-between pb-2 border-b">
                <span>Bursar time (fee admin): 20 hrs/week</span>
                <span className="font-semibold">₦50,000/week</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span>Teacher time (results, attendance): 50 hrs/week (10 teachers)</span>
                <span className="font-semibold">₦100,000/week</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span>Lost fees from late reminders: ~₦100k/month</span>
                <span className="font-semibold">₦100,000/month</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span>Calculation errors & disputes: ~₦50k/month</span>
                <span className="font-semibold">₦50,000/month</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span>Data loss (lost result sheets, etc.)</span>
                <span className="font-semibold">Priceless ⚠️</span>
              </div>
              <div className="bg-red-100 p-4 rounded mt-4">
                <div className="flex justify-between font-bold text-red-600">
                  <span>MONTHLY COST:</span>
                  <span>~₦600,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* SchoolBase Costs */}
          <div className="rounded-lg border border-brand bg-brand/5 p-8">
            <h3 className="font-bold text-brand text-lg mb-6">With SchoolBase</h3>
            <div className="space-y-4">
              <div className="flex justify-between pb-2 border-b">
                <span>Bursar time: 3 hrs/week</span>
                <span className="font-semibold">₦7,500/week</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span>Teacher time: 5 hrs/week (80% reduction)</span>
                <span className="font-semibold">₦10,000/week</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span>Lost fees: ~₦20k/month (80% reduction)</span>
                <span className="font-semibold">₦20,000/month</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span>Errors: ~₦5k/month (90% reduction)</span>
                <span className="font-semibold">₦5,000/month</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span>SchoolBase subscription</span>
                <span className="font-semibold">₦50,000/month</span>
              </div>
              <div className="bg-brand/20 p-4 rounded mt-4">
                <div className="flex justify-between font-bold text-brand">
                  <span>MONTHLY COST:</span>
                  <span>~₦92,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="mt-12 rounded-lg bg-green-50 border-2 border-green-200 p-8 text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-2">Annual Savings</h3>
          <p className="text-4xl font-bold text-green-700">₦6.1 Million</p>
          <p className="mt-4 text-muted">
            And that doesn't include avoided data loss, reduced parent complaints, or improved student outcomes.
          </p>
        </div>
      </div>

      {/* Qualitative Benefits */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Beyond Financial ROI</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Parent Engagement",
                benefit: "Increases 90% with instant result notifications",
              },
              {
                title: "Teacher Satisfaction",
                benefit: "Less admin time = more focus on teaching",
              },
              {
                title: "Data Safety",
                benefit: "Automatic backups mean no more lost data",
              },
              {
                title: "Decision-Making Speed",
                benefit: "Reports in minutes instead of days",
              },
              {
                title: "Compliance",
                benefit: "Audit trail of all data changes",
              },
              {
                title: "Scalability",
                benefit: "Same system works for 100 or 5,000 students",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-brand/20 bg-white p-6">
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-brand flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.benefit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SchoolBase Solutions */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">SchoolBase Solutions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/solutions/school-fee-management" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">💳 Fee Management</h3>
            <p className="text-sm text-muted">Automate billing, tracking, and reconciliation</p>
          </Link>
          <Link href="/solutions/digital-result-management" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">📊 Results Management</h3>
            <p className="text-sm text-muted">Digitize grading and reporting instantly</p>
          </Link>
          <Link href="/solutions/student-attendance-tracking" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">✓ Attendance</h3>
            <p className="text-sm text-muted">One-click marking and parent alerts</p>
          </Link>
          <Link href="/solutions/parent-communication" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">💬 Parent Comms</h3>
            <p className="text-sm text-muted">WhatsApp updates and school website</p>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Stop Wasting ₦600k/Month on Manual Systems</h2>
          <p className="mt-4 text-lg text-brand/80">
            SchoolBase automates what takes your team hours. Get your first month free to see the difference.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Start Free Trial
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Schedule Call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
