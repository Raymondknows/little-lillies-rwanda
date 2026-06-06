import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTeacher, deleteTeacher } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const schoolId = await getCurrentSchoolId();
  const [teacher, classes, subjects] = await Promise.all([
    prisma.user.findFirst({ where: { id, schoolId, role: 'TEACHER' }, include: { teacherClasses: true, teacherSubjects: true } }),
    prisma.class.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
  ]);

  if (!teacher) notFound();

  const assignedClassIds = new Set(teacher.teacherClasses.map((c) => c.classId));
  const assignedSubjectIds = new Set(teacher.teacherSubjects.map((s) => s.subjectId));

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/teachers" className="text-sm text-brand hover:underline">← Teachers</Link>
      <h1 className="mt-4 text-2xl font-bold">Edit teacher</h1>

      <form action={updateTeacher} className="mt-6 rounded-xl border border-border bg-surface p-6">
        <input type="hidden" name="id" value={teacher.id} />
        <label className="text-sm font-medium">
          Full name
          <input name="name" defaultValue={teacher.name} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium mt-4">
          Email
          <input name="email" defaultValue={teacher.email} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>

        <label className="text-sm font-medium mt-4">
          Password
          <input
            name="password"
            type="password"
            placeholder="Leave blank to keep existing password"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted mt-2">
            Enter a new password only if you want to update this teacher’s login.
          </p>
        </label>

        <label className="text-sm font-medium mt-4">
          Assign classes
          <select name="classIds" multiple size={4} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
            {classes.map((c) => (
              <option key={c.id} value={c.id} selected={assignedClassIds.has(c.id)}>
                {c.name}{c.arm ? ` ${c.arm}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium mt-4">
          Assign subjects
          <select name="subjectIds" multiple size={4} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
            {subjects.map((s) => (
              <option key={s.id} value={s.id} selected={assignedSubjectIds.has(s.id)}>{s.name}</option>
            ))}
          </select>
        </label>

        <div className="mt-4 flex gap-2">
          <Button type="submit">Save</Button>
        </div>
      </form>

      <form action={deleteTeacher} className="mt-4">
        <input type="hidden" name="id" value={teacher.id} />
        <Button type="submit" variant="secondary">Delete teacher</Button>
      </form>
    </div>
  );
}
