import Link from "next/link";
import { CheckCircle, Zap, BarChart3, Users, FileText, TrendingDown, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Digital Result Management System | SchoolBase",
  description:
    "Manage student results digitally with automatic grading, class positioning, and automated parent reports. Teachers report 3x faster entry.",
};

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">DIGITAL RESULTS</p>
            <h1 className="text-4xl font-bold text-foreground">
              Digital Result Management for Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              Stop using paper result sheets. SchoolBase manages results digitally with automatic
              grading, instant reports, and class positioning. Teachers enter results 3x faster.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">The Results Management Problem</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Time Wasted",
              desc: "Teachers spend hours calculating grades, percentages, and positions manually",
            },
            {
              title: "Human Errors",
              desc: "Manual calculations = calculation errors, typos, inconsistent grades",
            },
            {
              title: "Lost Results",
              desc: "Paper result sheets get lost, damaged, or filed incorrectly",
            },
            {
              title: "No History",
              desc: "Hard to track student progress across terms without digital records",
            },
            {
              title: "Delayed Reports",
              desc: "Takes days/weeks to compile and print results. Parents wait for feedback.",
            },
            {
              title: "Accountability Gap",
              desc: "No audit trail of who entered what and when. Difficult compliance.",
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
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "Fast Result Entry",
                desc: "Simple form-based entry. Teachers enter marks once, system handles all calculations.",
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-brand" />,
                title: "Automatic Grading",
                desc: "Grades calculated automatically based on your school's grading scale. No manual work.",
              },
              {
                icon: <FileText className="h-8 w-8 text-brand" />,
                title: "Instant Reports",
                desc: "Generate professional result reports in seconds. Parents see them immediately.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Class Positioning",
                desc: "Automatic ranking by total score. Shows position in class for each student.",
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-brand" />,
                title: "Class Broadsheet",
                desc: "Pupils × Subjects matrix. See all results at a glance. Export to CSV/PDF.",
              },
              {
                icon: <TrendingDown className="h-8 w-8 text-brand" />,
                title: "Progress Tracking",
                desc: "Compare results term-to-term. Identify struggling students automatically.",
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

      {/* Features */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">Key Features</h2>
        <div className="mt-8 space-y-8">
          {[
            {
              title: "Assessment Management",
              desc: "Create different assessment types (tests, exams, projects) with different weightings.",
              features: [
                "Create/edit assessments",
                "Set scoring ranges",
                "Configure grading scale",
                "Multiple subject support",
              ],
            },
            {
              title: "Result Entry",
              desc: "Teachers enter marks for their subjects. System handles all calculations automatically.",
              features: [
                "Simple form-based entry",
                "Real-time validation",
                "Subject-specific grading",
                "Bulk import support",
              ],
            },
            {
              title: "Automatic Calculations",
              desc: "No manual work needed. System calculates: total, average, grade, position.",
              features: [
                "Grade calculation",
                "Position/ranking",
                "Class averages",
                "Subject statistics",
              ],
            },
            {
              title: "Professional Reports",
              desc: "Generate result cards, transcripts, and reports. Print or share digitally.",
              features: [
                "Result cards",
                "Transcripts",
                "Progress reports",
                "Customizable layouts",
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

      {/* Results */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Results Schools Have Seen</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { stat: "3x", label: "Faster result entry" },
              { stat: "0", label: "Calculation errors" },
              { stat: "24h", label: "Time to print reports" },
              { stat: "100%", label: "Teacher adoption" },
              { stat: "0", label: "Lost result sheets" },
              { stat: "95%", label: "Parent satisfaction" },
            ].map((item, i) => (
              <div key={i} className="rounded-lg bg-white p-6 text-center">
                <p className="text-3xl font-bold text-brand">{item.stat}</p>
                <p className="mt-2 text-sm text-muted">{item.label}</p>
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
          <Link href="/guides/digital-report-cards" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <FileText className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">Digital Report Cards Guide</h3>
            <p className="mt-2 text-sm text-muted">Design, implementation roadmap, and parent communication best practices</p>
          </Link>

          {/* Role-Based Link */}
          <Link href="/for-teachers" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <Users className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">For Teachers</h3>
            <p className="mt-2 text-sm text-muted">How teachers quickly enter results, approve marks, and share with parents</p>
          </Link>

          {/* Broadsheet (Related Solution) */}
          <Link href="/solutions/school-broadsheet" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <TrendingUp className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">School Broadsheet</h3>
            <p className="mt-2 text-sm text-muted">Powerful analytics and reporting on student performance across classes</p>
          </Link>
        </div>

        {/* Industry Links */}
        <h3 className="text-xl font-bold text-foreground mt-12 mb-6">Results Management by School Type</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/industries/secondary-schools" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h4 className="font-semibold text-foreground mb-2">🎓 Secondary Schools</h4>
            <p className="text-sm text-muted">Multi-subject streaming, exam board tracking (WAEC/NECO/KCSE)</p>
          </Link>
          <Link href="/industries/international-schools" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h4 className="font-semibold text-foreground mb-2">🌍 International Schools</h4>
            <p className="text-sm text-muted">IB, IGCSE, Cambridge support with multi-language reports</p>
          </Link>
          <Link href="/industries/early-childhood-centers" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <h4 className="font-semibold text-foreground mb-2">👶 Early Childhood</h4>
            <p className="text-sm text-muted">Development milestone tracking and parent updates</p>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Digitize Your Results Today</h2>
          <p className="mt-4 text-lg text-brand/80">
            Teachers spend less time on admin, more time on teaching. Parents get results same day.
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
