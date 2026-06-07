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

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/subjects" className="text-sm text-brand hover:underline">← Subjects</Link>
      <h1 className="mt-4 text-2xl font-bold">Edit subject</h1>

      <form action={updateSubject} className="mt-6 rounded-xl border border-border bg-surface p-6">
        <input type="hidden" name="id" value={subject.id} />
        <label className="text-sm font-medium">
          Name
          <input name="name" defaultValue={subject.name} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium mt-4">
          Assign to classes
          <select
            name="classIds"
            multiple
            size={5}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id} selected={assignedClassIds.has(classItem.id)}>
                {classItem.name}
                {classItem.arm ? ` ${classItem.arm}` : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4 flex gap-2">
          <Button type="submit">Save</Button>
        </div>
      </form>

      <form action={deleteSubject} className="mt-4">
        <input type="hidden" name="id" value={subject.id} />
        <Button type="submit" variant="secondary">Delete subject</Button>
      </form>
    </div>
  );
}
