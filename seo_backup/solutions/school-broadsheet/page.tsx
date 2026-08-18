import Link from "next/link";
import { Table2, Download, Eye, BarChart3, CheckCircle, Users, FileText, TrendingUp } from "lucide-react";

export const metadata = {
  title: "School Broadsheet Software | SchoolBase",
  description:
    "View all student results in one table (pupils × subjects). Export to CSV/PDF. Identify top/bottom performers instantly. Professional reporting.",
};

export default function BroadsheetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">SCHOOL BROADSHEET</p>
            <h1 className="text-4xl font-bold text-foreground">
              Digital School Broadsheet Software
            </h1>
            <p className="mt-4 text-lg text-muted">
              View all class results in one table. Every student × every subject. Export to CSV/PDF.
              Identify top/bottom performers. Make data-driven decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">The Broadsheet Problem</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Manual Compilation",
              desc: "Creating broadsheet by hand takes hours. Compile results from different sources manually.",
            },
            {
              title: "Errors in Ranking",
              desc: "Miscalculations when ranking students. Positions don't match actual totals.",
            },
            {
              title: "Hard to Analyze",
              desc: "Can't easily see which subjects are weak or which students are struggling.",
            },
            {
              title: "Difficult to Share",
              desc: "Broadsheet on paper. Hard to share with stakeholders. Parents can't see their place.",
            },
            {
              title: "No Subject Stats",
              desc: "Hard to calculate class average by subject or see per-subject performance.",
            },
            {
              title: "Not Mobile-Friendly",
              desc: "Broadsheet on paper doesn't work on phones. Teachers can't check results on the go.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Solution */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground">How SchoolBase Broadsheet Works</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Table2 className="h-8 w-8 text-brand" />,
                title: "Instant Broadsheet View",
                desc: "All pupils × all subjects in one table. No manual compilation needed.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Automatic Ranking",
                desc: "Students ranked by total score automatically. No calculation errors.",
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-brand" />,
                title: "Subject Analytics",
                desc: "See class average per subject. Identify weak subjects instantly.",
              },
              {
                icon: <Eye className="h-8 w-8 text-brand" />,
                title: "Mobile View",
                desc: "Access broadsheet on phone. Swipeable table for all screen sizes.",
              },
              {
                icon: <Download className="h-8 w-8 text-brand" />,
                title: "Export Options",
                desc: "Export to CSV or PDF for sharing with parents/stakeholders.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Data-Driven Insights",
                desc: "Quickly identify top performers and students needing support.",
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

      {/* What's Included */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">Broadsheet Features</h2>
        <div className="mt-8 space-y-6">
          {[
            {
              title: "Pupils × Subjects Matrix",
              desc: "Every student on rows, every subject on columns. See entire class picture at once.",
            },
            {
              title: "Automatic Ranking",
              desc: "Pupils ranked by total score. Handles tie-breaking correctly. Position shown for each student.",
            },
            {
              title: "Subject Statistics",
              desc: "Average score per subject, highest score, lowest score. Identify strong/weak subjects.",
            },
            {
              title: "Class Statistics",
              desc: "Overall class average, pass rate, grade distribution.",
            },
            {
              title: "Sortable & Filterable",
              desc: "Sort by position, by subject, by score. Filter by performance range.",
            },
            {
              title: "Export to CSV/PDF",
              desc: "Download broadsheet for Excel, printing, or sharing with parents.",
            },
            {
              title: "Mobile Responsive",
              desc: "Swipeable table on mobile. View on any screen size. All columns visible.",
            },
            {
              title: "Print-Friendly Design",
              desc: "Professional layout for printing. Fits on page properly with all data.",
            },
          ].map((feature, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground">How Schools Use Broadsheet</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Class Performance Review",
                desc: "Principal reviews broadsheet to see class-level performance. Identifies weak classes.",
              },
              {
                title: "Subject Curriculum Planning",
                desc: "Teachers see subject performance. Plan interventions for topics with low scores.",
              },
              {
                title: "Intervention Targeting",
                desc: "Identify bottom 10% of students. Target them for extra support.",
              },
              {
                title: "Parent Reporting",
                desc: "Show parents where their child ranked in class. Motivates improvement.",
              },
              {
                title: "Stakeholder Meetings",
                desc: "Present broadsheet to board/parents. Show academic progress term-to-term.",
              },
              {
                title: "Data Analysis",
                desc: "Export to Excel for custom analysis. Combine with other school data.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">Results Schools Report</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { stat: "30min", label: "Time saved per broadsheet" },
            { stat: "0", label: "Calculation errors" },
            { stat: "100%", label: "Visibility into class data" },
            { stat: "40%", label: "Improvement in weak subjects" },
            { stat: "3x", label: "Faster decision making" },
            { stat: "80%", label: "Of data-driven decisions" },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-white p-6 text-center">
              <p className="text-3xl font-bold text-brand">{item.stat}</p>
              <p className="mt-2 text-sm text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Resources (Internal Linking) */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Learn More</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/guides/school-broadsheet" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <FileText className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">Broadsheet Guide</h3>
            <p className="mt-2 text-sm text-muted">Complete guide to reading broadsheets, analysis tips, and action items</p>
          </Link>

          <Link href="/solutions/digital-result-management" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <BarChart3 className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">Results Management</h3>
            <p className="mt-2 text-sm text-muted">First, manage your results. Then, see them in beautiful broadsheets</p>
          </Link>

          <Link href="/for-principals" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <TrendingUp className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">For Principals</h3>
            <p className="mt-2 text-sm text-muted">Use broadsheets for school oversight and academic analytics</p>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">See Your Class Data Clearly</h2>
          <p className="mt-4 text-lg text-brand/80">
            Instant broadsheet. Automatic ranking. Export anytime.
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
