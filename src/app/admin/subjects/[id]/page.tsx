"use client";

import Link from "next/link";

export default function EditSubjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/subjects" className="text-sm text-brand hover:underline">← Subjects</Link>
      <h1 className="mt-4 text-2xl font-bold">Edit subject</h1>
      <div className="mt-6 text-muted">Subject edit form available from backend API</div>
    </div>
  );
}
