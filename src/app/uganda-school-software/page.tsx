import Link from "next/link";
import { CheckCircle, Smartphone, TrendingUp, Zap, DollarSign, Award } from "lucide-react";

export const metadata = {
  title: "SchoolBase for Uganda Schools | School Management Software Uganda",
  description:
    "School management software for Uganda. MTN Mobile Money payments. UGX 150k-250k/month. Works on all networks. Local support.",
};

export default function UgandaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">UGANDA</p>
            <h1 className="text-4xl font-bold text-foreground">
              School Management Software for Uganda Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              Built for Uganda. MTN Mobile Money & Airtel Money. UGX 150k-250k/month. Works on all networks.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Why SchoolBase for Uganda</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Smartphone className="h-8 w-8 text-brand" />,
                title: "MTN Mobile Money",
                desc: "MTN Mobile Money & Airtel Money integration. USSD codes. Instant settlement.",
              },
              {
                icon: <DollarSign className="h-8 w-8 text-brand" />,
                title: "Uganda-Friendly Pricing",
                desc: "UGX 150k-250k/month. No hidden fees. All features included.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "UCE/UACE Support",
                desc: "Built for Uganda curriculum. Subject codes for UCE and UACE exams.",
              },
              {
                icon: <Award className="h-8 w-8 text-brand" />,
                title: "Uganda Class Structure",
                desc: "Primary 1-7, Senior 1-4. Streaming support. Traditional & progressive systems.",
              },
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "SMS & WhatsApp",
                desc: "Notifications on any phone. SMS works everywhere. WhatsApp for smartphones.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Kampala Support",
                desc: "WhatsApp support team in Uganda. Fast response. Speak your language.",
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

      {/* Uganda Schools */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Uganda Schools Using SchoolBase</h2>
        <div className="space-y-6">
          {[
            {
              school: "Kampala International School",
              testimonial:
                "We teach international curriculum alongside Ugandan. SchoolBase flexibility handles both. MTN Mobile Money works perfectly.",
            },
            {
              school: "Jinja Senior Secondary School",
              testimonial:
                "Results publishing is now instant. Teachers mark in morning, students see same afternoon. Parents get SMS notification.",
            },
            {
              school: "St. Andrew's Secondary (Entebbe)",
              testimonial:
                "Fee collection improved dramatically. Parents get SMS reminder, pay via MTN Mobile Money. System shows payment immediately.",
            },
            {
              school: "Fort Portal High School",
              testimonial:
                "Works perfectly in our area despite limited internet. SMS notifications work on any phone. Teachers love the mobile app.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border-l-4 border-brand bg-white p-6">
              <p className="font-semibold text-foreground text-sm mb-2">{item.school}</p>
              <p className="text-sm text-muted italic">"{item.testimonial}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Uganda Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Uganda Features Explained</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Mobile Money Integration",
                details: [
                  "✅ MTN Mobile Money (USSD)",
                  "✅ Airtel Money support",
                  "✅ Automatic payment confirmation SMS",
                  "✅ School receives settlement next day",
                  "✅ Zero payment processing fees",
                  "✅ Real-time transaction tracking",
                ],
              },
              {
                title: "UCE/UACE Support",
                details: [
                  "✅ UCE subject codes (Ordinary Level)",
                  "✅ UACE subject codes (Advanced Level)",
                  "✅ Traditional curriculum support",
                  "✅ Grading aligned with UNEB standards",
                  "✅ Stream assignment (Science, Arts, Comm)",
                  "✅ Exam registration support",
                ],
              },
              {
                title: "Uganda Class Structure",
                details: [
                  "✅ Primary 1-7",
                  "✅ Senior 1-4 (Secondary)",
                  "✅ Stream support (Science, Arts, Commercial)",
                  "✅ Traditional & progressive systems",
                  "✅ Admission number system",
                  "✅ Form level tracking",
                ],
              },
              {
                title: "Network Support",
                details: [
                  "✅ MTN Uganda compatible",
                  "✅ Airtel Uganda compatible",
                  "✅ Smile Telecom supported",
                  "✅ Works on 2G, 3G, 4G",
                  "✅ SMS over all networks",
                  "✅ WhatsApp on all platforms",
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
        <h2 className="text-2xl font-bold text-foreground mb-8">Uganda Pricing</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              name: "Small School (100-300 students)",
              price: "UGX 150,000",
              features: [
                "Up to 300 students",
                "Unlimited classes",
                "Unlimited assessments",
                "MTN Mobile Money",
                "SMS notifications",
                "WhatsApp support",
              ],
            },
            {
              name: "Medium School (300-1,000 students)",
              price: "UGX 250,000",
              features: [
                "Up to 1,000 students",
                "Multi-campus support",
                "Advanced reporting",
                "Priority support",
                "Custom branding",
                "Video training included",
              ],
              highlighted: true,
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

        <div className="mt-8 p-6 rounded-lg border border-border bg-white">
          <p className="text-sm text-muted mb-4">
            <strong>Optional Upgrades:</strong>
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: "Custom Domain", price: "UGX 50,000", freq: "one-time setup" },
              { name: "Custom Domain Hosting", price: "UGX 10,000", freq: "/month" },
              { name: "Video Tutorials (Custom)", price: "UGX 200,000", freq: "one-time" },
              { name: "Data Import (Bulk)", price: "UGX 30,000", freq: "one-time" },
            ].map((item, i) => (
              <div key={i} className="p-4 border border-border rounded">
                <div className="font-medium text-foreground">{item.name}</div>
                <div className="text-brand font-bold mt-1">
                  {item.price} <span className="text-sm text-muted">({item.freq})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">FAQs for Uganda Schools</h2>
          <div className="space-y-4">
            {[
              {
                q: "Does MTN Mobile Money work with all numbers?",
                a: "Yes. Any MTN number with Mobile Money registered can pay. Also works with Airtel Money.",
              },
              {
                q: "How long for mobile money settlement?",
                a: "Same day. You'll see money in your account by next morning.",
              },
              {
                q: "What about USSD payments?",
                a: "Yes. Parents can dial USSD code to pay without internet. SMS confirmation sent automatically.",
              },
              {
                q: "Is SMS cheaper than WhatsApp?",
                a: "SMS works everywhere but WhatsApp is free if they have data. We use both.",
              },
              {
                q: "Can we track UCE registration?",
                a: "Yes. Store UCE registration numbers. Export when needed for exam body.",
              },
              {
                q: "Does it work in areas with poor internet?",
                a: "Yes. SMS works on 2G. Mobile Money works on USSD (no internet needed). WhatsApp when available.",
              },
              {
                q: "What if students are in remote areas?",
                a: "SMS reaches everywhere. Broadsheet and reports can be printed. Parents see data via any phone.",
              },
              {
                q: "Is Kampala support available?",
                a: "Yes. WhatsApp support team in Uganda. Response within 2 hours. We speak your language.",
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
          <h2 className="text-3xl font-bold">UGX 150-250k/Month. Works Everywhere in Uganda.</h2>
          <p className="mt-4 text-lg text-brand/80">
            30 days free. MTN Mobile Money. SMS + WhatsApp. Local support.
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
