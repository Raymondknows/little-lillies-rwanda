import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, FileText, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherDashboardSlideOuts } from "@/components/teacher/dashboard-slide-outs";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { getStaffSession } from "@/lib/auth";
import { pupilName } from "@/lib/format";

function mapTeacherStatus(status: string) {
  switch (status) {
    case "DRAFT":
      return "Pending";
    case "APPROVED":
      return "Submitted";
    case "PUBLISHED":
      return "Published";
    default:
      return status;
  }
}

export default async function TeacherDashboardPage() {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const schoolId = await getCurrentSchoolId();
  const today = new Date().toISOString().slice(0, 10);

  const assignedClasses = await prisma.teacherClass.findMany({
    where: { teacherId: session.userId, schoolId },
    include: {
      class: {
        include: {
          _count: { select: { pupils: true } },
        },
      },
    },
    orderBy: { class: { name: "asc" } },
  });

  const assignedSubjects = await prisma.teacherSubject.findMany({
    where: { teacherId: session.userId, schoolId },
    include: { subject: true },
  });

  const classIds = assignedClasses.map((assignment) => assignment.classId);
  const classPhases = Array.from(new Set(assignedClasses.map((assignment) => assignment.class.phase)));

  const [announcements, attendanceRecords, assessments, students] = await Promise.all([
    prisma.announcement.findMany({
      where: { schoolId, published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.attendanceRecord.findMany({
      where: {
        schoolId,
        classId: { in: classIds },
        date: new Date(today),
      },
    }),
    prisma.assessment.findMany({
      where: { schoolId, phase: { in: classPhases } },
      orderBy: { createdAt: "desc" },
      include: { term: true },
      take: 12,
    }),
    prisma.pupil.findMany({
      where: { schoolId, classId: { in: classIds }, isActive: true },
      include: { class: true },
      orderBy: { lastName: "asc" },
      take: 8,
    }),
  ]);

  const attendanceByClass = assignedClasses.map((assignment) => {
    const count = attendanceRecords.filter((record) => record.classId === assignment.classId).length;
    return {
      classItem: assignment.class,
      status: count === 0 ? "Not taken" : "Completed",
    };
  });

  const continueAssessment = assessments.find((assessment) => assessment.status === "DRAFT")
    ?? assessments.find((assessment) => assessment.status === "APPROVED");

  const pendingAssessmentCount = assessments.filter((assessment) => assessment.status !== "PUBLISHED").length;
  const pendingAttendanceCount = attendanceByClass.filter((item) => item.status !== "Completed").length;
  const announcementCount = announcements.length;

  const assignmentCards = assignedClasses.flatMap((assignment) =>
    assignedSubjects.map((subjectAssignment) => ({
      classItem: assignment.class,
      subject: subjectAssignment.subject,
    })),
  );

  const pendingRows = assessments.flatMap((assessment) =>
    assignedClasses
      .filter((assignment) => assignment.class.phase === assessment.phase)
      .map((assignment) => ({
        assessment,
        classItem: assignment.class,
      })),
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Teacher workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{session.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Your teaching workspace is scoped to assigned classes, subjects, and the tasks you need to finish today.
            </p>
          </div>
          <Button href="/teacher/results" variant="secondary" className="w-full sm:w-auto">
            Open result workflow
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
                <FileText className="h-5 w-5 text-brand" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">Pending result entries</p>
            <p className="mt-1 text-xl font-bold text-foreground">{pendingAssessmentCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
                <ClipboardList className="h-5 w-5 text-brand" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">Attendance registers today</p>
            <p className="mt-1 text-xl font-bold text-foreground">{pendingAttendanceCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
                <Bell className="h-5 w-5 text-brand" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">Current announcements</p>
            <p className="mt-1 text-xl font-bold text-foreground">{announcementCount}</p>
          </div>
        </div>

        <div>
          <TeacherDashboardSlideOuts
            continueAssessment={continueAssessment}
            pendingRows={pendingRows}
            attendanceByClass={attendanceByClass}
            announcements={announcements}
            students={students}
            assignmentCards={assignmentCards}
          />
        </div>
      </div>

      {continueAssessment ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Continue where you stopped</h2>
              <p className="mt-2 text-sm text-muted">
                Resume the latest assessment in progress and keep the flow moving.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {/* Desktop Table */}
            <table className="hidden sm:table w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-6 py-3 font-medium">Assessment</th>
                  <th className="px-6 py-3 font-medium">Term</th>
                  <th className="px-6 py-3 font-medium">Phase</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{continueAssessment.name}</td>
                  <td className="px-6 py-4 text-muted">{continueAssessment.term.name}</td>
                  <td className="px-6 py-4 text-muted">{continueAssessment.phase}</td>
                  <td className="px-6 py-4 text-muted">
                    {mapTeacherStatus(continueAssessment.status)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/teacher/results/${continueAssessment.id}`}
                      className="bg-brand text-white hover:bg-brand-dark px-4 py-2 text-xs font-medium rounded-lg transition"
                    >
                      Continue editing
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Mobile Card */}
            <div className="sm:hidden p-4">
              <Link
                href={`/teacher/results/${continueAssessment.id}`}
                className="block rounded-lg border border-border bg-surface px-4 py-3 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{continueAssessment.name}</p>
                    <p className="text-xs text-muted mt-1">{continueAssessment.term.name} • {continueAssessment.phase}</p>
                  </div>
                  <div className="flex-shrink-0 text-right ml-2">
                    <p className="text-xs text-muted">{mapTeacherStatus(continueAssessment.status)}</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
