import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentSchoolId } from '@/lib/school'
import { getStaffSession } from '@/lib/auth'
import { pupilName } from '@/lib/format'
import { getTeacherAccessibleClassIds } from '@/lib/teacher-permissions'
import { Button } from '@/components/ui/button'
import { calculateGrade } from '@/lib/grade-calculator'
import BroadsheetClient from './broadsheet-client'

export const metadata = {
  title: 'Assessment Broadsheet | SchoolBase',
  description: 'View and export class assessment broadsheet',
}

export default async function BroadsheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ classId?: string }>
}) {
  const { id: assessmentId } = await params
  const { classId } = await searchParams
  const schoolId = await getCurrentSchoolId()
  const session = await getStaffSession()

  if (!session) redirect('/login')

  // Check teacher permissions
  let accessibleClassIds: string[] | null = null
  if (session.role === 'TEACHER') {
    accessibleClassIds = await getTeacherAccessibleClassIds(session.userId, schoolId)
    if (accessibleClassIds.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="text-muted">No classes assigned. Please contact your administrator.</p>
        </div>
      )
    }
  }

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, schoolId },
    include: { term: true },
  })

  if (!assessment) notFound()

  const classes = await prisma.class.findMany({
    where: { schoolId, phase: assessment.phase },
    orderBy: { name: 'asc' },
  })

  // Filter by accessible classes if teacher
  const filterClasses =
    accessibleClassIds && accessibleClassIds.length > 0
      ? classes.filter((c) => accessibleClassIds.includes(c.id))
      : classes

  const selectedClassId = classId || filterClasses[0]?.id

  if (!selectedClassId) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-muted">No class selected or available.</p>
      </div>
    )
  }

  // Verify access
  if (accessibleClassIds && !accessibleClassIds.includes(selectedClassId)) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-muted">You do not have access to this class.</p>
      </div>
    )
  }

  const selectedClass = await prisma.class.findFirst({
    where: { id: selectedClassId, schoolId },
  })

  if (!selectedClass) notFound()

  // Fetch all results for this assessment and class
  const results = await prisma.result.findMany({
    where: {
      assessmentId,
      pupil: { classId: selectedClassId },
    },
    include: {
      pupil: { include: { class: true } },
      subjectRef: true,
    },
  })

  // Get all subjects used in this assessment
  const subjectsInAssessment = await prisma.result.findMany({
    where: { assessmentId },
    distinct: ['subjectId'],
    select: { subjectRef: true },
  })

  const subjectMap = new Map(subjectsInAssessment.filter((r) => r.subjectRef).map((r) => [r.subjectRef!.id, r.subjectRef!]))
  const subjects = Array.from(subjectMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  // Get all pupils in the class
  const pupils = await prisma.pupil.findMany({
    where: { classId: selectedClassId },
    orderBy: { firstName: 'asc' },
  })

  // Build broadsheet data
  const broadsheetData = await Promise.all(
    pupils.map(async (pupil) => {
      const pupilResults = results.filter((r) => r.pupilId === pupil.id)

      // Calculate scores per subject
      const subjectScores = subjects.map((subject) => {
        const result = pupilResults.find((r) => r.subjectId === subject.id)
        return {
          subjectId: subject.id,
          totalScore: result?.totalScore ?? null,
        }
      })

      // Calculate total and average
      const scores = subjectScores.filter((s) => s.totalScore !== null).map((s) => s.totalScore!)
      const total = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) : null
      const average = scores.length > 0 ? total! / scores.length : null
      const grade = average !== null ? await calculateGrade(schoolId, average) : null

      return {
        pupilId: pupil.id,
        name: pupilName(pupil.firstName, pupil.lastName),
        admissionNo: pupil.admissionNo,
        subjectScores,
        total,
        average,
        grade,
      }
    }),
  )

  // Calculate positions (dense ranking by average)
  const positionMap = new Map<string, number>()
  const sortedByAverage = [...broadsheetData]
    .filter((d) => d.average !== null)
    .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))

  let lastAverage: number | null = null
  let position = 1
  sortedByAverage.forEach((data, idx) => {
    if (data.average !== lastAverage && lastAverage !== null) {
      position = idx + 1
    }
    positionMap.set(data.pupilId, position)
    lastAverage = data.average
  })

  broadsheetData.forEach((d) => {
    if (!positionMap.has(d.pupilId) && d.average !== null) {
      positionMap.set(d.pupilId, position)
    }
  })

  // Calculate subject statistics
  const subjectStats = subjects.map((subject) => {
    const scores = broadsheetData
      .flatMap((d) => d.subjectScores.filter((s) => s.subjectId === subject.id && s.totalScore !== null))
      .map((s) => s.totalScore!)

    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
    const highest = scores.length > 0 ? Math.max(...scores) : null
    const lowest = scores.length > 0 ? Math.min(...scores) : null

    return {
      subjectId: subject.id,
      avg,
      highest,
      lowest,
    }
  })

  // Overall statistics
  const allScores = broadsheetData
    .flatMap((d) => d.subjectScores.filter((s) => s.totalScore !== null))
    .map((s) => s.totalScore!)
  const classAverage = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/results" className="text-sm font-medium text-brand hover:underline">
          ← Back to results
        </Link>
        <div className="flex gap-2">
          <Button href="/admin/results" variant="secondary">
            All assessments
          </Button>
        </div>
      </div>

      <article className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="border-b border-border pb-5">
          <h1 className="text-2xl font-semibold text-foreground">{assessment.name} — {selectedClass.name}</h1>
          <p className="mt-2 text-sm text-muted">Class broadsheet with subject scores, totals, and class positions</p>
        </div>

        <BroadsheetClient
          assessmentId={assessmentId}
          assessmentName={assessment.name}
          className={selectedClass.name}
          classes={filterClasses}
          selectedClassId={selectedClassId}
          broadsheetData={broadsheetData}
          subjects={subjects}
          subjectStats={subjectStats}
          classAverage={classAverage}
          positionMap={Object.fromEntries(positionMap)}
        />
      </article>
    </div>
  )
}
