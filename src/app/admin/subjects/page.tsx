import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import SubjectsPageClient from "./subjects-client";

export default async function AdminSubjectsPage() {
  const schoolId = await getCurrentSchoolId();
  const [subjects, classes, subjectClasses, teacherSubjects] = await Promise.all([
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: "asc" } }),
    prisma.class.findMany({ where: { schoolId }, orderBy: { name: "asc" } }),
    prisma.subjectClass.findMany({ where: { schoolId }, include: { class: true } }),
    prisma.teacherSubject.findMany({ where: { schoolId }, include: { teacher: true } }),
  ]);

  return (
    <SubjectsPageClient
      subjects={subjects}
      classes={classes}
      subjectClasses={subjectClasses}
      teacherSubjects={teacherSubjects}
    />
  );
}
