import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText, Table2 } from "lucide-react";
import { approveAssessmentForm, saveResultMarks, returnAssessmentToDraftForm } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { PublishButton } from "@/components/admin/publish-button";
import { ReturnToDraftButton } from "@/components/admin/return-to-draft-button";
import { ResultsEntryForm } from "@/components/admin/results-entry-form";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { resultStatusLabel } from "@/lib/format";
import { getStaffSession } from "@/lib/auth";
import { getCurrentSchoolId } from "@/lib/school";
import { getTeacherAccessibleClassIds } from "@/lib/teacher-permissions";

export default async function AssessmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ classId?: string }>;
}) {
  const { id } = await params;
  const { classId } = await searchParams;
  const schoolId = await getCurrentSchoolId();
  const session = await getStaffSession();
  
  // Check teacher permissions
  let accessibleClassIds: string[] | null = null;
  if (session && session.role === "TEACHER") {
    accessibleClassIds = await getTeacherAccessibleClassIds(session.userId, schoolId);
    if (accessibleClassIds.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="text-muted">
            No classes assigned. Please contact your administrator.
          </p>
        </div>
      );
    }
  }

  const assessment = await prisma.assessment.findFirst({
    where: { id, schoolId },
    include: { term: true },
  });
  if (!assessment) notFound();

  let classes = await prisma.class.findMany({
    where: { schoolId, phase: assessment.phase },
    orderBy: { name: "asc" },
  });

  if (accessibleClassIds) {
    const allowedClasses = new Set(accessibleClassIds);
    classes = classes.filter((classItem) => allowedClasses.has(classItem.id));
  }

  const selectedClassId = classId && classes.some((c) => c.id === classId)
    ? classId
    : classes[0]?.id;

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const pupils = selectedClassId
    ? await prisma.pupil.findMany({
        where: {
          schoolId,
          isActive: true,
          classId: selectedClassId,
        },
        include: {
          class: true,
        },
        orderBy: { lastName: "asc" },
      })
    : [];

  // Load any existing results for this assessment and class so the UI can show saved subjects/scores
  const existingResults = selectedClassId
    ? await prisma.result.findMany({
        where: {
          assessmentId: id,
          pupil: { classId: selectedClassId },
        },
        select: {
          pupilId: true,
          subjectId: true,
          caScore: true,
          testScore: true,
          examScore: true,
          comment: true,
        },
      })
    : [];

  // Load all subjects in school for manual selection
  let allSubjects = await prisma.subject.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });

  // If teacher, filter subjects to only assigned ones
  if (session && session.role === "TEACHER") {
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { teacherId: session.userId, schoolId },
      include: { subject: true },
    });
    allSubjects = teacherSubjects.map((ts) => ts.subject);
  }

  // Load grading scale for automatic grade calculation
  const gradingScales = await prisma.gradingScale.findMany({
    where: { schoolId },
    orderBy: { minScore: "asc" },
  });

  const readonly = assessment.status === "PUBLISHED";
  const locked = assessment.status === "APPROVED"; // Teachers can't edit
  const canReturnToDraft = session?.role === "SCHOOL_ADMIN" && assessment.status === "APPROVED";

  return (
    <div>
      <Link href="/admin/results" className="text-sm text-brand hover:underline">
        ← Results
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{assessment.name}</h1>
          <p className="text-muted">{assessment.term.name}</p>
        </div>
        <Badge variant={assessment.status === "PUBLISHED" ? "success" : assessment.status === "APPROVED" ? "brand" : "default"}>
          {resultStatusLabel(assessment.status)}
        </Badge>
      </div>

      {readonly ? (
        <p className="mt-4 text-sm text-success">Published — parents can see these marks.</p>
      ) : locked && session?.role === "TEACHER" ? (
        <div className="mt-4 rounded-lg border border-brand-light bg-brand-light/10 p-3">
          <p className="text-sm text-brand font-medium">
            ⏱️ Assessment approved — awaiting final review by administrator
          </p>
          <p className="text-sm text-brand/70 mt-1">
            Teachers cannot edit at this stage. Contact your administrator if corrections are needed.
          </p>
        </div>
      ) : locked && session?.role === "SCHOOL_ADMIN" ? (
        <div className="mt-4 rounded-lg border border-brand-light bg-brand-light/10 p-3">
          <p className="text-sm text-brand font-medium">
            ✓ Assessment approved — ready for final review
          </p>
          <p className="text-sm text-brand/70 mt-1">
            Teachers cannot edit. You can return to draft or publish.
          </p>
        </div>
      ) : null}

      {classes.length > 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-4">
            <form method="get" className="flex flex-wrap items-end gap-3">
              <label className="min-w-[220px] text-sm">
                Class
                <select
                  name="classId"
                  defaultValue={selectedClassId}
                  className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                      {classItem.arm ? ` ${classItem.arm}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" variant="secondary">
                Load class
              </Button>
            </form>
            {selectedClass && (
              <div className="text-sm text-muted">
                Enter marks for <span className="font-semibold text-foreground">{selectedClass.name}{selectedClass.arm ? ` ${selectedClass.arm}` : ""}</span>.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-border bg-surface p-6">
          <p className="text-sm text-muted">
            No active classes found for the {assessment.phase.toLowerCase().replace("_", " ")} phase.
          </p>
        </div>
      )}

      {!readonly && !locked && classes.length > 0 && (
        <ResultsEntryForm
          pupils={pupils}
          allSubjects={allSubjects}
          gradingScales={gradingScales}
          assessmentId={id}
          selectedClassId={selectedClassId}
          existingResults={existingResults}
        />
      )}

      {/* View Report & Broadsheet Links - Always Visible */}
      <div className="mt-6 flex flex-wrap gap-6">
        <Link href={`/admin/results/${id}/broadsheet`} className="flex items-center gap-2 text-sm text-brand hover:underline">
          <Table2 className="h-5 w-5" />
          <span>View class broadsheet</span>
        </Link>
      </div>

      {!readonly && assessment.status === "DRAFT" && (
        <form action={approveAssessmentForm} className="mt-4">
          <input type="hidden" name="assessmentId" value={id} />
          <Button type="submit" variant="secondary">
            Mark ready to publish
          </Button>
        </form>
      )}

      {assessment.status === "APPROVED" && (
        <div className="mt-6 flex flex-wrap gap-3">
          <PublishButton assessmentId={id} />
          {session?.role === "SCHOOL_ADMIN" && (
            <ReturnToDraftButton assessmentId={id} />
          )}
        </div>
      )}
    </div>
  );
}
