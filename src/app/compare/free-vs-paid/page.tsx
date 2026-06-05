import Link from "next/link";
import { AlertCircle, CheckCircle, TrendingDown, Zap } from "lucide-react";

export const metadata = {
  title: "Free vs Paid School Management Software | SchoolBase",
  description:
    "Why free school software fails and why paid solutions like SchoolBase are worth it. TCO analysis and real-world risks.",
};

export default function FreeVsPaidPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">COMPARISON</p>
            <h1 className="text-4xl font-bold text-foreground">
              Free vs Paid School Software
            </h1>
            <p className="mt-4 text-lg text-muted">
              Why free school software fails and costs more than paid solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Take */}
      <div className="bg-red-50 border-t-4 border-red-500 py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Free Software Sounds Good. It's Actually a Trap.</h2>
          <p className="text-muted max-w-3xl mx-auto">
            Free tools like Excel/Google Sheets seem cheap but cost your school in hidden ways: lost data, wasted time, security risks, and failed audits.
          </p>
        </div>
      </div>

      {/* The Hidden Costs of Free */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">The Hidden Costs of "Free"</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Time Wasted",
              cost: "~₦100k/month",
              details: [
                "Manual data entry (hours/week)",
                "Creating formulas/templates",
                "Copying data between sheets",
                "Troubleshooting corrupted files",
              ],
            },
            {
              title: "Data Loss",
              cost: "~₦50k/month avg",
              details: [
                "Accidental deletion (irreversible)",
                "Corrupted files",
                "Lost updates (no version control)",
                "No backup = start over",
              ],
            },
            {
              title: "Security Risks",
              cost: "~₦200k (incident)",
              details: [
                "Student data exposed online",
                "Parent contact info stolen",
                "No encryption on sensitive data",
                "Regulatory compliance failure",
              ],
            },
            {
              title: "Errors & Mistakes",
              cost: "~₦50k/month",
              details: [
                "Formula errors in calculations",
                "Wrong grades published",
                "Duplicate student records",
                "Fee reconciliation nightmares",
              ],
            },
            {
              title: "Scalability Problems",
              cost: "~₦30k/month",
              details: [
                "Slow to open with 1000+ students",
                "Manual workarounds needed",
                "Hard to add new classes",
                "Can't handle growth",
              ],
            },
            {
              title: "No Support",
              cost: "~₦40k (emergency)",
              details: [
                "When it breaks, you fix it alone",
                "No one to call for help",
                "Hours wasted debugging",
                "No recovery plan",
              ],
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm font-bold text-red-600 mt-2">{item.cost}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted">
                {item.details.map((detail, j) => (
                  <li key={j}>• {detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* TCO Analysis */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">True Cost of Ownership</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Excel/Google Sheets",
                label: "(Free)",
                items: [
                  "Software: ₦0",
                  "Time waste: ₦100k/month",
                  "Data loss risk: ₦50k avg",
                  "Security incident: ₦200k risk",
                  "Error recovery: ₦30k/incident",
                  "Your support time: ₦50k/month",
                ],
                annual: "₦1.9M+",
              },
              {
                title: "SchoolBase",
                label: "(Recommended ⭐)",
                items: [
                  "Software: ₦50k/month",
                  "Time saved: -₦80k/month",
                  "No data loss: ₦0",
                  "Secure + compliant: ₦0 risk",
                  "Auto-calculated: ₦0 errors",
                  "24/7 support: Included",
                ],
                annual: "₦600k net",
              },
              {
                title: "Free SaaS (Minimal)",
                label: "(Limited)",
                items: [
                  "Software: ₦0",
                  "Time saved: -₦30k/month",
                  "Data loss risk: ₦30k avg",
                  "Limited security: ₦100k risk",
                  "Limited features: ₦40k workaround",
                  "Limited support: ₦20k/issue",
                ],
                annual: "₦0.6M+",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted mt-1">{item.label}</p>
                <div className="mt-6 space-y-2">
                  {item.items.map((line, j) => (
                    <div
                      key={j}
                      className={`text-sm ${
                        line.includes("-")
                          ? "text-green-600 font-semibold"
                          : line.includes("risk")
                          ? "text-red-600"
                          : "text-foreground"
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted">Annual Cost:</p>
                  <p className="text-2xl font-bold text-foreground">{item.annual}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Comparison */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Risk Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="px-4 py-3 text-left font-semibold">Risk</th>
                <th className="px-4 py-3 text-center font-semibold">Free (Excel)</th>
                <th className="px-4 py-3 text-center font-semibold">Free SaaS</th>
                <th className="px-4 py-3 text-center font-semibold text-brand">SchoolBase</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Data Loss", "🔴 Very High", "🟡 Medium", "✅ None"],
                ["Security Breach", "🔴 Very High", "🟡 Medium", "✅ Compliant"],
                ["Accidental Deletion", "🔴 Permanent", "🟡 Limited Recovery", "✅ Full Recovery"],
                ["Scalability Issues", "🔴 Breaks at 500 students", "🟡 Limited", "✅ Unlimited"],
                ["Support When Down", "🔴 No one", "🟡 Email (slow)", "✅ 24/7 WhatsApp"],
                ["Audit Trail", "🔴 None", "🟡 Limited", "✅ Full"],
                ["Compliance Ready", "🔴 No", "🟡 Partial", "✅ Yes"],
                ["Growth Ready", "🔴 No", "🟡 Maybe", "✅ Yes"],
              ].map((row, i) => (
                <tr key={i} className="border-b border-border hover:bg-brand/5">
                  <td className="px-4 py-3 font-medium text-foreground">{row[0]}</td>
                  <td className="px-4 py-3 text-center text-sm">{row[1]}</td>
                  <td className="px-4 py-3 text-center text-sm">{row[2]}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-brand">
                    {row[3]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Stories */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">What Happens with Free Software</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "The Data Loss Story",
                story:
                  "School used Excel for results. Teacher accidentally deleted column B. Lost 200 students' math marks. Had to re-enter manually. 8 hours wasted. 2 mistakes published.",
                impact: "₦50k cost, damaged reputation",
              },
              {
                title: "The Security Breach",
                story:
                  "School shared Excel on shared drive. Someone got hacked. 5,000 student records + parent phone numbers leaked. Parents angry. Board of trustees noticed.",
                impact: "Compliance failure, lost trust",
              },
              {
                title: "The Scaling Problem",
                story:
                  "School grew from 200 to 800 students. Excel became unusable. Loading took 5 minutes. Formulas broke. Staff wasted 10+ hours/week on workarounds.",
                impact: "Couldn't grow, had to switch",
              },
              {
                title: "The Audit Failure",
                story:
                  "Ministry audit required proof of grades and student records. School had Excel with no version history. No proof of who changed what. Failed audit.",
                impact: "Regulatory penalty, lost accreditation risk",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-6">
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted mb-3">{item.story}</p>
                <p className="text-xs font-semibold text-red-600">Impact: {item.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Paid Makes Sense */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Why Paid Solutions Make Financial Sense</h2>
        <div className="space-y-4">
          {[
            {
              title: "Prevents Data Loss",
              desc: "Automatic backups. Version control. Roll-back if needed. Priceless peace of mind.",
            },
            {
              title: "Saves Time",
              desc: "Automation = 5-8 hours per week saved. That's ₦50-100k/week you get back.",
            },
            {
              title: "Eliminates Errors",
              desc: "Automatic calculations. No typos. No misranking. No fee collection mistakes.",
            },
            {
              title: "Security Built-in",
              desc: "Encryption, SSL, regular updates. Compliance audit-ready. No data breach worry.",
            },
            {
              title: "Support When You Need It",
              desc: "Something breaks? You have someone to call. Average response: 2 hours not 2 days.",
            },
            {
              title: "Scalability Guaranteed",
              desc: "Works for 100 students or 5,000. Same cost. No workarounds needed as you grow.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-brand/20 bg-white p-6">
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-brand flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted mt-1">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Overview */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Core SchoolBase Modules</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Link href="/solutions/school-fee-management" className="rounded-lg border border-border bg-white p-4 hover:shadow-lg transition text-center">
            <h3 className="font-semibold text-foreground mb-2">💳 Fees</h3>
            <p className="text-xs text-muted">Invoicing & payment tracking</p>
          </Link>
          <Link href="/solutions/digital-result-management" className="rounded-lg border border-border bg-white p-4 hover:shadow-lg transition text-center">
            <h3 className="font-semibold text-foreground mb-2">📊 Results</h3>
            <p className="text-xs text-muted">Grading & reporting</p>
          </Link>
          <Link href="/solutions/student-attendance-tracking" className="rounded-lg border border-border bg-white p-4 hover:shadow-lg transition text-center">
            <h3 className="font-semibold text-foreground mb-2">✓ Attendance</h3>
            <p className="text-xs text-muted">Tracking & alerts</p>
          </Link>
          <Link href="/solutions/parent-communication" className="rounded-lg border border-border bg-white p-4 hover:shadow-lg transition text-center">
            <h3 className="font-semibold text-foreground mb-2">💬 Communication</h3>
            <p className="text-xs text-muted">WhatsApp & SMS</p>
          </Link>
          <Link href="/solutions/school-broadsheet" className="rounded-lg border border-border bg-white p-4 hover:shadow-lg transition text-center">
            <h3 className="font-semibold text-foreground mb-2">📈 Analytics</h3>
            <p className="text-xs text-muted">Broadsheet & insights</p>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Stop Pretending Excel is Free</h2>
          <p className="mt-4 text-lg text-brand/80">
            It costs ₦1.9M+ per year in hidden costs. SchoolBase costs ₦600k/year and saves you time, data, and stress.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Start Free Trial
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              See Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
