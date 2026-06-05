import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStaffSession } from "@/lib/auth";
import { getCurrentSchool } from "@/lib/school";
import { getTeacherClasses, getTeacherSubjects } from "@/lib/teacher-permissions";
import { Button } from "@/components/ui/button";

export default async function TeacherProfilePage() {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const school = await getCurrentSchool();
  const classes = await getTeacherClasses(session.userId, school.id);
  const subjects = await getTeacherSubjects(session.userId, school.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
          <p className="mt-1 text-sm text-muted">Your teacher profile and assigned teaching scope.</p>
        </div>
        <Link
          href="/teacher"
          aria-label="Back to teacher dashboard"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand text-white shadow-sm transition hover:bg-brand-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        <div className="p-4 space-y-4 sm:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Your details</p>
            <div className="mt-3 space-y-2 text-sm text-foreground">
              <div>Name: {session.name}</div>
              <div>Email: {session.email}</div>
              <div>School: {school.name}</div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Assigned teaching scope</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-foreground">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted">Classes</p>
                <p className="mt-2 font-semibold">{classes.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted">Subjects</p>
                <p className="mt-2 font-semibold">{subjects.length}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Assigned classes</p>
            <div className="mt-3 space-y-2 text-sm text-foreground">
              {classes.length > 0 ? (
                classes.map((assignment) => (
                  <div key={assignment.classId} className="flex items-center justify-between">
                    <p>{assignment.class.name}{assignment.class.arm ? ` ${assignment.class.arm}` : ""}</p>
                    <p className="text-xs text-muted">{assignment.class.phase}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted">No assigned classes found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted">
        <p>Note: If any of these details look incorrect, please contact your school administrator to update your profile.</p>
      </div>
    </div>
  );
}
