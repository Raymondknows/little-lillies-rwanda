"use client";

export default function TeacherAssignmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Teacher Assignments</h1>
        <p className="mt-1 text-muted">
          Assign teachers to classes and subjects.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-muted">Teacher assignment interface loading...</p>
        <p className="mt-2 text-sm text-muted">Manage teacher-class and teacher-subject assignments coming soon.</p>
      </div>
    </div>
  );
}
