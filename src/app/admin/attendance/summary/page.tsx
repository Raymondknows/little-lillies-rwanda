import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import AttendanceReportClient from "@/components/attendance-report-client";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";

export default async function AdminAttendanceSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const schoolId = await getCurrentSchoolId();
  const { classId, date } = await searchParams;
  const today = date ?? new Date().toISOString().slice(0, 10);

  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });

  const selectedClass = classId ?? classes[0]?.id;

  if (!selectedClass) {
    redirect("/admin/attendance");
  }

  const pupils = await prisma.pupil.findMany({
    where: { schoolId, classId: selectedClass, isActive: true },
    orderBy: { lastName: "asc" },
  });

  const selectedDate = new Date(today);
  const existing = await prisma.attendanceRecord.findMany({
    where: {
      schoolId,
      classId: selectedClass,
      date: selectedDate,
    },
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
      classId: selectedClass,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Get school name and logo for report
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { name: true, logoUrl: true },
  });

  const selectedClassData = classes.find((c) => c.id === selectedClass);

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
    recorded: existing.length,
    present: existing.filter((record) => record.status === "PRESENT").length,
    absent: existing.filter((record) => record.status === "ABSENT").length,
    late: existing.filter((record) => record.status === "LATE").length,
    completion:
      pupils.length > 0 ? (existing.length / pupils.length) * 100 : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Report</h1>
          <p className="mt-2 text-sm text-muted">
            {selectedClassData?.name}
            {selectedClassData?.arm ? ` ${selectedClassData.arm}` : ""}
          </p>
        </div>
        <Button href="/admin/attendance" variant="secondary">
          Back to attendance
        </Button>
      </div>

      <AttendanceReportClient
        className={selectedClassData?.name ?? ""}
        classArm={selectedClassData?.arm ?? ""}
        schoolName={school?.name ?? "School"}
        schoolLogo={school?.logoUrl ?? undefined}
        reportDate={new Date().toLocaleDateString()}
        startDate={weekStart.toLocaleDateString()}
        endDate={weekEnd.toLocaleDateString()}
        students={studentRecords}
        summary={summary}
      />
    </div>
  );
}
