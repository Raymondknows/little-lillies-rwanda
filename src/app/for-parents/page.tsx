import Link from "next/link";
import { Eye, Smartphone, AlertCircle, TrendingUp, CheckCircle, Lock } from "lucide-react";

export const metadata = {
  title: "SchoolBase for Parents | Parent Portal",
  description:
    "Parent portal: view child's results, attendance, grades, fees, payment tracking. Instant WhatsApp notifications. Stay connected.",
};

export default function ParentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">FOR PARENTS</p>
            <h1 className="text-4xl font-bold text-foreground">
              Parent Portal: Stay Connected to Your Child's Progress
            </h1>
            <p className="mt-4 text-lg text-muted">
              See results same-day. Track fees. Instant WhatsApp notifications. Never miss important updates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/results/check"
                className="inline-flex items-center rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand/90"
              >
                Check Result With PIN
              </Link>
              <Link
                href="/parent/login"
                className="inline-flex items-center rounded-lg border border-brand/20 bg-white px-5 py-3 text-sm font-semibold text-brand hover:bg-brand/5"
              >
                Parent Portal Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Parent Frustrations */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">The Waiting Game</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Results Take Forever",
              desc: "Exam ends Friday. Results come home 2 weeks later in envelope. No update. No communication. Wondering how child did.",
            },
            {
              title: "Surprised by Bad Grades",
              desc: "See child's report card and shocked. Bad grades. But you had no warning. Why didn't school tell you earlier?",
            },
              {
              title: "Fee Confusion",
              desc: "School says fee due. You don't know if paid or not. What's the exact amount? Multiple unpaid invoices.",
            },
            {
              title: "No Real Insight",
              desc: "See final grade but no details. Which subjects weak? Where can child improve? No breakdown.",
            },
            {
              title: "Communication Gap",
              desc: "Want to ask school questions. No easy way. Have to go in person. Get delayed responses.",
            },
            {
              title: "Missing Key Info",
              desc: "When are exams? When will results come? When is school holiday? Get last-minute surprises.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Portal */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Parent Portal Changes Everything</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Eye className="h-8 w-8 text-brand" />,
                title: "Instant Results",
                desc: "Results published? You get WhatsApp notification within minutes. Click link. See child's marks immediately.",
              },
              {
                icon: <Smartphone className="h-8 w-8 text-brand" />,
                title: "Mobile Access",
                desc: "Works on any phone. Check results, fees, attendance anytime. No need to go to school.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "Progress Tracking",
                desc: "See results from current and previous terms. Track improvement. Know if child is progressing or struggling.",
              },
              {
                icon: <AlertCircle className="h-8 w-8 text-brand" />,
                title: "Fee Tracking",
                desc: "See all invoices. Know what's paid, what's overdue. Get reminders before deadline. Pay online easily.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Attendance Monitoring",
                desc: "See child's attendance record. Know if absent. Get alerts if too many absences. Stay informed.",
              },
              {
                icon: <Lock className="h-8 w-8 text-brand" />,
                title: "Secure & Private",
                desc: "See only your child's information. Encrypted. Safe. School controls what you see.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-brand/20 bg-white p-6">
                <div className="mb-3">{item.icon}</div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Your Journey */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">How It Works for You</h2>
        <div className="space-y-4">
          {[
            {
              step: "Day 1",
              activity: "School sends you login email. You create password. Portal activated.",
            },
            {
              step: "Day 2-3",
              activity: "See previous years' results (if available). Familiarize with your child's history.",
            },
            {
              step: "Exam Day",
              activity: "Child takes exam. You receive WhatsApp confirmation that exam happened.",
            },
            {
              step: "Results Day",
              activity: "Results published. You get WhatsApp notification. Click link. See marks immediately. Know exactly how child did.",
            },
            {
              step: "Weekly",
              activity: "Check attendance. If absent, you'll see. Know what's happening at school.",
            },
            {
              step: "Fee Due",
              activity: "Get fee reminder WhatsApp. See invoice in portal. Click 'Pay Now'. Pay via card/mobile money. Receipt instant.",
            },
            {
              step: "Ongoing",
              activity: "Track progress term-to-term. See if child improving or declining. Plan support early.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-brand bg-brand/5 p-6">
              <div className="flex gap-4">
                <div className="font-bold text-brand text-lg min-w-fit bg-white rounded-full h-10 w-10 flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.step}</p>
                  <p className="text-sm text-muted mt-1">{item.activity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What You Get */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">What You Can See</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Academic Records",
                items: [
                  "✅ Current term results",
                  "✅ Historical results (previous terms/years)",
                  "✅ Subject-wise breakdown",
                  "✅ Overall grade/position",
                  "✅ Class average comparison",
                ],
              },
              {
                title: "Financial Tracking",
                items: [
                  "✅ Pending invoices",
                  "✅ Payment history",
                  "✅ Due dates",
                  "✅ Receipts",
                  "✅ Payment methods available",
                ],
              },
              {
                title: "Attendance & Behavior",
                items: [
                  "✅ Daily attendance record",
                  "✅ Absence patterns",
                  "✅ Absence notifications",
                  "✅ Tardiness",
                  "✅ Trends over time",
                ],
              },
              {
                title: "School Communications",
                items: [
                  "✅ Announcements",
                  "✅ Holiday dates",
                  "✅ Important dates",
                  "✅ Form submission requirements",
                  "✅ New policies",
                ],
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6">
                <h3 className="font-semibold text-foreground mb-4">{item.title}</h3>
                <div className="space-y-2">
                  {item.items.map((subitem, j) => (
                    <p key={j} className="text-sm text-muted">
                      {subitem}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Parents Ask</h2>
        <div className="space-y-4">
          {[
            {
              q: "Is my child's data private?",
              a: "Yes. You can only see your own child's data. School controls access. Encrypted.",
            },
            {
              q: "How do I pay fees online?",
              a: "See invoice in portal. Click 'Pay Now'. Choose payment method (card, bank, mobile money). Pay. Receipt instant.",
            },
            {
              q: "What if I forgot my password?",
              a: "Click 'Forgot Password'. Get reset link via email. Create new password.",
            },
            {
              q: "Can I see results before they're official?",
              a: "No. Only after principal approves. Once approved, you get WhatsApp notification immediately.",
            },
            {
              q: "Can I pay in installments?",
              a: "If school allows. See payment plan options in portal. Pay according to plan.",
            },
            {
              q: "What if I have questions about marks?",
              a: "Comment on results in portal. School gets notified. They respond via WhatsApp or email.",
            },
            {
              q: "Is WhatsApp communication secure?",
              a: "Yes. School uses official business account. Encrypted messages. Your privacy protected.",
            },
            {
              q: "Can I download/print results?",
              a: "Yes. Download PDF, print at home, or save. Your records.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <p className="font-semibold text-foreground">{item.q}</p>
              <p className="mt-2 text-sm text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">What Parents Report</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                metric: "24h",
                desc: "Results available (instead of 2 weeks)",
              },
              {
                metric: "95%",
                desc: "More engaged with child's learning",
              },
              {
                metric: "Zero",
                desc: "Payment confusion",
              },
              {
                metric: "Real-time",
                desc: "Attendance visibility",
              },
              {
                metric: "Easy",
                desc: "Online fee payments",
              },
              {
                metric: "Peace",
                desc: "Mind knowing child's status",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6 text-center">
                <p className="text-3xl font-bold text-brand">{item.metric}</p>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Stay Connected to Your Child's Progress</h2>
          <p className="mt-4 text-lg text-brand/80">
            Results in 24 hours. Fees tracked. Attendance visible. All on your phone.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Get Started
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Ask School
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
