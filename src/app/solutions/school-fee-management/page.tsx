import Link from "next/link";
import { FileText, CheckCircle, DollarSign, Users, TrendingUp, Clock } from "lucide-react";

export const metadata = {
  title: "School Fee Management System | SchoolBase",
  description:
    "Complete school fee management solution with automated invoicing, payment tracking, and Paystack integration. Reduce collection time by 40%.",
};

export default function FeesManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">SCHOOL FEE MANAGEMENT</p>
            <h1 className="text-4xl font-bold text-foreground">
              Digital Fee Management for Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              Stop chasing payments. Let SchoolBase automate your fee collection, invoicing,
              and payment tracking. Schools report 40% reduction in overdue fees.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">The School Fee Collection Problem</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Lost Revenue",
              desc: "Manual tracking loses ₦50k-500k annually in overdue fees that go unrecovered",
            },
            {
              title: "Parent Confusion",
              desc: "No transparency = constant parent complaints about what they owe",
            },
            {
              title: "Time Wasted",
              desc: "Bursars spend 20+ hours/week chasing payments instead of reconciling",
            },
            {
              title: "No Records",
              desc: "Paper receipts get lost, creating disputes about who paid what",
            },
            {
              title: "Reconciliation Chaos",
              desc: "Manual spreadsheets don't match actual payments, creating audit nightmares",
            },
            {
              title: "Payment Integration",
              desc: "Schools can't accept online payments, limiting options for busy parents",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Solution Section */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground">How SchoolBase Solves It</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <DollarSign className="h-8 w-8 text-brand" />,
                title: "Automated Invoicing",
                desc: "Generate invoices for multiple students/classes in seconds. Set payment deadlines, track overdue automatically.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Payment Tracking",
                desc: "See who paid, who owes, how much, by when. Real-time dashboard shows collection status.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "Multiple Payment Methods",
                desc: "Accept Paystack (online), bank transfer, cash. All in one place. Automatic reconciliation.",
              },
              {
                icon: <FileText className="h-8 w-8 text-brand" />,
                title: "Auto-Generated Receipts",
                desc: "Parents get instant PDF receipts. Proof of payment. Reduces disputes by 90%.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Parent Portal",
                desc: "Parents see invoices, payment history, outstanding balance. Can pay online directly.",
              },
              {
                icon: <Clock className="h-8 w-8 text-brand" />,
                title: "Time Savings",
                desc: "Reduce billing admin time from 20+ hours/week to 2-3 hours. Focus on strategy.",
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

      {/* Features in Detail */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">Key Features</h2>
        <div className="mt-8 space-y-8">
          {[
            {
              title: "Fee Schedule Management",
              desc: "Create different fee categories (tuition, hostel, activities) by class level. Track partial payments.",
              features: [
                "Multiple fee types per school",
                "By-class and by-student pricing",
                "Payment installments/plans",
                "Discounts and waivers",
              ],
            },
            {
              title: "Automated Reminders",
              desc: "Never lose a payment to forgetfulness. WhatsApp reminders 1 week before, 3 days before, and on due date.",
              features: [
                "Customizable reminder schedule",
                "WhatsApp notifications",
                "SMS option available",
                "Escalation for overdue",
              ],
            },
            {
              title: "Financial Reports",
              desc: "Understand your school's cash flow. See collection by class, by student, by payment method.",
              features: [
                "Collection by class/grade",
                "Payment method breakdown",
                "Outstanding by student",
                "Monthly trends",
              ],
            },
            {
              title: "Paystack Integration",
              desc: "Accept card payments online. Automatic settlement to your bank account (same day).",
              features: [
                "Credit/debit card acceptance",
                "Mobile money ready",
                "Instant notifications",
                "Automatic settlement",
              ],
            },
          ].map((section, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-8">
              <h3 className="text-xl font-semibold text-foreground">{section.title}</h3>
              <p className="mt-2 text-muted">{section.desc}</p>
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {section.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-brand" />
                    <span className="text-sm text-foreground">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Results Schools Have Seen</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { stat: "40%", label: "Reduction in overdue fees" },
              { stat: "20→2h", label: "Weekly billing admin time" },
              { stat: "90%", label: "Reduction in payment disputes" },
              { stat: "80%", label: "Parent adoption in first month" },
              { stat: "₦100k+", label: "Monthly revenue recovered" },
              { stat: "24h", label: "Payment verification time" },
            ].map((item, i) => (
              <div key={i} className="rounded-lg bg-white p-6 text-center">
                <p className="text-3xl font-bold text-brand">{item.stat}</p>
                <p className="mt-2 text-sm text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">Simple, Transparent Pricing</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "₦35,000",
              desc: "Up to 150 pupils",
              features: [
                "✓ Fees & receipts",
                "✓ WhatsApp & SMS",
                "✓ Results & reports",
                "✓ School website",
                "✓ Parent app",
              ],
            },
            {
              name: "Standard",
              price: "₦45,000",
              desc: "Up to 600 pupils",
              features: [
                "✓ Fees & receipts",
                "✓ WhatsApp & SMS",
                "✓ Results & reports",
                "✓ School website",
                "✓ Parent app",
              ],
              highlighted: true,
            },
            {
              name: "Group",
              price: "Talk to us",
              desc: "Multiple campuses",
              features: [
                "✓ Fees & receipts",
                "✓ WhatsApp & SMS",
                "✓ Results & reports",
                "✓ School website",
                "✓ Parent app",
              ],
            },
          ].map((tier, i) => (
            <div
              key={i}
              className={`rounded-lg border p-8 ${
                tier.highlighted
                  ? "border-brand bg-brand/5 ring-2 ring-brand"
                  : "border-border bg-white"
              }`}
            >
              <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
              <p className="mt-2 text-3xl font-bold text-brand">{tier.price}</p>
              <p className="text-sm text-muted">{tier.desc}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full rounded-lg py-2 font-medium transition ${
                  tier.highlighted
                    ? "bg-brand text-white hover:bg-brand/90"
                    : "border border-brand text-brand hover:bg-brand/5"
                }`}
              >
                Start Free Trial
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-4">
            {[
              {
                q: "Can parents pay online?",
                a: "Yes. We're integrated with Paystack, so parents can pay by card, mobile money, or bank transfer. Payment goes directly to your school account.",
              },
              {
                q: "What if a parent loses their receipt?",
                a: "No problem. Receipts are stored in the parent portal forever. They can download anytime.",
              },
              {
                q: "Do we need to train parents?",
                a: "Minimal. Parents get a simple link to the portal. Most learn in their first use. We provide WhatsApp guidance.",
              },
              {
                q: "Can we set payment plans?",
                a: "Yes. SchoolBase supports installment plans. Set the number of payments and due dates.",
              },
              {
                q: "What about refunds?",
                a: "You can issue refunds directly in SchoolBase. Parents see the credit in their account.",
              },
              {
                q: "Is it secure?",
                a: "Yes. All payments are encrypted and processed by Paystack (PCI compliant). Your data is backed up daily.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6">
                <h3 className="font-semibold text-foreground">{item.q}</h3>
                <p className="mt-2 text-sm text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Resources (Internal Linking) */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Learn More</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Related Guide */}
          <Link href="/guides/school-fee-management" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <FileText className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">Fee Management Guide</h3>
            <p className="mt-2 text-sm text-muted">Complete guide to best practices, ROI calculation, and implementation roadmap</p>
          </Link>

          {/* Role-Based Link */}
          <Link href="/for-bursars" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <Users className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">For Bursars</h3>
            <p className="mt-2 text-sm text-muted">Discover how bursars use SchoolBase to automate fee collection and reporting</p>
          </Link>

          {/* Comparison */}
          <Link href="/compare/manual-systems" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <TrendingUp className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">vs Manual Systems</h3>
            <p className="mt-2 text-sm text-muted">See ROI comparison and why digital fee management saves ₦500k+ annually</p>
          </Link>
        </div>

        {/* Country Pricing Links */}
        <h3 className="text-xl font-bold text-foreground mt-12 mb-6">Fee Management in Your Country</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <Link href="/ghana-school-software" className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 hover:bg-brand/5 transition">
            <span className="text-2xl">🇬🇭</span>
            <div className="text-sm">
              <p className="font-semibold">Ghana</p>
              <p className="text-muted">GHS 500/month</p>
            </div>
          </Link>
          <Link href="/nigeria-school-software" className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 hover:bg-brand/5 transition">
            <span className="text-2xl">🇳🇬</span>
            <div className="text-sm">
              <p className="font-semibold">Nigeria</p>
              <p className="text-muted">₦35k/month</p>
            </div>
          </Link>
          <Link href="/kenya-school-software" className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 hover:bg-brand/5 transition">
            <span className="text-2xl">🇰🇪</span>
            <div className="text-sm">
              <p className="font-semibold">Kenya</p>
              <p className="text-muted">KES 4k/month</p>
            </div>
          </Link>
          <Link href="/uganda-school-software" className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 hover:bg-brand/5 transition">
            <span className="text-2xl">🇺🇬</span>
            <div className="text-sm">
              <p className="font-semibold">Uganda</p>
              <p className="text-muted">UGX 150k/month</p>
            </div>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Stop Chasing Payments</h2>
          <p className="mt-4 text-lg text-brand/80">
            Let SchoolBase automate fee collection. Schools see 40% reduction in overdue fees.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Start Free 30-Day Trial
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
