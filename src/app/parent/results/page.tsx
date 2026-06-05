import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { calculateGrade } from '@/lib/grade-calculator'
import { pupilName } from '@/lib/format'
import { getParentSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Parent results | SchoolBase',
  description:
    'View published exam results, report cards, and previous performance for your children.',
}

export default async function ParentResultsPage() {
  const session = await getParentSession()
  if (!session) redirect('/parent/login')

  const guardian = await prisma.guardian.findUnique({
    where: { id: session.guardianId },
    include: {
      pupils: {
        include: {
          pupil: {
            include: {
              class: true,
              results: {
                where: { publishedAt: { not: null } },
                include: { assessment: true },
                orderBy: { publishedAt: 'desc' },
              },
            },
          },
        },
      },
    },
  })

  if (!guardian) redirect('/parent/login')

  const childrenCount = guardian.pupils.length

  const assessmentGroups = new Map<string, {
    pupil: (typeof guardian.pupils)[number]['pupil']
    assessment: { id: string; name: string }
    latestPublishedAt: Date
    totalScores: number[]
  }>()

  for (const { pupil } of guardian.pupils) {
    for (const result of pupil.results) {
      const key = `${pupil.id}-${result.assessmentId}`
      const publishedAt = result.publishedAt!
      const existing = assessmentGroups.get(key)

      if (!existing) {
        assessmentGroups.set(key, {
          pupil,
          assessment: result.assessment,
          latestPublishedAt: publishedAt,
          totalScores: result.totalScore !== null ? [result.totalScore] : [],
        })
      } else {
        existing.latestPublishedAt = new Date(
          Math.max(existing.latestPublishedAt.getTime(), publishedAt.getTime()),
        )
        if (result.totalScore !== null) {
          existing.totalScores.push(result.totalScore)
        }
      }
    }
  }

  const resultRows = await Promise.all(
    Array.from(assessmentGroups.entries()).map(async ([key, group]) => {
      const averageScore =
        group.totalScores.length > 0
          ? group.totalScores.reduce((sum, value) => sum + value, 0) /
            group.totalScores.length
          : null
      const grade =
        averageScore !== null
          ? await calculateGrade(
              guardian.pupils[0]?.pupil.schoolId ?? session.schoolId,
              Math.round(averageScore),
            )
          : '—'

      return {
        id: key,
        pupil: group.pupil,
        assessment: group.assessment,
        averageScore,
        grade,
        publishedAt: group.latestPublishedAt,
      }
    }),
  )

  const publishedCount = resultRows.length
  const resultStats = [
    {
      label: "Children",
      value: String(childrenCount),
      sub: "Linked children",
      href: "/parent/results",
      iconName: "users",
    },
    {
      label: "Published results",
      value: String(publishedCount),
      sub: "Assessments shared",
      href: "/parent/results",
      iconName: "graduationcap",
    },
    {
      label: "Latest result",
      value: resultRows[0]?.assessment.name ?? "None",
      sub: "Most recent publication",
      href: "/parent/results",
      iconName: "layers",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Published results</h1>
        <p className="mt-1 text-muted">Review recent and previous published results for your children and download report cards.</p>
      </div>

      <section className="mt-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">All published results</h2>
            <p className="text-sm text-muted">A table of all published assessments for your children.</p>
          </div>
          <Button href="/parent/payments" variant="secondary" className="w-full sm:w-auto">View payments</Button>
        </div>

        {resultRows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-6 text-sm text-muted">
            No published results have been shared yet.
          </div>
        ) : (
          <>
            <div className="mt-6 hidden sm:block overflow-hidden rounded-lg border border-border bg-surface">
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
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{row.averageScore !== null ? Math.round(row.averageScore) : '—'}</td>
                      <td className="px-4 py-3 text-right text-foreground">{row.grade}</td>
                      <td className="px-4 py-3 text-muted">{row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('en-NG') : '—'}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/parent/results/${row.assessment.id}/${row.pupil.id}/report`}
                          className="inline-flex rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-50"
                        >
                          Open report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-3 p-4">
              {resultRows.map((row) => (
                <div key={row.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{pupilName(row.pupil.firstName, row.pupil.lastName)}</p>
                      <p className="text-xs text-muted truncate">{row.pupil.class?.name}{row.pupil.class?.arm ? ` ${row.pupil.class.arm}` : ''}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{row.averageScore !== null ? Math.round(row.averageScore) : '—'}</span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-muted">
                    <p className="font-semibold text-foreground truncate">{row.assessment.name}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex rounded-full bg-brand/10 px-2 py-1 text-xs font-semibold text-brand">
                      {row.grade}
                    </span>
                    <Link
                      href={`/parent/results/${row.assessment.id}/${row.pupil.id}/report`}
                      className="inline-flex rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-50"
                    >
                      Open report
                    </Link>
                  </div>

                  <p className="mt-2 text-xs text-muted">
                    Published {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString('en-NG') : '—'}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
