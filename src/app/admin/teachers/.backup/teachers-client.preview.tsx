"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createTeacher } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TeachersPageClient({
  classes,
  subjects,
  teachers,
}: {
  classes: any[];
  subjects: any[];
  teachers: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    const query = searchQuery.toLowerCase();
    return teachers.filter((teacher) => {
      const classNames = teacher.teacherClasses
        .map((assignment: any) => assignment.class?.name ?? "")
        .join(" ")
        .toLowerCase();
      const subjectNames = teacher.teacherSubjects
        .map((assignment: any) => assignment.subject?.name ?? "")
        .join(" ")
        .toLowerCase();
      return (
        teacher.name.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        classNames.includes(query) ||
        subjectNames.includes(query)
      );
    });
  }, [teachers, searchQuery]);

  return (
    <div className="w-full">
      <div className="mb-4 text-sm text-brand">
        <Link href="/admin" className="hover:underline">
          ← Admin
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-foreground">Teachers</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {teachers.length} teacher{teachers.length === 1 ? "" : "s"} assigned to classes and subjects.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={() => setIsOpen(true)}>Add teacher</Button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name, email, class, or subject..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Classes</th>
              <th className="px-6 py-3 font-medium">Subjects</th>
              <th className="px-6 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-t border-border hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{teacher.name}</td>
                  <td className="px-6 py-4 text-muted">{teacher.email}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {teacher.teacherClasses.length > 0 ? (
                      <span>{teacher.teacherClasses.length} class{teacher.teacherClasses.length === 1 ? "" : "es"}</span>
                    ) : (
                      <span>No classes</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {teacher.teacherSubjects.length > 0 ? (
                      <span>{teacher.teacherSubjects.length} subject{teacher.teacherSubjects.length === 1 ? "" : "s"}</span>
                    ) : (
                      <span>No subjects</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                      }}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Add teacher</h2>
                <p className="mt-2 text-sm text-muted">
                  Create a teacher account and assign classes and subjects in one place.
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>

            <form action={createTeacher} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Full name
                  <input
                    name="name"
                    required
                    placeholder="Aisha Bello"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium">
                  Email address
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="aisha@example.com"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="text-sm font-medium">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Create a secure password"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Assign classes
                  <select
                    name="classIds"
                    multiple
                    size={4}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}{classItem.arm ? ` ${classItem.arm}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Assign subjects
                  <select
                    name="subjectIds"
                    multiple
                    size={4}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save teacher</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{selectedTeacher.name}</h2>
                <p className="mt-2 text-sm text-muted">{selectedTeacher.email}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedTeacher(null)}>
                Close
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Assigned classes</p>
                {selectedTeacher.teacherClasses.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTeacher.teacherClasses.map((assignment: any) => (
                      <div key={assignment.id} className="rounded-xl bg-surface p-3 text-sm text-foreground">
                        {assignment.class?.name ?? "Unnamed class"}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No classes assigned</p>
                )}
              </div>

              <div className="space-y-4 rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Assigned subjects</p>
                {selectedTeacher.teacherSubjects.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTeacher.teacherSubjects.map((assignment: any) => (
                      <div key={assignment.id} className="rounded-xl bg-surface p-3 text-sm text-foreground">
                        {assignment.subject?.name ?? "Unnamed subject"}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No subjects assigned</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setSelectedTeacher(null)}>
                Close
              </Button>
              <Link href={`/admin/teachers/${selectedTeacher.id}`}>
                <Button>Edit teacher</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
