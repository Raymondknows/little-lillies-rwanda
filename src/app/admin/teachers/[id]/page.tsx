"use client";

import Link from "next/link";

export default function EditTeacherPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/teachers" className="text-sm text-brand hover:underline">← Teachers</Link>
      <h1 className="mt-4 text-2xl font-bold">Edit teacher</h1>
      <div className="mt-6 text-muted">Teacher edit form available from backend API</div>
    </div>
  );
}
