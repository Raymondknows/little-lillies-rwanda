import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  MessageCircle,
  Receipt,
  Sparkles,
} from "lucide-react";

const highlights = [
  {
    title: "Fees and receipts",
    text: "Parents can see balances, download slips, and receive timely reminders with zero confusion.",
    icon: Receipt,
  },
  {
    title: "Results in minutes",
    text: "Teachers publish assessments, principals approve, and guardians receive clear reports instantly.",
    icon: GraduationCap,
  },
  {
    title: "Parent communication",
    text: "Announcements, attendance alerts, and school updates go out through WhatsApp and SMS.",
    icon: MessageCircle,
  },
];

const announcements = [
  {
    title: "Admissions are now open for the 2026/2027 academic year",
    date: "12 Jun 2026",
    description: "Families can apply online, track their status, and receive an instant confirmation.",
  },
  {
    title: "Term 3 report cards published",
    date: "08 Jun 2026",
    description: "Student performance reports are now available for parents to view from their portal.",
  },
  {
    title: "Parent workshop on digital learning",
    date: "01 Jun 2026",
    description: "Join our live session on how parents can stay more connected to classroom progress.",
  },
];

const topPerformers = [
  { name: "Amina Yusuf", badge: "Maths • 95%" },
  { name: "Daniel Okafor", badge: "Science • 93%" },
  { name: "Chidinma Nwosu", badge: "English • 92%" },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section className="border-b border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-light px-3 py-1 text-sm font-medium text-brand">
                <Sparkles className="h-4 w-4" />
                A complete digital school experience
              </div>
              <h2 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
                Modern school management, beautifully presented for parents and staff.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                Bright Future College uses SchoolBase to manage fees, publish results, share updates, and keep every family informed in real time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/signup" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90">
                  Get started <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#news" className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background">
                  See latest updates
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">This term</p>
                  <h3 className="mt-2 text-2xl font-semibold">98.4% attendance</h3>
                </div>
                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
                  <BadgeCheck className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Students</p>
                  <p className="mt-2 text-xl font-semibold">1,240</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Teachers</p>
                  <p className="mt-2 text-xl font-semibold">84</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Parents</p>
                  <p className="mt-2 text-xl font-semibold">1,110</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface/60 p-4 text-sm text-muted">
                <p className="font-semibold text-foreground">Live school website preview</p>
                <p className="mt-2">Announcements, admissions, results and parent communications all live in one place.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">Why schools love it</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Everything a school needs to operate smoothly and communicate clearly.</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="news" className="border-y border-border bg-surface py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">Latest updates</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">The school website stays fresh, clear, and parent-friendly.</h2>
              </div>
              <a href="#contact" className="text-sm font-semibold text-brand transition hover:text-brand/80">
                Contact the school →
              </a>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {announcements.map((item) => (
                <article key={item.title} className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <CalendarDays className="h-4 w-4" />
                    {item.date}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">Performance snapshot</p>
              <h2 className="mt-3 text-3xl font-semibold">Results, progress, and recognition are all visible at a glance.</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                From term reports to subject rankings, the school can publish everything securely and share it with parents instantly.
              </p>
              <div className="mt-8 rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Best performing students</p>
                <ul className="mt-4 space-y-3">
                  {topPerformers.map((student) => (
                    <li key={student.name} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm">
                      <span>{student.name}</span>
                      <span className="text-muted">{student.badge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">What the school controls</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-sm font-semibold text-foreground">Fee collection</p>
                  <p className="mt-2 text-sm leading-7 text-muted">Track balances, issue receipts, and remind guardians automatically.</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-sm font-semibold text-foreground">Attendance</p>
                  <p className="mt-2 text-sm leading-7 text-muted">Monitor class attendance and notify parents about daily concerns.</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-sm font-semibold text-foreground">Results</p>
                  <p className="mt-2 text-sm leading-7 text-muted">Publish reports, rankings, and subject summaries in a few clicks.</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-sm font-semibold text-foreground">Website</p>
                  <p className="mt-2 text-sm leading-7 text-muted">Maintain a modern school website with announcements, admissions, and contacts.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-border bg-surface py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-3xl border border-border bg-background p-8 shadow-sm sm:p-10">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">Ready to see it in action?</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Bring the same experience to your school with SchoolBase.</h2>
                <p className="mt-4 text-lg leading-8 text-muted">
                  From quick setup to ongoing parent communication, SchoolBase helps schools run faster and look more professional online.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/signup" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90">
                  Start your setup
                </a>
                <a href="/contact" className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface">
                  Talk to the team
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
