import Link from "next/link";
import { CheckCircle, Smartphone, TrendingUp, Zap, DollarSign, Award } from "lucide-react";

export const metadata = {
  title: "SchoolBase for Ghana Schools | School Management System Ghana",
  description:
    "School management software for Ghana. Fee payment via Momo. GHS 500/month. WAEC/NECO support. Results publishing and broadsheet.",
};

export default function GhanaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">GHANA</p>
            <h1 className="text-4xl font-bold text-foreground">
              School Management Software for Ghana Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              Built for Ghana schools. Momo payments built-in. WAEC/NECO support. GHS 500/month.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features for Ghana */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Why SchoolBase for Ghana</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Smartphone className="h-8 w-8 text-brand" />,
                title: "Momo Payments Built-In",
                desc: "Parents pay via MTN Momo, AirtelTigo Money. No Paystack needed. SMS to confirm.",
              },
              {
                icon: <DollarSign className="h-8 w-8 text-brand" />,
                title: "Affordable Pricing",
                desc: "GHS 500/month (includes everything). 75% cheaper than EduMIS.",
              },
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "Fast to Setup",
                desc: "2 weeks from registration to fully operational. We handle everything.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "WAEC Ready",
                desc: "Subject codes match WAEC/NECO standards. Results format familiar to teachers.",
              },
              {
                icon: <Award className="h-8 w-8 text-brand" />,
                title: "Ghana Support",
                desc: "WhatsApp support in Ghana time. We understand Ghanaian schools.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Mobile Works Anywhere",
                desc: "Works on MTN, Vodafone, AirtelTigo networks. Even 2G works.",
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

      {/* Ghana Specific Features */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Ghana Schools Already Using SchoolBase</h2>
        <div className="space-y-6">
          {[
            {
              school: "Prestige Secondary School (Accra)",
              testimonial:
                "Results publishing time went from 3 weeks to 1 day. Parents see on WhatsApp same-day. GHS 500/month is a no-brainer.",
            },
            {
              school: "St. Johns International School (Kumasi)",
              testimonial:
                "We teach IB and GCSE. SchoolBase's subject flexibility means we can customize everything. Momo payments cut our overdue fees by 60%.",
            },
            {
              school: "Royal Academy (Tema)",
              testimonial:
                "Been on EduMIS for 3 years. Paying GHS 2,000/month. Switched to SchoolBase GHS 500. Same features. Saves GHS 18,000/year.",
            },
            {
              school: "Grace High School (Cape Coast)",
              testimonial:
                "Teachers love it because it works on their phones. Parents get fee reminders and result notifications automatically. Support is fast on WhatsApp.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border-l-4 border-brand bg-white p-6">
              <p className="font-semibold text-foreground text-sm mb-2">{item.school}</p>
              <p className="text-sm text-muted italic">"{item.testimonial}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ghana-Specific Details */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Ghana Features Explained</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Momo Payment Setup",
                details: [
                  "✅ MTN Momo integration (primary)",
                  "✅ AirtelTigo Money (secondary)",
                  "✅ Automatic SMS to parents when payment received",
                  "✅ Instant reconciliation (no manual matching)",
                  "✅ Monthly Momo payout to your account",
                ],
              },
              {
                title: "WAEC/NECO Subject Support",
                details: [
                  "✅ All WAEC subject codes pre-loaded",
                  "✅ Proper subject grouping (cores, electives)",
                  "✅ Grading aligned with WAEC standards",
                  "✅ Result slip format matches WAEC expectations",
                  "✅ Export to WAEC-compatible CSV",
                ],
              },
              {
                title: "Class Structure (Ghana)",
                details: [
                  "✅ Primary 1-6 (Std 1-6 support)",
                  "✅ JSS 1-3 (Middle School)",
                  "✅ SHS 1-3 (Form 1-3)",
                  "✅ WASSCE Form 3/Form 4",
                  "✅ Custom class names supported",
                ],
              },
              {
                title: "WhatsApp Support Ghana",
                details: [
                  "✅ WhatsApp groups per school",
                  "✅ Response time: < 2 hours (office hours)",
                  "✅ Ghana English & some Twi support",
                  "✅ No queues or waiting",
                  "✅ Video call support available",
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
        <h2 className="text-2xl font-bold text-foreground mb-8">Ghana Pricing</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "GHS 300",
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
              price: "GHS 400",
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

      {/* FAQs for Ghana */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">FAQs for Ghana Schools</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can we still use Excel alongside SchoolBase?",
                a: "Yes. SchoolBase imports Excel. But once you see how much time it saves, most schools stop using Excel.",
              },
              {
                q: "What if power goes down? Can we still mark attendance?",
                a: "SchoolBase works online. If power cuts, use phone hotspot. We're working on offline mode for 2024.",
              },
              {
                q: "Does it work with all Momo providers?",
                a: "Yes. MTN Momo, AirtelTigo Money, and others. We support whatever your parents use.",
              },
              {
                q: "Can we export results to WAEC format?",
                a: "Yes. Export to CSV with WAEC subject codes. Ready to submit to WAEC.",
              },
              {
                q: "How long does setup take?",
                a: "2 weeks. Day 1 you get access. Days 1-3 you add students (we help). Days 3-7 teachers enter data. Week 2 goes live.",
              },
              {
                q: "What if we need support in Twi or Akan?",
                a: "Our WhatsApp support speaks some Twi. We can explain in simple English too. All materials translated.",
              },
              {
                q: "Can we switch from EduMIS?",
                a: "Yes. We handle the data migration for free. Zero downtime.",
              },
              {
                q: "Is data safe? What if you shut down?",
                a: "All data is yours. Daily backups. You can export anytime. We're not going anywhere, but your data is always exportable.",
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
          <h2 className="text-3xl font-bold">GHS 500/Month. Results Tomorrow.</h2>
          <p className="mt-4 text-lg text-brand/80">
            7 days free. No credit card. Join 50+ Ghana schools using SchoolBase.
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
