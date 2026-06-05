import Link from "next/link";
import { Globe, TrendingUp, Users, CheckCircle } from "lucide-react";

export const metadata = {
  title: "SchoolBase for International Schools | IB/IGCSE/Cambridge",
  description:
    "Solutions for international schools: multiple curricula support, multi-currency, parent communication in multiple languages.",
};

export default function InternationalSchoolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">FOR INTERNATIONAL SCHOOLS</p>
            <h1 className="text-4xl font-bold text-foreground">
              Management Software for International Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              IB/IGCSE/Cambridge support. Multi-currency. Multiple languages. International parent base. Complex curricula made simple.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Unique Complexity of International Schools</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Multiple Curricula",
              desc: "Some students on IB. Some on IGCSE. Some on Cambridge. Different grading scales.",
            },
            {
              title: "Multi-Currency",
              desc: "Fees in USD, GBP, EUR, or local currency. Tuition in one currency, uniforms in another.",
            },
            {
              title: "International Parent Base",
              desc: "Parents on different continents. Time zone challenges for communication.",
            },
            {
              title: "Language Needs",
              desc: "English primary but parents may speak different languages. Translation needs.",
            },
            {
              title: "Accreditation Requirements",
              desc: "IB/Cambridge/IGCSE have specific reporting requirements and timelines.",
            },
            {
              title: "Expatriate Support",
              desc: "Visas, work permits, relocation paperwork. System needs to accommodate.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Features for International Schools</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Globe className="h-8 w-8 text-brand" />,
                title: "Multi-Curriculum Support",
                desc: "IB, IGCSE, Cambridge, AP, or local curriculum. Student switches? System adjusts.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "Multi-Currency",
                desc: "Define fees in any currency. Conversion rates automatic. Reports in any currency.",
              },
              {
                icon: <Globe className="h-8 w-8 text-brand" />,
                title: "Multi-Language Support",
                desc: "System UI in multiple languages. Parent communication in their language.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "International Reporting",
                desc: "IB predictions. IGCSE projected grades. Compliance reports. All automated.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Time Zone Handling",
                desc: "Parents in different zones? System handles all time zone conversions.",
              },
              {
                icon: <Globe className="h-8 w-8 text-brand" />,
                title: "Accreditation Ready",
                desc: "Pre-built reports for IB, Cambridge, IGCSE audits. Compliance documentation.",
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

      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Curriculum Support Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-4 font-semibold">Curriculum</th>
                <th className="text-center p-4 font-semibold">Grading Support</th>
                <th className="text-center p-4 font-semibold">Reporting</th>
                <th className="text-center p-4 font-semibold">Accreditation</th>
              </tr>
            </thead>
            <tbody>
              {[
                { curr: "IB (International Baccalaureate)", grade: "7-point scale", report: "Predicted grades, transcripts", accred: "✅ IB-ready" },
                { curr: "IGCSE (Cambridge)", grade: "9-1 scale", report: "Projected grades", accred: "✅ Cambridge-ready" },
                { curr: "AP (Advanced Placement)", grade: "5-point scale", report: "AP scores projected", accred: "✅ AP-compliant" },
                { curr: "A-Levels", grade: "A*-E scale", report: "Grade predictions", accred: "✅ A-Level ready" },
                { curr: "Local Curriculum", grade: "Custom", report: "Custom reports", accred: "✅ Flexible" },
              ].map((item, i) => (
                <tr key={i} className="border-b border-border hover:bg-brand/5">
                  <td className="p-4 font-medium">{item.curr}</td>
                  <td className="text-center p-4 text-muted">{item.grade}</td>
                  <td className="text-center p-4 text-muted">{item.report}</td>
                  <td className="text-center p-4">{item.accred}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">What International School Heads Say</h2>
          <div className="space-y-6">
            {[
              {
                school: "International School of Excellence",
                testimonial:
                  "We teach IB and Cambridge in different year groups. SchoolBase handles both seamlessly. Grading, reporting, accreditation all taken care of.",
              },
              {
                school: "Global Leadership Academy",
                testimonial:
                  "Having parents across 20 countries in 15 different time zones was a nightmare. SchoolBase manages all time zones and can communicate in parents' languages.",
              },
              {
                school: "World School (Multi-Campus)",
                testimonial:
                  "Multi-currency fees (USD, GBP, Local). Multi-location. SchoolBase consolidated everything. Now one system across both campuses.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border-l-4 border-brand bg-white p-6">
                <p className="font-semibold text-foreground text-sm mb-2">{item.school}</p>
                <p className="text-muted text-sm italic">"{item.testimonial}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Accreditation & Compliance</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Pre-Audit Reports",
              desc: "IB/Cambridge/IGCSE require specific documentation. SchoolBase pre-generates all required reports.",
            },
            {
              title: "Compliance Tracking",
              desc: "Audit trails for all grades, admissions, records. Proof for accreditation bodies.",
            },
            {
              title: "Deadlines",
              desc: "System tracks accreditation deadlines. Reminders for registration, reporting, submission.",
            },
            {
              title: "Multi-School Reporting",
              desc: "System consolidates data from multiple campuses for group-level accreditation.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Built for International Excellence</h2>
          <p className="mt-4 text-lg text-brand/80">
            Multi-curriculum, multi-currency, multi-language. Accreditation-ready.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Schedule Demo
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
