import Link from "next/link";
import { CheckCircle, Clock, BarChart3, AlertCircle, Users } from "lucide-react";

export const metadata = {
  title: "Student Attendance Tracking System | SchoolBase",
  description:
    "Track student attendance with one-click marking. Get absence alerts, attendance reports, and parent notifications automatically.",
};

export default function AttendancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">ATTENDANCE TRACKING</p>
            <h1 className="text-4xl font-bold text-foreground">
              Digital Student Attendance Tracking
            </h1>
            <p className="mt-4 text-lg text-muted">
              Mark attendance with one click. Get absence alerts, patterns, and automatic parent
              notifications. Reduce recording time by 80%.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">The Attendance Problem</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Manual Marking",
              desc: "Teachers spend 10+ minutes each morning on attendance registers instead of teaching",
            },
            {
              title: "Lost Records",
              desc: "Attendance books get lost, damaged. No historical tracking across terms.",
            },
            {
              title: "Data Errors",
              desc: "Manual tallying creates errors in monthly/termly attendance reports.",
            },
            {
              title: "No Alerts",
              desc: "Parents don't know their child is frequently absent until end of term.",
            },
            {
              title: "Compliance Issues",
              desc: "Hard to prove attendance records exist or track pattern analysis for at-risk students.",
            },
            {
              title: "Parent Communication",
              desc: "No automatic way to notify parents about absences.",
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
          <h2 className="text-2xl font-bold text-foreground">How SchoolBase Solves It</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Clock className="h-8 w-8 text-brand" />,
                title: "One-Click Marking",
                desc: "Mark entire class attendance in 30 seconds. No registers, no paper, no errors.",
              },
              {
                icon: <AlertCircle className="h-8 w-8 text-brand" />,
                title: "Absence Alerts",
                desc: "Automatic WhatsApp/SMS alerts to parents when student is absent. Same day.",
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-brand" />,
                title: "Analytics & Patterns",
                desc: "Identify at-risk students (high absenteeism). Flag patterns automatically.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Class-Level Tracking",
                desc: "Track attendance by class. See which classes have issues.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Instant Reports",
                desc: "Generate monthly/termly attendance reports in seconds.",
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-brand" />,
                title: "Parent Portal",
                desc: "Parents see their child's attendance history anytime.",
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

      {/* Benefits */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">Key Benefits</h2>
        <div className="mt-8 space-y-6">
          {[
            {
              title: "Time Savings",
              desc: "Reduce daily attendance time from 10 minutes to 30 seconds. Teachers focus on students.",
            },
            {
              title: "Parent Engagement",
              desc: "Parents know same-day about absences. Can intervene early. Reduces truancy.",
            },
            {
              title: "Early Intervention",
              desc: "Identify at-risk students (high absenteeism) early. Take action before they drop out.",
            },
            {
              title: "Compliance",
              desc: "Automatic audit trail. Prove attendance tracking for regulatory compliance.",
            },
            {
              title: "Data-Driven Decisions",
              desc: "See which classes have attendance issues. Make informed decisions about support.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Resources (Internal Linking) */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Related Solutions</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/for-parents" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <Users className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">For Parents</h3>
            <p className="mt-2 text-sm text-muted">Get real-time absence alerts and track your child's attendance pattern</p>
          </Link>

          <Link href="/solutions/parent-communication" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <AlertCircle className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">Parent Communication</h3>
            <p className="mt-2 text-sm text-muted">Automatic WhatsApp alerts keep parents informed about absences instantly</p>
          </Link>

          <Link href="/compare/manual-systems" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <BarChart3 className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">vs Manual Systems</h3>
            <p className="mt-2 text-sm text-muted">Save 80% of time on attendance tracking and reporting</p>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Simplify Attendance Today</h2>
          <p className="mt-4 text-lg text-brand/80">
            One click per class. Automatic alerts. Better parent engagement.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Start Free Trial
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
