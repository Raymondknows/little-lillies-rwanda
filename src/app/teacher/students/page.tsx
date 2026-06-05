import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { getStaffSession } from "@/lib/auth";
import { getTeacherClasses } from "@/lib/teacher-permissions";
import TeacherStudentsPageClient from "./students-client";

export default async function TeacherStudentsPage() {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const schoolId = await getCurrentSchoolId();
  const classes = await getTeacherClasses(session.userId, schoolId);
  const classIds = classes.map((assignment) => assignment.classId);

  const students = await prisma.pupil.findMany({
    where: { schoolId, classId: { in: classIds }, isActive: true },
    include: { class: true, guardians: { include: { guardian: true } } },
    orderBy: [{ class: { name: "asc" } }, { lastName: "asc" }],
  });

  return <TeacherStudentsPageClient pupils={students} assignedClasses={classes} />;
}
