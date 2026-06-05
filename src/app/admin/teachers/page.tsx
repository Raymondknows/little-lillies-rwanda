import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import TeachersPageClient from "./teachers-client";

export default async function AdminTeachersPage() {
  const schoolId = await getCurrentSchoolId();
  const [classes, subjects, teachers] = await Promise.all([
    prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      where: { schoolId },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { schoolId, role: "TEACHER" },
      orderBy: { name: "asc" },
      include: {
        teacherClasses: { include: { class: true } },
        teacherSubjects: { include: { subject: true } },
      },
    }),
  ]);

  return <TeachersPageClient classes={classes} subjects={subjects} teachers={teachers} />;
}
