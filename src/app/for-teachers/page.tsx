import Link from "next/link";
import { BookOpen, Zap, BarChart3, Users, Smartphone, CheckCircle } from "lucide-react";

export const metadata = {
  title: "SchoolBase for Teachers | Teacher Dashboard",
  description:
    "Teacher tools: results entry, attendance marking, class broadsheet, parent communication. Less admin, more teaching.",
};

export default function TeachersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">FOR TEACHERS</p>
            <h1 className="text-4xl font-bold text-foreground">
              Teacher Tools: Results & Attendance Made Simple
            </h1>
            <p className="mt-4 text-lg text-muted">
              Stop wasting time on admin. Results entry in 30 minutes. Attendance marked in 30 seconds. More time for teaching.
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Pain */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Teaching Should Be Your Job (Not Admin)</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Endless Paperwork",
              desc: "Manual result sheets. Writing marks by hand. Collating data. Hours per assessment.",
            },
            {
              title: "Attendance Frustration",
              desc: "Call roll every morning. Write in register. Manual counting. 10-15 minutes wasted.",
            },
            {
              title: "Slow Results Publishing",
              desc: "After marks entered, bursar compiles. Principal approves. Days before parents see. Delays feedback.",
            },
            {
              title: "Manual Grade Calculations",
              desc: "You calculate total, average, grade. Prone to errors. Have to recalculate.",
            },
            {
              title: "No Real Insight",
              desc: "Don't see which students are struggling. No analytics. Can't identify patterns.",
            },
            {
              title: "Parent Pressure",
              desc: "Parents ask: when will results come? Why isn't mark recorded? You don't know. No transparency.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">SchoolBase for Teachers</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <BookOpen className="h-8 w-8 text-brand" />,
                title: "Fast Results Entry",
                desc: "Simple form. Enter marks for class. System auto-calculates grades. Save & submit. Done in 30 min.",
              },
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "One-Click Attendance",
                desc: "Mark entire class present/absent in 30 seconds. System tracks. No manual counting needed.",
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-brand" />,
                title: "Class Broadsheet",
                desc: "See all your students' results in one table. Identify top/bottom performers. Export for records.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Parent Communication",
                desc: "Results publish automatically. Parents get WhatsApp notification same-day. Questions answered faster.",
              },
              {
                icon: <Smartphone className="h-8 w-8 text-brand" />,
                title: "Mobile-First",
                desc: "Works on phone. Mark attendance from classroom. Enter results from home. Works anywhere.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "No Errors",
                desc: "System calculates grades. No manual mistakes. All marks saved automatically.",
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

      {/* Your Day */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Your School Day Gets Better</h2>
        <div className="space-y-4">
          {[
            {
              time: "7:45 AM",
              what: "Roll call - one click per class. Attendance done in 30 seconds. Ready to teach.",
            },
            {
              time: "8:00 AM - 3:00 PM",
              what: "Teaching (most of your day). SchoolBase does the admin in background.",
            },
            {
              time: "3:00 PM",
              what: "Test marked. Open SchoolBase result form. Enter marks for 40 students in 20 minutes.",
            },
            {
              time: "3:20 PM",
              what: "System auto-calculates all totals, averages, grades. Submit. Done.",
            },
            {
              time: "3:30 PM",
              what: "Next morning - parents have results. They see their child's marks and grade.",
            },
            {
              time: "Next Week",
              what: "Want to see class performance? Open broadsheet. Top 5 students, bottom 5. See who needs help.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-brand bg-brand/5 p-6">
              <div className="flex gap-4">
                <div className="font-bold text-brand text-lg min-w-fit">{item.time}</div>
                <p className="text-sm text-muted">{item.what}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">What Changes for You</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                metric: "5 hours/week",
                desc: "Less admin time. More teaching.",
              },
              {
                metric: "0",
                desc: "Grade calculation errors. System does it.",
              },
              {
                metric: "30 sec",
                desc: "Attendance marking time per class.",
              },
              {
                metric: "24h",
                desc: "Results to parents (instead of 2 weeks).",
              },
              {
                metric: "Mobile",
                desc: "Work from anywhere. Phone or computer.",
              },
              {
                metric: "Happy",
                desc: "Parents. Students. Principal. Less complaints.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6 text-center">
                <p className="text-3xl font-bold text-brand">{item.metric}</p>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Specific Features Teachers Love</h2>
        <div className="space-y-6">
          {[
            {
              title: "Class Broadsheet View",
              desc: "See all students' marks in one table. Know at a glance: who's top, who's bottom. Which students need extra help.",
            },
            {
              title: "Results History",
              desc: "For each student, see marks from previous terms. Track improvement or decline. Identify patterns.",
            },
            {
              title: "Auto Grade Calculation",
              desc: "Enter raw marks. System calculates: total, average, grade letter. No manual math needed.",
            },
            {
              title: "Attendance Trends",
              desc: "See which students have high absence rates. Identify patterns. Know who needs intervention.",
            },
            {
              title: "Parent Communication",
              desc: "When results published, system sends WhatsApp to parents. They see their child's marks instantly.",
            },
            {
              title: "Bulk Attendance",
              desc: "Mark entire class in one form. Click present/absent for each student. Submit. Done in 30 seconds.",
            },
          ].map((feature, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Teachers Ask</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is it complicated to use?",
                a: "No. Simple form-based entry. 30-minute training. Most teachers comfortable in 1 day.",
              },
              {
                q: "What if I make a mistake entering marks?",
                a: "Edit anytime before submitting. After submission, principal can unlock for correction.",
              },
              {
                q: "Can I see which students are struggling?",
                a: "Yes. Broadsheet shows class performance. Identify bottom performers. Target for support.",
              },
              {
                q: "Do parents really see results same day?",
                a: "Yes. After principal approves, parents get WhatsApp notification with link.",
              },
              {
                q: "Can I access from my phone?",
                a: "Yes. Works on any phone. Mark attendance from classroom. Enter results at home.",
              },
              {
                q: "What if I'm not tech-savvy?",
                a: "SchoolBase is simple by design. If you can use WhatsApp, you can use SchoolBase.",
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
          <h2 className="text-3xl font-bold">Teach More. Admin Less.</h2>
          <p className="mt-4 text-lg text-brand/80">
            30-second attendance. 30-minute results entry. Everything else automated.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              See Demo
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Ask Questions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
