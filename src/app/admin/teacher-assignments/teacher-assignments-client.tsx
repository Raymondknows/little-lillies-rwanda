"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { saveTeacherAssignments } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TeacherAssignmentsPageClient({
  teachers,
  classes,
  subjects,
}: {
  teachers: any[];
  classes: any[];
  subjects: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherList, setTeacherList] = useState(teachers);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teacherList;
    const query = searchQuery.toLowerCase();
    return teacherList.filter((teacher) => {
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
  }, [teacherList, searchQuery]);

  const openTeacherModal = (teacher: any) => {
    setSelectedTeacher(teacher);
    setSelectedClassIds(teacher.teacherClasses.map((tc: any) => tc.classId));
    setSelectedSubjectIds(teacher.teacherSubjects.map((ts: any) => ts.subjectId));
    setSaveError(null);
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClassIds((current) =>
      current.includes(classId)
        ? current.filter((id) => id !== classId)
        : [...current, classId],
    );
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjectIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId],
    );
  };

  const handleSaveAssignments = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeacher) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("teacherId", selectedTeacher.id);
      selectedClassIds.forEach((classId) => formData.append("classes", classId));
      selectedSubjectIds.forEach((subjectId) => formData.append("subjects", subjectId));

      try {
        await saveTeacherAssignments(formData);

        const updatedTeacher = {
          ...selectedTeacher,
          teacherClasses: classes
            .filter((cls) => selectedClassIds.includes(cls.id))
            .map((cls) => ({ classId: cls.id, class: cls })),
          teacherSubjects: subjects
            .filter((subj) => selectedSubjectIds.includes(subj.id))
            .map((subj) => ({ subjectId: subj.id, subject: subj })),
        };

        setTeacherList((current) =>
          current.map((teacher) =>
            teacher.id === updatedTeacher.id ? updatedTeacher : teacher,
          ),
        );
        setSelectedTeacher(updatedTeacher);
        setSaveError(null);
      } catch (error: any) {
        setSaveError(error?.message || "Unable to save assignments.");
      }
    });
  };

  return (
    <div className="w-full">
      <div className="mb-4 text-sm text-brand">
        <Link href="/admin" className="hover:underline">
          ← Admin
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-foreground">Teacher Assignments</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Assign teachers to classes and subjects in a cleaner workflow.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by teacher, class, or subject..."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {/* Desktop Table */}
        <table className="hidden sm:table w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Classes</th>
              <th className="px-4 py-2 font-medium">Subjects</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-t border-border hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2 font-medium text-foreground">{teacher.name}</td>
                  <td className="px-4 py-2 text-muted">{teacher.email}</td>
                  <td className="px-4 py-2 text-sm text-muted">
                    {teacher.teacherClasses.length > 0 ? (
                      <span>{teacher.teacherClasses.length} class{teacher.teacherClasses.length === 1 ? "" : "es"}</span>
                    ) : (
                      <span>No classes</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-muted">
                    {teacher.teacherSubjects.length > 0 ? (
                      <span>{teacher.teacherSubjects.length} subject{teacher.teacherSubjects.length === 1 ? "" : "s"}</span>
                    ) : (
                      <span>No subjects</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Button type="button" variant="secondary" className="text-xs px-2 py-1" onClick={() => openTeacherModal(teacher)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted">
                  No assignments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile List */}
        <div className="sm:hidden space-y-2 p-4">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => openTeacherModal(teacher)}
                className="block w-full text-left rounded-lg border border-border bg-surface px-3 py-2 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{teacher.name}</p>
                  </div>
                  <div className="flex-shrink-0 text-right ml-2">
                    <p className="text-xs text-muted">
                      {teacher.teacherClasses.length} class{teacher.teacherClasses.length === 1 ? "" : "es"}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-sm text-muted py-4">
              No assignments found.
            </div>
          )}
        </div>
      </div>

      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{selectedTeacher.name}</h2>
                <p className="mt-2 text-sm text-muted">{selectedTeacher.email}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedTeacher(null)}>
                Close
              </Button>
            </div>

            <form onSubmit={handleSaveAssignments} className="space-y-6">
              <input type="hidden" name="teacherId" value={selectedTeacher.id} />

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Assign Classes</h3>
                    <span className="text-xs text-muted">{selectedClassIds.length} selected</span>
                  </div>
                  <div className="space-y-2">
                    {classes.length === 0 ? (
                      <p className="text-sm text-muted">No classes available</p>
                    ) : (
                      classes.map((cls) => {
                        const isAssigned = selectedClassIds.includes(cls.id);
                        return (
                          <label key={cls.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:bg-surface">
                            <input
                              type="checkbox"
                              name="classes"
                              value={cls.id}
                              checked={isAssigned}
                              onChange={() => handleClassToggle(cls.id)}
                              className="h-4 w-4"
                            />
                            <span className="flex-1 text-sm">
                              {cls.name}
                              {cls.arm ? ` ${cls.arm}` : ""}
                            </span>
                            {isAssigned && <Badge variant="success">Assigned</Badge>}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Assign Subjects</h3>
                    <span className="text-xs text-muted">{selectedSubjectIds.length} selected</span>
                  </div>
                  <div className="space-y-2">
                    {subjects.length === 0 ? (
                      <p className="text-sm text-muted">No subjects available</p>
                    ) : (
                      subjects.map((subject) => {
                        const isAssigned = selectedSubjectIds.includes(subject.id);
                        return (
                          <label key={subject.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:bg-surface">
                            <input
                              type="checkbox"
                              name="subjects"
                              value={subject.id}
                              checked={isAssigned}
                              onChange={() => handleSubjectToggle(subject.id)}
                              className="h-4 w-4"
                            />
                            <span className="flex-1 text-sm">{subject.name}</span>
                            {isAssigned && <Badge variant="success">Assigned</Badge>}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {saveError ? (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  {saveError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <p className="text-sm text-muted">
                  {selectedClassIds.length} classes · {selectedSubjectIds.length} subjects currently selected
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => setSelectedTeacher(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Save assignments"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
