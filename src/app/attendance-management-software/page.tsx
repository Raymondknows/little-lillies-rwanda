import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Bell, CalendarDays, Users, ShieldCheck, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Student Attendance Management Software | SchoolBase',
  description:
    'Track student attendance digitally, send automatic parent alerts, and get attendance reports that help schools reduce absenteeism.',
  keywords: [
    'attendance management software',
    'student attendance tracking',
    'school attendance system',
    'attendance software for schools',
    'school monitoring software',
  ],
}

export default function AttendanceManagementSoftwarePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">ATTENDANCE MANAGEMENT</p>
            <h1 className="text-4xl font-bold text-foreground">
              Student Attendance Management Software for Schools
            </h1>
            <p className="mt-4 text-lg text-muted">
              SchoolBase replaces paper registers with fast attendance tracking and parent alerts, so your school can reduce absenteeism and keep records accurate.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
                Start Free Trial
              </Link>
              <Link href="/use-cases/student-attendance" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              icon: <CalendarDays className="h-8 w-8 text-brand" />,
              title: 'One-Tap Attendance',
              desc: 'Mark attendance quickly on mobile or desktop and keep accurate daily records for every class.',
            },
            {
              icon: <Bell className="h-8 w-8 text-brand" />,
              title: 'Parent Alerts',
              desc: 'Automatically send WhatsApp messages when a student is absent or when updates are needed.',
            },
            {
              icon: <TrendingUp className="h-8 w-8 text-brand" />,
              title: 'Attendance Reports',
              desc: 'View trends, identify gaps, and take action with dashboards for teachers and principals.',
            },
            {
              icon: <CheckCircle className="h-8 w-8 text-brand" />,
              title: 'Reduce Absenteeism',
              desc: 'Use data to spot patterns and improve school attendance with faster follow-up.',
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-brand" />,
              title: 'Secure Records',
              desc: 'All attendance data is stored safely and accessible to authorized staff only.',
            },
            {
              icon: <Users className="h-8 w-8 text-brand" />,
              title: 'Teacher-Friendly',
              desc: 'Easy workflows for busy teachers, without extra apps or complex setups.',
            },
          ].map((item, index) => (
            <div key={index} className="rounded-xl border border-brand/10 bg-white p-8 shadow-sm">
              <div className="mb-4">{item.icon}</div>
              <h2 className="text-xl font-semibold text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand/5 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground">Build a Reliable Attendance System</h2>
            <p className="mt-4 text-slate-600">
              With SchoolBase, attendance management becomes faster and more accurate. Teachers can mark attendance in minutes and principals can act on insights immediately.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { title: 'Daily Registers', detail: 'Digital attendance for every class period.' },
                { title: 'Absence Alerts', detail: 'Instant parent notifications for absent students.' },
                { title: 'Trend Analytics', detail: 'Reports that show attendance patterns over time.' },
              ].map((item, index) => (
                <div key={index} className="rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-white p-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">Make attendance tracking a strength for your school</h2>
          <p className="mt-4 text-slate-600">
            Stop losing time to paper registers and follow-up calls. Use SchoolBase attendance software to keep every class on track.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            <Link href="/signup" className="rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90">
              Start Free Trial
            </Link>
            <Link href="/use-cases/student-attendance" className="rounded-lg border border-brand px-6 py-3 text-brand font-semibold hover:bg-brand/5">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
