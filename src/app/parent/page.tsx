import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { calculateGrade } from "@/lib/grade-calculator";
import { formatMoney, invoiceStatusLabel, pupilName } from "@/lib/format";
import { getParentSession } from "@/lib/auth";
import { PaystackButton } from "@/components/admin/paystack-button";
import { DashboardCardsCarousel } from "@/components/admin/dashboard-cards-carousel";
import { Button } from "@/components/ui/button";

export default async function ParentHomePage() {
  const session = await getParentSession();
  if (!session) redirect("/parent/login");

  const school = await prisma.school.findUnique({
    where: { id: session.schoolId },
  });

  const guardian = await prisma.guardian.findUnique({
    where: { id: session.guardianId },
    include: {
      pupils: {
        include: {
          pupil: {
            include: {
              class: true,
              invoices: {
                orderBy: { createdAt: "desc" },
                take: 3,
              },
              results: {
                where: { publishedAt: { not: null } },
                include: { assessment: true },
                orderBy: { publishedAt: "desc" },
                take: 10,
              },
            },
          },
        },
      },
    },
  });

  if (!guardian) redirect("/parent/login");

  const announcements = await prisma.announcement.findMany({
    where: { schoolId: session.schoolId, published: true },
    orderBy: { publishedAt: "desc" },
    take: 5,
  });

  const childrenCount = guardian.pupils.length;
  const pendingInvoicesCount = guardian.pupils
    .flatMap(({ pupil }) => pupil.invoices)
    .filter((invoice) => invoice.amountDue - invoice.amountPaid > 0).length;

  const assessmentGroups = new Map<
    string,
    {
      pupil: (typeof guardian.pupils)[number]["pupil"];
      assessment: { id: string; name: string };
      publishedAt: Date;
      totalScores: number[];
    }
  >();

  for (const { pupil } of guardian.pupils) {
    for (const result of pupil.results) {
      const publishedAt = result.publishedAt!;
      const key = `${pupil.id}-${result.assessmentId}`;
      const existing = assessmentGroups.get(key);

      if (!existing) {
        assessmentGroups.set(key, {
          pupil,
          assessment: result.assessment,
          publishedAt,
          totalScores: result.totalScore !== null ? [result.totalScore] : [],
        });
      } else {
        if (publishedAt.getTime() > existing.publishedAt.getTime()) {
          existing.publishedAt = publishedAt;
        }
        if (result.totalScore !== null) {
          existing.totalScores.push(result.totalScore);
        }
      }
    }
  }

  const resultRows = await Promise.all(
    Array.from(assessmentGroups.values()).map(async (group) => {
      const averageScore =
        group.totalScores.length > 0
          ? Math.round(
              group.totalScores.reduce((sum, value) => sum + value, 0) /
                group.totalScores.length,
            )
          : null;
      const grade =
        averageScore !== null
          ? await calculateGrade(session.schoolId, averageScore)
          : "—";

      return {
        id: `${group.pupil.id}-${group.assessment.id}`,
        pupil: group.pupil,
        assessment: group.assessment,
        averageScore,
        grade,
        publishedAt: group.publishedAt,
      };
    }),
  );

  resultRows.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const publishedResultsCount = resultRows.length;
  const invoices = guardian.pupils.flatMap(({ pupil }) =>
    pupil.invoices.map((invoice) => ({ pupil, invoice })),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Good morning, {guardian.firstName}</h1>
        <p className="mt-1 text-muted">Overview of your linked children, payments, results, and school announcements.</p>
      </div>

      <DashboardCardsCarousel
        stats={[
          {
            label: "Children",
            value: String(childrenCount),
            sub: "Linked children",
            href: "/parent/results",
            iconName: "users",
          },
          {
            label: "Outstanding fees",
            value: formatMoney(
              guardian.pupils
                .flatMap(({ pupil }) => pupil.invoices)
                .reduce((sum, invoice) => sum + Math.max(0, invoice.amountDue - invoice.amountPaid), 0),
              school?.currency ?? "NGN",
            ),
            sub: `${pendingInvoicesCount} invoices due`,
            href: "/parent/payments",
            iconName: "creditcard",
          },
          {
            label: "Published results",
            value: String(publishedResultsCount),
            sub: "Recent report cards",
            href: "/parent/results",
            iconName: "graduationcap",
          },
        ]}
      />

      <div className="mt-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Announcements</p>
            <p className="mt-1 text-sm text-muted">Latest school notices from your child’s school.</p>
          </div>
          <Link href="/parent/announcements" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <p className="text-sm text-muted">No announcements have been published yet.</p>
          ) : (
            announcements.map((announcement) => (
              <article key={announcement.id} className="space-y-2 rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
                  <p className="text-xs text-muted">
                    {announcement.publishedAt
                      ? new Date(announcement.publishedAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Draft'}
                  </p>
                </div>
                <p className="text-sm text-muted whitespace-pre-line">{announcement.body}</p>
              </article>
            ))
          )}
        </div>
      </div>

      <section className="mt-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent student invoices</h2>
            <p className="mt-1 text-sm text-muted">A consolidated view of invoices across all linked children.</p>
          </div>
          <Link
            href="/parent/payments"
            className="inline-flex items-center justify-center rounded-full border border-brand bg-brand/5 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            Manage payments
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center sm:px-6 sm:py-12">
            <p className="text-xs text-muted">No invoices found for your children.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium text-right">Amount due</th>
                  <th className="px-4 py-3 font-medium text-right">Paid</th>
                  <th className="px-4 py-3 font-medium text-right">Balance</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(({ pupil, invoice }) => {
                  const balance = invoice.amountDue - invoice.amountPaid;
                  const classLabel = pupil.class
                    ? `${pupil.class.name}${pupil.class.arm ? ` ${pupil.class.arm}` : ''}`
                    : 'Unassigned';

                  return (
                    <tr key={invoice.id} className="border-t border-border hover:bg-background/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground truncate">{pupilName(pupil.firstName, pupil.lastName)}</div>
                        <div className="text-xs text-muted">{classLabel}</div>
                      </td>
                      <td className="px-4 py-3 text-muted"><code className="text-xs">{invoice.invoiceNo}</code></td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(invoice.amountDue, school?.currency ?? 'NGN')}</td>
                      <td className="px-4 py-3 text-right">{formatMoney(invoice.amountPaid, school?.currency ?? 'NGN')}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(balance, school?.currency ?? 'NGN')}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{invoiceStatusLabel(invoice.status)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/parent/invoices/${invoice.id}`} className="inline-flex rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-50">
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent published results</h2>
            <p className="mt-1 text-sm text-muted">Track the latest published assessments for your children.</p>
          </div>
          <Link
            href="/parent/results"
            className="inline-flex items-center justify-center rounded-full border border-brand bg-brand/5 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            View all results
          </Link>
        </div>

        {resultRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-sm text-muted">
            No published results have been shared yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Assessment</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Grade</th>
                    <th className="px-4 py-3">Published</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resultRows.map((row) => (
                    <tr key={row.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{pupilName(row.pupil.firstName, row.pupil.lastName)}</div>
                        <div className="text-xs text-muted">{row.pupil.class?.name}{row.pupil.class?.arm ? ` ${row.pupil.class.arm}` : ''}</div>
                      </td>
                      <td className="px-4 py-3 text-muted">{row.assessment.name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{row.averageScore !== null ? row.averageScore : '—'}</td>
                      <td className="px-4 py-3 text-right text-foreground">{row.grade}</td>
                      <td className="px-4 py-3 text-muted">{row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('en-NG') : '—'}</td>
                      <td className="px-4 py-3">
                        <Link href={`/parent/results/${row.assessment.id}/${row.pupil.id}/report`} className="inline-flex rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-50">
                          Open report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden p-4 space-y-3">
              {resultRows.map((row) => (
                <div key={row.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{pupilName(row.pupil.firstName, row.pupil.lastName)}</p>
                      <p className="text-xs text-muted truncate">{row.pupil.class?.name}{row.pupil.class?.arm ? ` ${row.pupil.class.arm}` : ''}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{row.averageScore !== null ? row.averageScore : '—'}</span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-muted">
                    <p className="font-semibold text-foreground truncate">{row.assessment.name}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex rounded-full bg-brand/10 px-2 py-1 text-xs font-semibold text-brand">{row.grade}</span>
                    <Link href={`/parent/results/${row.assessment.id}/${row.pupil.id}/report`} className="inline-flex rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-50">
                      Open report
                    </Link>
                  </div>

                  <p className="mt-2 text-xs text-muted">Published {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('en-NG') : '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
