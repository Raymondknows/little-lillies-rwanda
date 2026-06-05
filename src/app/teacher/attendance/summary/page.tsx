import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import AttendanceReportClient from "@/components/attendance-report-client";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { getStaffSession } from "@/lib/auth";
import { getTeacherClasses } from "@/lib/teacher-permissions";

export default async function TeacherAttendanceSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const schoolId = await getCurrentSchoolId();
  const classes = await getTeacherClasses(session.userId, schoolId);
  const { classId, date } = await searchParams;
  const selectedClassId = classId ?? classes[0]?.classId;
  const dateValue = date ?? new Date().toISOString().slice(0, 10);

  if (!selectedClassId || !classes.some((item) => item.classId === selectedClassId)) {
    redirect("/teacher/attendance");
  }

  const pupils = await prisma.pupil.findMany({
    where: { schoolId, classId: selectedClassId, isActive: true },
    orderBy: { lastName: "asc" },
  });

  const selectedDate = new Date(dateValue);
  const existingRecords = await prisma.attendanceRecord.findMany({
    where: { schoolId, classId: selectedClassId, date: selectedDate },
    select: { pupilId: true, status: true },
  });

  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - ((selectedDate.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weeklyRecords = await prisma.attendanceRecord.findMany({
    where: {
      schoolId,
      classId: selectedClassId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Get school name for report
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { name: true },
  });

  const selectedClass = classes.find((item) => item.classId === selectedClassId);

  // Build student records with attendance breakdown
  const studentRecords = pupils.map((pupil) => {
    const weeklyStudentRecords = weeklyRecords.filter((r) => r.pupilId === pupil.id);
    const present = weeklyStudentRecords.filter((r) => r.status === "PRESENT").length;
    const absent = weeklyStudentRecords.filter((r) => r.status === "ABSENT").length;
    const late = weeklyStudentRecords.filter((r) => r.status === "LATE").length;
    const total = weeklyStudentRecords.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    return {
      firstName: pupil.firstName,
      lastName: pupil.lastName,
      present,
      absent,
      late,
      total,
      percentage,
    };
  });

  const summary = {
    expectedPupils: pupils.length,
    recorded: existingRecords.length,
    present: existingRecords.filter((record) => record.status === "PRESENT").length,
    absent: existingRecords.filter((record) => record.status === "ABSENT").length,
    late: existingRecords.filter((record) => record.status === "LATE").length,
    completion:
      pupils.length > 0 ? (existingRecords.length / pupils.length) * 100 : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Report</h1>
          <p className="mt-2 text-sm text-muted">
            {selectedClass?.class.name}
            {selectedClass?.class.arm ? ` ${selectedClass.class.arm}` : ""}
          </p>
        </div>
        <Button href="/teacher/attendance" variant="secondary">
          Back to attendance
        </Button>
      </div>

      <AttendanceReportClient
        className={selectedClass?.class.name ?? ""}
        classArm={selectedClass?.class.arm ?? ""}
        schoolName={school?.name ?? "School"}
        reportDate={new Date().toLocaleDateString()}
        startDate={weekStart.toLocaleDateString()}
        endDate={weekEnd.toLocaleDateString()}
        students={studentRecords}
        summary={summary}
      />
    </div>
  );
}
