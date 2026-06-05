import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import TeacherAssignmentsPageClient from "./teacher-assignments-client";

export default async function TeacherAssignmentsPage() {
  const schoolId = await getCurrentSchoolId();

  const teachers = await prisma.user.findMany({
    where: { schoolId, role: "TEACHER" },
    include: {
      teacherClasses: { include: { class: true } },
      teacherSubjects: { include: { subject: true } },
    },
    orderBy: { name: "asc" },
  });

  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });

  const subjects = await prisma.subject.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });

  return <TeacherAssignmentsPageClient teachers={teachers} classes={classes} subjects={subjects} />;
}

