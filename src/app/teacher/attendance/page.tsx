import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { getStaffSession } from "@/lib/auth";
import { getTeacherClasses } from "@/lib/teacher-permissions";
import TeacherAttendancePageClient from "./attendance-client";

export default async function TeacherAttendancePage({ searchParams }: { searchParams: { classId?: string; date?: string; success?: string } }) {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const schoolId = await getCurrentSchoolId();
  const classes = await getTeacherClasses(session.userId, schoolId);
  const selectedClassId = searchParams.classId ?? classes[0]?.classId;
  const dateValue = searchParams.date ?? new Date().toISOString().slice(0, 10);

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

  const showSuccess = searchParams.success === "1";

  return (
    <TeacherAttendancePageClient
      classes={classes.map((item) => item.class)}
      selectedClass={selectedClassId}
      pupils={pupils}
      today={dateValue}
      existingRecords={existingRecords}
      success={showSuccess}
    />
  );
}
