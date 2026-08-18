import Link from "next/link";
import { BookOpen, Zap, Users, BarChart3 } from "lucide-react";

export const metadata = {
  title: "SchoolBase for Secondary Schools | Secondary School Management",
  description:
    "Solutions for secondary schools: WAEC/NECO/KCSE support, streaming, subject specialization, broadsheet analysis, advanced reporting.",
};

export default function SecondarySchoolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">FOR SECONDARY SCHOOLS</p>
            <h1 className="text-4xl font-bold text-foreground">
              School Management Software for Secondary Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              WAEC/NECO/KCSE/UACE preparation. Subject specialization. Streaming. Advanced broadsheet analysis. Form 1-4 ready.
            </p>
          </div>
        </div>
      </div>

      {/* Unique Challenges */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Unique Challenges in Secondary Schools</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Multiple Subject Specialization",
              desc: "Each student takes different subjects. Hard to track. Timetable conflicts. Complex scheduling.",
            },
            {
              title: "Streaming Complexity",
              desc: "Science stream, Arts stream, Commercial. Different subjects per stream. Manual tracking nightmare.",
            },
            {
              title: "Exam Board Alignment",
              desc: "WAEC/NECO/KCSE require specific subject codes. Grading scales. Registration deadlines.",
            },
            {
              title: "Form-Level Progression",
              desc: "Students move form to form. Subject assignments change. Teacher assignments change.",
            },
            {
              title: "Advanced Reporting",
              desc: "Need detailed performance analysis. Subject trends. Teacher effectiveness. Form comparisons.",
            },
            {
              title: "Internal Assessment",
              desc: "Continuous Assessment (CA) scores + Final exams. Weightage calculation. Automatic grading.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Features for Secondary Schools</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <BookOpen className="h-8 w-8 text-brand" />,
                title: "Subject Specialization",
                desc: "Track each student's subject combination. Auto-calculate based on stream. Manage registrations.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Streaming Support",
                desc: "Science, Arts, Commercial streams. Auto-assign subjects per stream. Handle exceptional cases.",
              },
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "Exam Board Integration",
                desc: "WAEC/NECO/KCSE/UACE subject codes. Grading standards. Registration deadlines.",
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-brand" />,
                title: "Advanced Broadsheet",
                desc: "Compare performance across forms. Subject trends. Identify weak subjects at form/stream level.",
              },
              {
                icon: <BookOpen className="h-8 w-8 text-brand" />,
                title: "CA + Final Grade",
                desc: "Track Continuous Assessment separately. Auto-weight CA + Final. Calculate final grades.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Teacher Subject Assignment",
                desc: "Assign teachers to subjects per form. Track workload. Facilitate performance review.",
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

      {/* Forms Support */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Built for Form 1-4 Systems</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              form: "Form 1-2",
              focus: "Foundation subjects, no streaming yet. Core subjects tracked.",
            },
            {
              form: "Form 3",
              focus: "Streaming begins. Subject selection. Registration for exams.",
            },
            {
              form: "Form 4",
              focus: "Final exam preparation. CA completion. Grade calculation. Result announcement.",
            },
            {
              form: "Alumni",
              focus: "Historical data retention. Transcript generation. Graduate tracking.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <p className="font-bold text-foreground text-lg">{item.form}</p>
              <p className="text-muted text-sm mt-2">{item.focus}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Benefits for Secondary Schools</h2>
          <div className="space-y-4">
            {[
              "✅ Easy exam board coordination (WAEC/NECO registration on schedule)",
              "✅ Reduced errors in subject assignment and streaming",
              "✅ Automated grading calculations (CA + Final = accurate grades)",
              "✅ Better performance analysis (subject trends, form comparisons)",
              "✅ Faster transcript generation (ready within hours of results)",
              "✅ Improved teacher coordination (subject assignments, workload)",
            ].map((item, i) => (
              <p key={i} className="text-muted text-sm bg-white border border-border rounded-lg p-4">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Built for Secondary School Complexity</h2>
          <p className="mt-4 text-lg text-brand/80">
            Exam board ready. Streaming support. Advanced analytics.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              See Demo
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
