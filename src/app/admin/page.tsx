import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getCurrentSchool } from "@/lib/school";
import { DashboardCardsCarousel } from "@/components/admin/dashboard-cards-carousel";

export default async function AdminDashboardPage() {
  const school = await getCurrentSchool();

  const [invoices, pupilCount, classCount, readyAssessment, recentPayments, recentPupils, recentTeachers, recentAnnouncements] =
    await Promise.all([
      prisma.invoice.findMany({
        where: { schoolId: school.id },
        select: { amountDue: true, amountPaid: true, status: true },
      }),
      prisma.pupil.count({
        where: { schoolId: school.id, isActive: true },
      }),
      prisma.class.count({
        where: { schoolId: school.id },
      }),
      prisma.assessment.findFirst({
        where: { schoolId: school.id, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        take: 3,
        orderBy: { paidAt: "desc" },
        include: {
          invoice: {
            include: {
              pupil: true,
            },
          },
        },
        where: { invoice: { schoolId: school.id } },
      }),
      prisma.pupil.findMany({
        where: { schoolId: school.id, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          class: {
            select: {
              name: true,
              arm: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { schoolId: school.id, role: "TEACHER" },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.announcement.findMany({
        where: { schoolId: school.id },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    ]);

  const outstanding = invoices.reduce(
    (sum, inv) => sum + Math.max(0, inv.amountDue - inv.amountPaid),
    0,
  );
  const attentionCount = invoices.filter((i) =>
    ["SENT", "PART_PAID", "OVERDUE"].includes(i.status),
  ).length;

  const stats = [
    {
      label: "Outstanding fees",
      value: formatMoney(outstanding, school.currency),
      sub: `${attentionCount} invoices need attention`,
      href: "/admin/fees",
      iconName: "creditcard" as const,
    },
    {
      label: "Results to publish",
      value: readyAssessment?.name ?? "None pending",
      sub: readyAssessment ? "Ready for approval" : "All caught up",
      href: "/admin/results",
      iconName: "graduationcap" as const,
    },
    {
      label: "Active pupils",
      value: String(pupilCount),
      sub: `${(school as any).enabledPhases?.length ?? 0} phases enabled`,
      href: "/admin/students",
      iconName: "users" as const,
    },
    {
      label: "Classes",
      value: String(classCount),
      sub: "Manage grade groups and sections",
      href: "/admin/classes",
      iconName: "layers" as const,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Good morning, {school.name}
        </h1>
        <p className="mt-1 text-muted">
          Live dashboard — fees, results, and pupils from your database.
        </p>
      </div>

      <DashboardCardsCarousel stats={stats} />

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold text-foreground">Recent payments</h2>
          <ul className="mt-3 divide-y divide-border">
            {recentPayments.length === 0 ? (
              <li className="py-3 text-sm text-muted">No payments yet.</li>
            ) : (
              recentPayments.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-1 border-b border-border pb-2 pt-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">
                      {p.invoice ? `${p.invoice.pupil.firstName} ${p.invoice.pupil.lastName}` : 'Unknown student'}
                    </span>
                    <span className="text-sm font-semibold text-success">
                      {formatMoney(p.amount, school.currency)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>{p.invoice?.invoiceNo ?? 'No invoice'}</span>
                    <span>{new Date(p.paidAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 text-right">
            <Link href="/admin/fees" className="text-sm font-semibold text-brand hover:text-brand/80">
              View all payments
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-foreground">Latest students</h2>
            <span className="rounded-full border border-border px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-muted">
              New
            </span>
          </div>

          <ul className="mt-3 divide-y divide-border">
            {recentPupils.length === 0 ? (
              <li className="py-3 text-sm text-muted">No new students yet.</li>
            ) : (
              recentPupils.map((pupil) => (
                <li key={pupil.id} className="space-y-1 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground">
                      {pupil.firstName} {pupil.lastName}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(pupil.createdAt).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">
                    {pupil.class ? `${pupil.class.name}${pupil.class.arm ? ` ${pupil.class.arm}` : ''}` : 'Unassigned'}
                  </p>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 text-right">
            <Link href="/admin/students" className="text-sm font-semibold text-brand hover:text-brand/80">
              View all students
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-foreground">Latest teachers</h2>
            <span className="rounded-full border border-border px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-muted">
              New
            </span>
          </div>

          <ul className="mt-3 divide-y divide-border">
            {recentTeachers.length === 0 ? (
              <li className="py-3 text-sm text-muted">No recent teachers yet.</li>
            ) : (
              recentTeachers.map((teacher) => (
                <li key={teacher.id} className="space-y-1 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground">{teacher.name}</span>
                    <span className="text-xs text-muted">
                      {teacher.createdAt.toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">{teacher.email}</p>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 text-right">
            <Link href="/admin/teachers" className="text-sm font-semibold text-brand hover:text-brand/80">
              View all teachers
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-foreground">Latest announcements</h2>
            <span className="rounded-full border border-border px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-muted">
              New
            </span>
          </div>

          <ul className="mt-3 divide-y divide-border">
            {recentAnnouncements.length === 0 ? (
              <li className="py-3 text-sm text-muted">No announcements yet.</li>
            ) : (
              recentAnnouncements.map((announcement) => (
                <li key={announcement.id} className="space-y-1 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground">{announcement.title}</span>
                    <span className="text-xs text-muted">
                      {announcement.publishedAt
                        ? announcement.publishedAt.toLocaleDateString('en-NG', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Draft'}
                    </span>
                  </div>
                  <p className="text-[11px] line-clamp-2 text-muted">{announcement.body}</p>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 text-right">
            <Link href="/admin/website" className="text-sm font-semibold text-brand hover:text-brand/80">
              View all announcements
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
