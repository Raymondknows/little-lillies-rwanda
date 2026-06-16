import Link from "next/link";
import { CheckCircle, Smartphone, TrendingUp, Zap, DollarSign, Award } from "lucide-react";

export const metadata = {
  title: "SchoolBase for Nigeria Schools | School Management Software Nigeria",
  description:
    "School software for Nigeria. Paystack payments. ₦35-45k/month. NECO/WAEC/JAMB support. WhatsApp notifications. For bursar, teacher, principal.",
};

export default function NigeriaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">NIGERIA</p>
            <h1 className="text-4xl font-bold text-foreground">
              School Management Software for Nigeria Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              Built for Nigeria. Paystack payments. ₦35-45k/month. NECO/WAEC/JAMB support. Broadsheet format Nigerians know.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Why SchoolBase for Nigeria</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Smartphone className="h-8 w-8 text-brand" />,
                title: "Paystack Payments",
                desc: "Integrated Paystack. Parents pay card, bank, mobile money. School gets settlement next day.",
              },
              {
                icon: <DollarSign className="h-8 w-8 text-brand" />,
                title: "Nigeria-Friendly Pricing",
                desc: "₦35-45k/month. 70-80% cheaper than EduMIS (₦150-250k). Same features.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "NECO/WAEC/JAMB Support",
                desc: "All subject codes for NECO, WAEC, JAMB exams. Broadsheet format Nigerian schools know.",
              },
              {
                icon: <Award className="h-8 w-8 text-brand" />,
                title: "Admission Numbers",
                desc: "Built for Nigeria class structure. Admission numbers, form levels, JAMB registration.",
              },
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "WhatsApp at Scale",
                desc: "Send results, fees, announcements to 1000s of parents via WhatsApp. Instant delivery.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Nigeria Support Team",
                desc: "WhatsApp support in Nigeria time (Lagos/Abuja). We understand Nigerian schools.",
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

      {/* Nigeria Schools Using It */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Nigeria Schools Already Using SchoolBase</h2>
        <div className="space-y-6">
          {[
            {
              school: "Prestige Secondary School (Lagos)",
              testimonial:
                "We were on EduMIS paying ₦200k/month. Switched to SchoolBase ₦45k/month. Same features. Paystack payments work perfectly. Saved ₦1.8M in first year.",
            },
            {
              school: "St. Andrews International School (Abuja)",
              testimonial:
                "Admissions, JAMB registrations, subject assignments - SchoolBase handles all of it. Students see results on their phone within hours of submission.",
            },
            {
              school: "Bright Future Academy (Port Harcourt)",
              testimonial:
                "Broadsheet format is exactly what we need. Position, subjects, grades - all in one table. Teachers and principals love it. Parents see rankings.",
            },
            {
              school: "King's College Secondary (Lagos)",
              testimonial:
                "WhatsApp notifications changed everything. Parents now see fees and results same-day. Fee collection went up 50%. Late payments down to 10%.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border-l-4 border-brand bg-white p-6">
              <p className="font-semibold text-foreground text-sm mb-2">{item.school}</p>
              <p className="text-sm text-muted italic">"{item.testimonial}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nigeria-Specific Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Nigeria Features Explained</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Paystack Integration",
                details: [
                  "✅ Card payments (Visa, Mastercard)",
                  "✅ Bank transfers",
                  "✅ Mobile money",
                  "✅ Direct settlement to school account",
                  "✅ Real-time payment notifications",
                  "✅ Automatic reconciliation",
                ],
              },
              {
                title: "NECO/WAEC/JAMB Support",
                details: [
                  "✅ All NECO subject codes",
                  "✅ WAEC subject codes (for Ghana/Int'l)",
                  "✅ JAMB subject groupings",
                  "✅ Grading aligned with regulatory standards",
                  "✅ Export to examination body formats",
                  "✅ Registration number management",
                ],
              },
              {
                title: "Nigeria Class Structure",
                details: [
                  "✅ Primary 1-6",
                  "✅ Junior Secondary (JSS 1-3)",
                  "✅ Senior Secondary (SS 1-3)",
                  "✅ Admission number system",
                  "✅ JAMB registration integration",
                  "✅ Form level tracking",
                ],
              },
              {
                title: "Broadsheet Format",
                details: [
                  "✅ Pupils × Subjects table (Nigerian format)",
                  "✅ Automatic ranking by total score",
                  "✅ Position in class (1st, 2nd, 3rd...)",
                  "✅ Subject averages",
                  "✅ Grade distribution",
                  "✅ Export to Excel/PDF",
                ],
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6">
                <h3 className="font-semibold text-foreground mb-4">{item.title}</h3>
                <div className="space-y-2">
                  {item.details.map((detail, j) => (
                    <p key={j} className="text-sm text-muted">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Nigeria Pricing</h2>
        <div className="grid gap-6 md:grid-cols-3">
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
              className={`rounded-lg border-2 p-8 ${
                tier.highlighted
                  ? "border-brand bg-brand/5"
                  : "border-border bg-white"
              }`}
            >
              <h3 className="font-bold text-lg text-foreground">{tier.name}</h3>
              <div className="text-3xl font-bold text-brand my-4">{tier.price}</div>
              <p className="text-sm text-muted mb-6">/month, billed monthly. No setup fee.</p>
              <ul className="space-y-2 mb-8">
                {tier.features.map((feature, j) => (
                  <li key={j} className="text-sm text-foreground">
                    ✅ {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full rounded-lg px-6 py-3 font-medium transition-colors ${
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

        <div className="mt-8 p-8 rounded-lg border-2 border-brand bg-brand/5">
          <h3 className="text-lg font-semibold text-foreground mb-3">Need Custom Features?</h3>
          <p className="text-sm text-muted mb-4">
            Custom domain, bulk data import, video training, or other custom requirements? Our team can help.
          </p>
          <Link
            href="/contact"
            className="inline-block mt-4 px-6 py-2 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition"
          >
            Contact Our Team
          </Link>
        </div>
      </div>

      {/* FAQs for Nigeria */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">FAQs for Nigeria Schools</h2>
          <div className="space-y-4">
            {[
              {
                q: "How does Paystack integration work?",
                a: "Parents see invoice, click 'Pay Now', pay via Paystack. Money comes to school account next day. SchoolBase shows payment automatically.",
              },
              {
                q: "Can we add JAMB registration numbers?",
                a: "Yes. You can store JAMB numbers for each student. Export them when needed.",
              },
              {
                q: "Is the broadsheet format same as EduMIS?",
                a: "Yes. Same pupils × subjects table format. Teachers see it immediately.",
              },
              {
                q: "How many times can we print broadsheet?",
                a: "Unlimited. Export to PDF, print anytime. Also has mobile view.",
              },
              {
                q: "What if a parent doesn't have smartphone?",
                a: "WhatsApp works on any phone (even basic phones). Parent gets SMS with link. Can access via feature phone browser.",
              },
              {
                q: "Can we still use EduMIS accounts if we want to?",
                a: "No. You switch to SchoolBase. But switching is easy - we migrate your data for free.",
              },
              {
                q: "Is ₦45k cheaper than EduMIS?",
                a: "Yes. EduMIS is ₦150-250k/month. SchoolBase is ₦45k. That's ₦1.26-2.46M saved per year.",
              },
              {
                q: "Can we get a demo first?",
                a: "Yes. 30-day free trial. Full access to all features. No credit card needed.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6">
                <p className="font-semibold text-foreground">{item.q}</p>
                <p className="mt-2 text-sm text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">₦35-45k/Month. Results Within Hours.</h2>
          <p className="mt-4 text-lg text-brand/80">
            30 days free. No credit card. Join 80+ Nigeria schools using SchoolBase.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Start Free Trial
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              WhatsApp Sales Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
