import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function TeacherProfilePage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
          <p className="mt-1 text-sm text-muted">Teacher profile and assignments available from backend API.</p>
        </div>
        <Link
          href="/teacher"
          aria-label="Back to teacher dashboard"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand text-white shadow-sm transition hover:bg-brand-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <p className="text-sm text-muted">This page has been stubbed. Profile data is available from the backend API.</p>
      </div>
    </div>
  );
}
