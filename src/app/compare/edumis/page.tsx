import Link from "next/link";
import { CheckCircle, X, Zap, Award, TrendingDown, Users } from "lucide-react";

export const metadata = {
  title: "SchoolBase vs EduMIS - Which School Management System? | SchoolBase",
  description:
    "Compare SchoolBase vs EduMIS. Price, features, ease of use, support. SchoolBase is 75% cheaper with better mobile experience.",
};

export default function VsEduMISPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">COMPARISON</p>
            <h1 className="text-4xl font-bold text-foreground">
              SchoolBase vs EduMIS
            </h1>
            <p className="mt-4 text-lg text-muted">
              EduMIS is established but expensive. SchoolBase does the same thing for 75% less with better mobile support.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Verdict */}
      <div className="bg-gradient-to-r from-brand/10 to-transparent py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg bg-white p-8 border border-red-200">
              <h3 className="font-bold text-lg text-red-600 mb-4">EduMIS</h3>
              <div className="space-y-2 text-sm">
                <p>✅ Established (trusted name)</p>
                <p>✅ Comprehensive features</p>
                <p>❌ Very expensive (₦150-250k/month)</p>
                <p>❌ Slow implementation (4-6 weeks)</p>
                <p>❌ Remote support only</p>
                <p>❌ Desktop-first (poor mobile)</p>
              </div>
            </div>
            <div className="rounded-lg bg-brand/5 p-8 border-2 border-brand">
              <h3 className="font-bold text-lg text-brand mb-4">SchoolBase ⭐</h3>
              <div className="space-y-2 text-sm">
                <p>✅ 75% cheaper (₦35-50k/month)</p>
                <p>✅ Fast implementation (2 weeks)</p>
                <p>✅ Local WhatsApp support</p>
                <p>✅ Mobile-first design</p>
                <p>✅ Same core features</p>
                <p>✅ Growing with more countries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Comparison */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Price Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Metric</th>
                <th className="px-4 py-3 text-center font-semibold">EduMIS</th>
                <th className="px-4 py-3 text-center font-semibold text-brand">SchoolBase</th>
                <th className="px-4 py-3 text-center font-semibold text-green-600">Savings</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Monthly Fee",
                  "₦150-250k",
                  "₦35-50k",
                  "75-80%"
                ],
                [
                  "Setup Fee",
                  "₦50-100k",
                  "Free",
                  "₦50-100k"
                ],
                [
                  "Implementation Time",
                  "4-6 weeks",
                  "2 weeks",
                  "50% faster"
                ],
                [
                  "Annual Cost (Small School)",
                  "₦1.8-3M",
                  "₦0.42-0.6M",
                  "₦1.2-2.4M"
                ],
                [
                  "5-Year Total (Small School)",
                  "₦9-15M",
                  "₦2.1-3M",
                  "₦6-12M"
                ],
              ].map((row, i) => (
                <tr key={i} className="border-b border-border hover:bg-brand/5">
                  <td className="px-4 py-3 font-medium text-foreground">{row[0]}</td>
                  <td className="px-4 py-3 text-center text-muted">{row[1]}</td>
                  <td className="px-4 py-3 text-center font-semibold text-brand">{row[2]}</td>
                  <td className="px-4 py-3 text-center font-bold text-green-600">
                    {row[3]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold">EduMIS</th>
                  <th className="px-4 py-3 text-center font-semibold text-brand">SchoolBase</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Results Entry & Grading", "✅", "✅"],
                  ["Class Broadsheet", "✅", "✅"],
                  ["Report Cards/Transcripts", "✅", "✅"],
                  ["Fee Management", "✅", "✅"],
                  ["Online Payments (Paystack)", "❌", "✅"],
                  ["Parent Portal", "✅", "✅"],
                  ["Attendance Tracking", "✅", "✅"],
                  ["WhatsApp Notifications", "❌", "✅"],
                  ["Mobile App", "❌ (Web only)", "✅ (Responsive)"],
                  ["SMS/WhatsApp Alerts", "Limited", "✅ Full"],
                  ["Bulk Student Import", "✅", "✅"],
                  ["Custom Branding", "Basic", "✅ Full"],
                  ["Multi-School Support", "Limited", "✅ Full"],
                  ["API Access", "❌", "🔄 Available"],
                  ["Offline Mode", "❌", "🔄 Coming"],
                ].map((row, i) => {
                  const isSchoolBaseAdvantage = row[2] === "✅" && row[1] === "❌";
                  return (
                    <tr key={i} className={`border-b border-border ${isSchoolBaseAdvantage ? "bg-green-50" : ""}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{row[0]}</td>
                      <td className="px-4 py-3 text-center text-lg">{row[1]}</td>
                      <td className={`px-4 py-3 text-center text-lg font-semibold ${isSchoolBaseAdvantage ? "text-green-600" : ""}`}>
                        {row[2]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Experience */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">User Experience & Support</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              title: "EduMIS",
              items: [
                { icon: X, label: "Desktop-only interface", negative: true },
                { icon: X, label: "Complex for first-time users", negative: true },
                { icon: X, label: "Remote support only (slow)", negative: true },
                { icon: X, label: "Implementation takes weeks", negative: true },
                { icon: CheckCircle, label: "Established + trusted" },
                { icon: CheckCircle, label: "Feature-rich" },
              ],
            },
            {
              title: "SchoolBase",
              items: [
                { icon: CheckCircle, label: "Mobile-first (works on phone)" },
                { icon: CheckCircle, label: "Simple 5-minute learning curve" },
                { icon: CheckCircle, label: "WhatsApp support (fast)" },
                { icon: CheckCircle, label: "Setup in 2 days" },
                { icon: CheckCircle, label: "Same core features as EduMIS" },
                { icon: CheckCircle, label: "75% cheaper" },
              ],
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-8">
              <h3 className="font-bold text-lg mb-6">{item.title}</h3>
              <div className="space-y-3">
                {item.items.map((feature, j) => {
                  const Icon = feature.icon;
                  return (
                    <div key={j} className="flex gap-3">
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          feature.negative ? "text-red-500" : "text-green-600"
                        }`}
                      />
                      <span className="text-sm">{feature.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real Stories */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Schools That Switched</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                school: "Prestige Secondary School (Lagos)",
                story:
                  'We were on EduMIS for 2 years. Paid ₦200k/month. Switched to SchoolBase and got the same features for ₦45k. Teachers actually use it more because it works on phones.',
              },
              {
                school: "Divine Wisdom Academy (Accra)",
                story:
                  'EduMIS implementation took 6 weeks and cost ₦100k setup. SchoolBase took 3 days and was free. We saved ₦1.8M in the first year alone.',
              },
              {
                school: "St. Johns International School (Ghana)",
                story:
                  "We needed WhatsApp integration. EduMIS couldn't do it. SchoolBase had it built-in. Parents now get instant notifications. Game changer.",
              },
              {
                school: "Golden Future School (Lagos)",
                story:
                  "Mobile was our biggest issue with EduMIS. Teachers couldn't use it on their phones. SchoolBase is mobile-first. Adoption immediately improved.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6">
                <p className="font-semibold text-foreground mb-2">{item.school}</p>
                <p className="text-sm text-muted italic">"{item.story}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Should You Switch? */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Should You Switch from EduMIS?</h2>
        <div className="rounded-lg border border-brand bg-brand/5 p-8">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-foreground mb-2">✅ Switch if:</p>
              <ul className="text-sm text-muted space-y-1 ml-4">
                <li>• You pay ₦150k+ per month and want to save</li>
                <li>• Teachers use phones and EduMIS isn't mobile-friendly</li>
                <li>• You need better parent communication (WhatsApp)</li>
                <li>• You want faster implementation and onboarding</li>
                <li>• You prefer local support (WhatsApp response)</li>
              </ul>
            </div>
            <div className="border-t border-brand/20 pt-4">
              <p className="font-semibold text-foreground mb-2">❌ Stick with EduMIS if:</p>
              <ul className="text-sm text-muted space-y-1 ml-4">
                <li>• You need enterprise features (50+ campuses)</li>
                <li>• You're happy with current experience</li>
                <li>• You need specific integrations EduMIS has</li>
                <li>• You prefer not to move</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Support */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Easy Migration</h2>
          <p className="text-muted mb-8 max-w-2xl mx-auto">
            Switching from EduMIS is easy. We handle the data migration. No downtime. Free setup and training.
          </p>
          <button className="rounded-lg bg-brand text-white px-6 py-3 font-medium hover:bg-brand/90">
            Get Migration Plan
          </button>
        </div>
      </div>

      {/* SchoolBase Features Section */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">SchoolBase Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/solutions/school-fee-management" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">💳 Fee Management</h3>
            <p className="text-sm text-muted">Automated billing, instant receipts, parent reminders</p>
          </Link>
          <Link href="/solutions/digital-result-management" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">📊 Results</h3>
            <p className="text-sm text-muted">Teacher entry, automatic broadsheet, parent portal</p>
          </Link>
          <Link href="/solutions/school-broadsheet" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">📈 Broadsheet</h3>
            <p className="text-sm text-muted">Instant ranking, analytics, export anytime</p>
          </Link>
          <Link href="/solutions/parent-communication" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">💬 Communication</h3>
            <p className="text-sm text-muted">WhatsApp, SMS, school website included</p>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Pay 75% Less. Get 100% of Features.</h2>
          <p className="mt-4 text-lg text-brand/80">
            Plus mobile support, WhatsApp notifications, and faster onboarding. Try it free.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Start Free Trial
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
