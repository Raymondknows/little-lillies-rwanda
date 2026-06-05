import Link from "next/link";
import { BarChart3, Zap, TrendingUp, CheckCircle, AlertCircle, Smartphone } from "lucide-react";

export const metadata = {
  title: "SchoolBase for Bursars | Financial Management",
  description:
    "Bursar tools: fee management, payment tracking, reconciliation, financial reports, overdue tracking. 80% time savings.",
};

export default function BursarsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">FOR BURSARS</p>
            <h1 className="text-4xl font-bold text-foreground">
              Bursar Tools: Fee Management & Financial Tracking
            </h1>
            <p className="mt-4 text-lg text-muted">
              End manual fee ledgers. Automated invoicing, payment tracking, reconciliation. Spend less time on admin, more time collecting fees.
            </p>
          </div>
        </div>
      </div>

      {/* Your Pain */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Your Monthly Nightmare</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Manual Invoicing",
              desc: "Create invoices for 500+ students by hand. Write in ledger. Track on Excel. Hours wasted.",
            },
            {
              title: "Payment Chaos",
              desc: "Parent paid cash. Another via bank transfer. Another via Momo. Manually match each one.",
            },
            {
              title: "Reconciliation Hell",
              desc: "End of month: hours matching payments to invoices. Finding discrepancies. Manual spreadsheets.",
            },
            {
              title: "Overdue Tracking",
              desc: "Manual list of who owes. Phone calls to parents. No history. No proof they were reminded.",
            },
            {
              title: "Late Nights",
              desc: "Month-end crunch. Staying late to compile reports for principal. Tired. Error-prone.",
            },
            {
              title: "No Real-Time Data",
              desc: "Principal asks: 'How much collected today?' You don't know until you manually count.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bursar Tools */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">SchoolBase Bursar Tools</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "Automated Invoicing",
                desc: "Set fee schedule once. SchoolBase generates invoices for all students. Bulk invoice entire classes.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "Payment Methods",
                desc: "Paystack (card, bank, mobile). Momo. Direct bank transfer. All funneled into one dashboard.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Auto-Reconciliation",
                desc: "Payment comes in. System matches to invoice automatically. No manual work. See collections in real-time.",
              },
              {
                icon: <AlertCircle className="h-8 w-8 text-brand" />,
                title: "Overdue Tracking",
                desc: "System shows overdue fees. Send automated SMS reminders. Track who has been reminded.",
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-brand" />,
                title: "Financial Reports",
                desc: "Daily/weekly/monthly collection reports. By-class breakdown. By-payment-method breakdown.",
              },
              {
                icon: <Smartphone className="h-8 w-8 text-brand" />,
                title: "Mobile Access",
                desc: "Check collections from your phone. Issue receipts from anywhere. Work from home or office.",
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

      {/* Your Day - Before vs After */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Your Day Transforms</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              title: "❌ Before (Manual)",
              activities: [
                "7:00 AM: Write invoices by hand (2 hours)",
                "9:00 AM: Record payments in ledger",
                "11:00 AM: Match cash to invoices (1 hour)",
                "12:00 PM: Follow up with overdue parents (calls, WhatsApp)",
                "1:00 PM: Create monthly report (3 hours, error-prone)",
                "4:00 PM: Reconciliation = stress, mistakes",
                "5:00 PM+: Overtime. Late nights.",
              ],
              totalHours: "Total: 20+ hours/week",
            },
            {
              title: "✅ With SchoolBase",
              activities: [
                "7:00 AM: Check dashboard (5 minutes)",
                "7:05 AM: System auto-generated invoices yesterday",
                "7:10 AM: Check collections (all reconciled automatically)",
                "7:15 AM: System sends overdue reminders automatically",
                "7:30 AM: Create report (one-click export to Excel/PDF)",
                "8:00 AM: Done with month-end tasks",
                "Rest of day: Other tasks. Leave on time.",
              ],
              totalHours: "Total: 3-4 hours/week",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-lg border-2 p-8 ${
                item.title.includes("SchoolBase")
                  ? "border-brand bg-brand/5"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <h3 className={`font-bold text-lg mb-4 ${
                item.title.includes("SchoolBase")
                  ? "text-brand"
                  : "text-red-600"
              }`}>
                {item.title}
              </h3>
              <div className="space-y-2">
                {item.activities.map((activity, j) => (
                  <p key={j} className="text-sm text-muted">
                    {activity}
                  </p>
                ))}
              </div>
              <p className={`mt-4 font-bold text-lg ${
                item.title.includes("SchoolBase")
                  ? "text-brand"
                  : "text-red-600"
              }`}>
                {item.totalHours}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg bg-green-50 border-2 border-green-200 p-8 text-center">
          <p className="text-2xl font-bold text-green-600 mb-2">Time Saved</p>
          <p className="text-3xl font-bold text-green-700">80% reduction (16+ hours/week)</p>
          <p className="mt-2 text-muted">That's 64+ hours/month. What would you do with that time?</p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Specific Features for Bursars</h2>
          <div className="space-y-6">
            {[
              {
                title: "Fee Schedule Management",
                desc: "Define fees by class level. Set payment deadlines. Configure installment plans. System generates invoices automatically.",
              },
              {
                title: "Bulk Invoicing",
                desc: "Select class, click 'Generate Invoices'. 300 invoices created in 10 seconds. Send to parents via email/WhatsApp.",
              },
              {
                title: "Payment Gateway Integration",
                desc: "Paystack, Momo, bank transfers all in one place. Payments appear in dashboard instantly.",
              },
              {
                title: "Collection Dashboard",
                desc: "Real-time: Total due, collected, overdue. By-class, by-payment-method. See trends.",
              },
              {
                title: "Auto-Reconciliation",
                desc: "Payment comes in → System matches to student invoice. No manual matching. Accurate every time.",
              },
              {
                title: "Overdue Management",
                desc: "See overdue fees instantly. Automated SMS reminders. Track reminders sent. Know who owes and by how much.",
              },
              {
                title: "Receipt Generation",
                desc: "Automatic receipts for each payment. Student gets receipt via email/SMS. You keep record.",
              },
              {
                title: "Financial Reports",
                desc: "Daily collection report. Weekly summary. Monthly P&L. By-class breakdown. Export to Excel for board.",
              },
              {
                title: "Payment Plans",
                desc: "Allow students to pay in installments. Track across months. Get reminder when payment is due.",
              },
              {
                title: "Refund Management",
                desc: "Issue refunds with audit trail. Track reasons. Know who refunded what and when.",
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6">
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Bursars Ask</h2>
        <div className="space-y-4">
          {[
            {
              q: "Will I understand how to use this?",
              a: "Yes. We train you 30 minutes. Dashboard is simple - invoices, payments, reports. Most bursars comfortable in 1 day.",
            },
            {
              q: "What about cash payments (not online)?",
              a: "You manually record cash payment. System adds to invoice. Still automated reconciliation.",
            },
            {
              q: "Can I still use my Excel spreadsheets?",
              a: "You can import old data. But SchoolBase replaces the need for Excel. Better accuracy.",
            },
            {
              q: "What if parent disputes a payment?",
              a: "Show them the receipt in system. Dated, amount, method. All tracked. Dispute resolved.",
            },
            {
              q: "How do I get my end-of-month report?",
              a: "One-click. Select date range. Download as PDF or Excel. Ready for principal in seconds.",
            },
            {
              q: "Is my financial data secure?",
              a: "Yes. Encrypted data. Only you and principal see. Daily automatic backups. Never lost.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <p className="font-semibold text-foreground">{item.q}</p>
              <p className="mt-2 text-sm text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Reclaim 16 Hours Per Week</h2>
          <p className="mt-4 text-lg text-brand/80">
            No more manual invoicing. No more reconciliation hell. Automated collections.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              See Demo
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Schedule Training
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
