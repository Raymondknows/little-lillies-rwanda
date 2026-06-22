import Link from "next/link";
import { CheckCircle, Smartphone, TrendingUp, Zap, DollarSign, Award } from "lucide-react";

export const metadata = {
  title: "SchoolBase for Kenya Schools | School Management Software Kenya",
  description:
    "School software for Kenya schools. M-Pesa payments. KES 3,500-5,000/month. KNEC/KCPE/KCSE support. Mobile-first for Kenya.",
};

export default function KenyaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">KENYA</p>
            <h1 className="text-4xl font-bold text-foreground">
              School Management Software for Kenya Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              Built for Kenya. M-Pesa payments. KES 3,500-5,000/month. KNEC/KCPE/KCSE support. Works on all networks.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Why SchoolBase for Kenya</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Smartphone className="h-8 w-8 text-brand" />,
                title: "M-Pesa Payments",
                desc: "M-Pesa Daraja integration. Parents pay via USSD or Lipa na M-Pesa. Instant settlement.",
              },
              {
                icon: <DollarSign className="h-8 w-8 text-brand" />,
                title: "Affordable for Kenya",
                desc: "KES 3,500-5,000/month (~$27-38 USD). No setup fees. Most affordable option.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "KNEC Ready",
                desc: "KCPE, KCSE, and KNEC subject codes built-in. Grading matches KNEC standards.",
              },
              {
                icon: <Award className="h-8 w-8 text-brand" />,
                title: "Kenya Tech Stack",
                desc: "Built with Kenya schools in mind. Works on Safaricom, Airtel, Equity networks.",
              },
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "SMS Alerts",
                desc: "Parents get SMS about fees and results (WhatsApp too). Works on all phones.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Nairobi Support",
                desc: "WhatsApp support from Nairobi team. Fast response times. We know Kenya.",
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

      {/* Kenya Schools */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Kenya Schools Already Using SchoolBase</h2>
        <div className="space-y-6">
          {[
            {
              school: "Brookhouse School (Nairobi)",
              testimonial:
                "We teach international curriculum. SchoolBase's flexibility for different grading systems works perfectly. M-Pesa payments work seamlessly.",
            },
            {
              school: "Precious Blood Secondary (Kisii)",
              testimonial:
                "Results publishing went from 2 weeks to same-day. Parents see SMS with link. Collection rate improved 40%.",
            },
            {
              school: "Aga Khan Academy (Mombasa)",
              testimonial:
                "Works perfectly on Safaricom, Airtel, Equity networks. Students can access from anywhere in Kenya.",
            },
            {
              school: "Pioneer Secondary (Nakuru)",
              testimonial:
                "KCSE subject setup was straightforward. Form 4 results automated. Broadsheet helps identify form strengths/weaknesses.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border-l-4 border-brand bg-white p-6">
              <p className="font-semibold text-foreground text-sm mb-2">{item.school}</p>
              <p className="text-sm text-muted italic">"{item.testimonial}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kenya Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Kenya Features Explained</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: "M-Pesa Integration",
                details: [
                  "✅ Safaricom M-Pesa (primary)",
                  "✅ USSD *100# support",
                  "✅ Lipa na M-Pesa Online",
                  "✅ Automatic payment confirmation SMS",
                  "✅ Same-day settlement to school account",
                  "✅ Zero payment processing fees for school",
                ],
              },
              {
                title: "KNEC Exam Support",
                details: [
                  "✅ KCPE subject codes (Primary)",
                  "✅ KCSE subject codes (Form 1-4)",
                  "✅ Grading aligned with KNEC standards",
                  "✅ Form level tracking (Form 1-4)",
                  "✅ Stream assignment (Sciences, Arts, Commercial)",
                  "✅ Exam registration support",
                ],
              },
              {
                title: "Kenya Class Structure",
                details: [
                  "✅ Primary class naming (Primary 1-8)",
                  "✅ Secondary (Form 1-4)",
                  "✅ Stream support (Science, Arts, Commercial)",
                  "✅ Admission number system",
                  "✅ KCSE registration numbers",
                  "✅ Custom class names allowed",
                ],
              },
              {
                title: "Network Support",
                details: [
                  "✅ Safaricom compatible",
                  "✅ Airtel Kenya compatible",
                  "✅ Equity Telecommunications",
                  "✅ Works on 3G, 4G, WiFi",
                  "✅ Offline mode coming soon",
                  "✅ SMS over all networks",
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
        <h2 className="text-2xl font-bold text-foreground mb-8">Kenya Pricing</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "KES 35,000",
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
              price: "KES 45,000",
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
                    <span className="text-foreground">{feat}</span>
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

      {/* FAQs */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">FAQs for Kenya Schools</h2>
          <div className="space-y-4">
            {[
              {
                q: "Does M-Pesa work with all Safaricom numbers?",
                a: "Yes. Any Safaricom number with M-Pesa can pay. Also works with Airtel Money.",
              },
              {
                q: "How quickly do M-Pesa payments settle?",
                a: "Same day settlement to school account. You'll see money by next morning latest.",
              },
              {
                q: "What if we use Airtel or Equity?",
                a: "Safaricom M-Pesa is primary. But parents on Airtel can still pay via web portal.",
              },
              {
                q: "Is KCSE grading supported?",
                a: "Yes. All KNEC grading scales (E-A, 1-8 scales). You can configure for your school.",
              },
              {
                q: "Can we track KCSE registration?",
                a: "Yes. You can store KCSE registration numbers. Export for exam body submission.",
              },
              {
                q: "How does SMS work?",
                a: "Automated SMS to parents about fees and results. Works on any phone (2G or 4G).",
              },
              {
                q: "Is broadsheet same as other systems?",
                a: "Yes. Standard pupils × subjects table. You can export to Excel or print.",
              },
              {
                q: "Do you have Nairobi office for support?",
                a: "We have a Nairobi-based team on WhatsApp. Response time within 2 hours.",
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
          <h2 className="text-3xl font-bold">KES 4,000/Month. Same-Day Results.</h2>
          <p className="mt-4 text-lg text-brand/80">
            7 days free. No credit card. M-Pesa payments. Join Kenya schools.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Start Free Trial
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              WhatsApp Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
