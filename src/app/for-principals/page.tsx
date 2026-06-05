import Link from "next/link";
import { BarChart3, Users, AlertCircle, TrendingUp, Lock, Zap } from "lucide-react";

export const metadata = {
  title: "SchoolBase for School Principals | Principal Dashboard",
  description:
    "Dashboard for principals: oversight of all systems, compliance reporting, board presentations, parent communication, student progress tracking.",
};

export default function PrincipalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">FOR PRINCIPALS</p>
            <h1 className="text-4xl font-bold text-foreground">
              Principal Dashboard & School Oversight
            </h1>
            <p className="mt-4 text-lg text-muted">
              One dashboard for everything. Compliance reports, parent satisfaction, financial health, academic performance. What you need to know, instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Your Daily Challenges */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">What Keeps Principals Up at Night</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Parent Complaints",
              desc: "Results delayed weeks. Fees not tracked. Communication is poor. Parents frustrated. You hear about it.",
            },
            {
              title: "No Real-Time Data",
              desc: "Decisions made on feelings not facts. Bursar says fees collected. Teacher says results done. But when? By how much?",
            },
            {
              title: "Board Expectations",
              desc: "Board wants reports. Financial statements, enrollment trends, exam performance. You scramble to compile.",
            },
            {
              title: "Compliance Risk",
              desc: "Ministry audits. Need proof of grades, attendance, finances. Paper-based systems can't prove anything.",
            },
            {
              title: "Staff Overload",
              desc: "Teachers spending 40% time on admin. Bursar working nights on reconciliation. Potential burnout.",
            },
            {
              title: "Poor Decision Making",
              desc: "Don't know which classes are weak. Which subjects need support. Which investments pay off.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Principal Dashboard */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Your SchoolBase Principal Dashboard</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <BarChart3 className="h-8 w-8 text-brand" />,
                title: "Financial Overview",
                desc: "Total fees due, collected, overdue. By-class breakdown. Trend over time. Know your real revenue.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "Academic Performance",
                desc: "Average scores by class, by subject. Identify weak areas. See improvement trends term-to-term.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Enrollment Tracking",
                desc: "Total students, by class, by level. Monitor growth. Capacity planning data.",
              },
              {
                icon: <AlertCircle className="h-8 w-8 text-brand" />,
                title: "Alerts & Issues",
                desc: "High absenteeism. Unexplained poor grades. Collections issues. Flagged for your attention.",
              },
              {
                icon: <Lock className="h-8 w-8 text-brand" />,
                title: "Compliance Ready",
                desc: "Audit trail of all grades entered. Payment records with dates. Attendance proof for ministry.",
              },
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "Board Reports",
                desc: "Generate board presentation reports. Financial summary, academic results, enrollment. Print-ready.",
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

      {/* Your Typical Day - With SchoolBase */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Your Day Changes</h2>
        <div className="space-y-6">
          {[
            {
              time: "7:30 AM",
              activity: "Login to SchoolBase",
              what: "See yesterday's summary: fees collected, results entered, attendance marked.",
            },
            {
              time: "7:35 AM",
              activity: "Board meeting prep",
              what: "Print board report (takes 2 minutes). Financial summary, academic trends, enrollment. Ready.",
            },
            {
              time: "9:00 AM",
              activity: "Parent concern",
              what: "Parent wants to know: why is fee overdue? Why hasn't result been published? You check SchoolBase. Data right there. Resolve in 30 seconds.",
            },
            {
              time: "10:00 AM",
              activity: "Teacher check-in",
              what: "Notice Form 2 Science has poor average. Get alert in system. Talk to teacher. Identify gaps. Plan support.",
            },
            {
              time: "2:00 PM",
              activity: "Bursar reports",
              what: "Bursar shows fee report. All reconciled in SchoolBase automatically. No manual matching. Clear picture.",
            },
            {
              time: "4:00 PM",
              activity: "Ministry audit prep",
              what: "Ministry calls. Need records of grades by teacher, dates entered. Generate audit report. All automated.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-brand bg-brand/5 p-6">
              <div className="flex gap-4">
                <div className="font-bold text-brand text-lg min-w-fit">{item.time}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.activity}</h3>
                  <p className="text-sm text-muted mt-1">{item.what}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">What Changes for You</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                metric: "5 hours/week",
                desc: "Less time compiling reports. Data automated. More time on strategy.",
              },
              {
                metric: "95%",
                desc: "Staff satisfaction increases when they waste less time on admin.",
              },
              {
                metric: "30%",
                desc: "Late fees drop when bursar can track and remind in real-time.",
              },
              {
                metric: "0%",
                desc: "Compliance failures when you have audit trail of everything.",
              },
              {
                metric: "40%",
                desc: "Improvement in academic weak areas when you catch and address fast.",
              },
              {
                metric: "100%",
                desc: "Board confidence when you present data-backed decisions.",
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

      {/* FAQ */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Principals Ask</h2>
        <div className="space-y-4">
          {[
            {
              q: "Will I have time to learn this?",
              a: "Yes. Dashboard is simple - 5 main cards. We train you in 30 minutes. Most principals are comfortable by day 2.",
            },
            {
              q: "Can I see only what I need to see?",
              a: "Yes. You see summary dashboard. Can drill down to details (by-teacher results, by-class fees, etc.)",
            },
            {
              q: "What if I don't like data/dashboards?",
              a: "We have printable reports. Or your bursar/deputy can manage detailed data. You see highlights.",
            },
            {
              q: "Is my data safe? What about privacy?",
              a: "Yes. Data encrypted. Only you and staff can see. Parents see only their child's info. Backups daily.",
            },
            {
              q: "Can I get reports for board meetings?",
              a: "Yes. Pre-built board reports. Download as PDF, print, or present. Includes financial, academic, enrollment.",
            },
            {
              q: "What if a parent accuses us of mishandling fees?",
              a: "Show them the payment record in SchoolBase. Date, amount, receipt. Everything tracked. Issue resolved.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <p className="font-semibold text-foreground">{item.q}</p>
              <p className="mt-2 text-sm text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">One Dashboard. Full Control.</h2>
          <p className="mt-4 text-lg text-brand/80">
            See your school's health in real-time. Make better decisions faster.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              See Demo
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Schedule Call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
