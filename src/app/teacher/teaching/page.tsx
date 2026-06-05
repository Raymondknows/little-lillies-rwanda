import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, PenTool, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { getStaffSession } from "@/lib/auth";
import { getTeacherClasses, getTeacherSubjects } from "@/lib/teacher-permissions";
import { ClassSubjectsModal } from "./class-subjects-modal";

export default async function TeacherTeachingPage() {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const schoolId = await getCurrentSchoolId();
  const teacherClasses = await getTeacherClasses(session.userId, schoolId);
  const teacherSubjects = await getTeacherSubjects(session.userId, schoolId);
  const classIds = teacherClasses.map((assignment) => assignment.classId);

  const classDetails = await Promise.all(
    teacherClasses.map(async (tc) => {
      const studentCount = await prisma.pupil.count({
        where: { classId: tc.classId, schoolId, isActive: true },
      });

      const classSubjects = await prisma.subjectClass.findMany({
        where: { classId: tc.classId, schoolId },
        include: { subject: true },
      });

      return {
        id: tc.classId,
        name: tc.class.name,
        arm: tc.class.arm,
        phase: tc.class.phase,
        studentCount,
        subjects: classSubjects.map((cs) => ({
          id: cs.subject.id,
          name: cs.subject.name,
        })),
      };
    })
  );

  const subjectDetails = await Promise.all(
    teacherSubjects.map(async (ts) => {
      const classesTeaching = await prisma.subjectClass.findMany({
        where: {
          subjectId: ts.subjectId,
          schoolId,
          classId: { in: classIds },
        },
        include: { class: true },
      });

      let totalStudents = 0;
      const classes = await Promise.all(
        classesTeaching.map(async (sc) => {
          const count = await prisma.pupil.count({
            where: { classId: sc.classId, schoolId, isActive: true },
          });
          totalStudents += count;
          return {
            id: sc.classId,
            name: sc.class.name,
            arm: sc.class.arm,
            studentCount: count,
          };
        })
      );

      return {
        id: ts.subjectId,
        name: ts.subject.name,
        totalStudents,
        classes: classes.sort((a, b) => a.name.localeCompare(b.name)),
      };
    })
  );

  const sortedClasses = classDetails.sort((a, b) => a.name.localeCompare(b.name));
  const sortedSubjects = subjectDetails.sort((a, b) => a.name.localeCompare(b.name));
  const totalStudents = sortedClasses.reduce((sum, item) => sum + item.studentCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Teaching</h1>
        <p className="mt-2 text-sm text-muted">All your assigned classes and subjects in one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
              <BookOpen className="h-5 w-5 text-brand" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">Classes assigned</p>
          <p className="mt-1 text-xl font-bold text-foreground">{sortedClasses.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
              <PenTool className="h-5 w-5 text-brand" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">Subjects assigned</p>
          <p className="mt-1 text-xl font-bold text-foreground">{sortedSubjects.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
              <Users className="h-5 w-5 text-brand" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">Students in assigned classes</p>
          <p className="mt-1 text-xl font-bold text-foreground">{totalStudents}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <table className="hidden sm:table w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Class</th>
              <th className="px-6 py-3 font-medium">Phase</th>
              <th className="px-6 py-3 font-medium">Students</th>
              <th className="px-6 py-3 font-medium">Subjects</th>
              <th className="px-6 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedClasses.map((course) => (
              <tr key={course.id} className="border-t border-border hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">
                  {course.name}
                  {course.arm ? ` ${course.arm}` : ""}
                </td>
                <td className="px-6 py-4 text-muted capitalize">{course.phase.toLowerCase().replace("_", " ")}</td>
                <td className="px-6 py-4 text-muted">{course.studentCount}</td>
                <td className="px-6 py-4 text-muted">
                  <ClassSubjectsModal
                    classId={course.id}
                    className={course.name}
                    classArm={course.arm ?? undefined}
                    subjects={course.subjects}
                  />
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/teacher/attendance?classId=${course.id}`}
                    className="inline-flex rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-hover"
                  >
                    Take attendance
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="sm:hidden space-y-2 p-4">
          {sortedClasses.map((course) => (
            <div key={course.id} className="border-b border-border pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{course.name}{course.arm ? ` ${course.arm}` : ""}</p>
                  <p className="text-xs text-muted mt-1 capitalize">{course.phase.toLowerCase().replace("_", " ")} phase</p>
                </div>
                <span className="text-xs font-semibold text-muted">{course.studentCount} students</span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <ClassSubjectsModal
                  classId={course.id}
                  className={course.name}
                  classArm={course.arm ?? undefined}
                  subjects={course.subjects}
                />
                <Link
                  href={`/teacher/attendance?classId=${course.id}`}
                  className="inline-flex rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-hover"
                >
                  Take attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <table className="hidden sm:table w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Classes</th>
              <th className="px-6 py-3 font-medium">Students</th>
              <th className="px-6 py-3 font-medium">Assigned classes</th>
            </tr>
          </thead>
          <tbody>
            {sortedSubjects.map((subject) => (
              <tr key={subject.id} className="border-t border-border hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{subject.name}</td>
                <td className="px-6 py-4 text-muted">{subject.classes.length}</td>
                <td className="px-6 py-4 text-muted">{subject.totalStudents}</td>
                <td className="px-6 py-4 text-muted">
                  {subject.classes.map((cls) => `${cls.name}${cls.arm ? ` ${cls.arm}` : ""}`).join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="sm:hidden space-y-2 p-4">
          {sortedSubjects.map((subject) => (
            <div key={subject.id} className="border-b border-border pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{subject.name}</p>
                  <p className="text-xs text-muted mt-1">{subject.classes.length} {subject.classes.length === 1 ? "class" : "classes"}</p>
                </div>
                <span className="text-xs font-semibold text-muted">{subject.totalStudents} students</span>
              </div>
              <p className="mt-3 text-sm text-muted">
                {subject.classes.map((cls) => `${cls.name}${cls.arm ? ` ${cls.arm}` : ""}`).join(", ") || "No classes assigned"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
