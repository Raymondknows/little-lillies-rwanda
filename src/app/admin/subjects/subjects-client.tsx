"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSubject, updateSubject, deleteSubject } from "@/app/admin/actions";
import { UserGuide } from "@/components/ui/user-guide";

const SUBJECTS_GUIDE = {
  title: "Subjects Management",
  overview: "Manage your school curriculum by creating subjects and assigning them to classes. Each subject can be taught by multiple teachers.",
  steps: [
    "Click 'Add subject' to create a new subject",
    "Enter the subject name (e.g., Mathematics, English, Science)",
    "Select which classes will study this subject",
    "Click 'Create' to save the subject",
    "Assign teachers to subjects from the Teachers page"
  ],
  commonTasks: [
    {
      title: "Create a new subject",
      description: "Use standard subject names (Math, English, Science) for consistency. Avoid abbreviations in the subject name."
    },
    {
      title: "Assign a subject to multiple classes",
      description: "When creating or editing a subject, select all applicable classes. For example, Mathematics is typically offered to all classes."
    },
    {
      title: "Assign teachers to subjects",
      description: "Go to Teachers page and assign each teacher to their subjects. One teacher can teach multiple subjects across different classes."
    },
    {
      title: "Search for a subject",
      description: "Use the search bar to find subjects by name, class assignment, or teacher name."
    },
    {
      title: "View subject assignments",
      description: "Click 'Details' on any subject to see which classes study it and which teachers teach it."
    }
  ],
  faqs: [
    {
      question: "Can I assign the same subject to multiple classes?",
      answer: "Yes, most subjects like Math and English are taught to all classes. You can select multiple classes when creating a subject."
    },
    {
      question: "Can a teacher teach multiple subjects?",
      answer: "Yes, teachers can be assigned to multiple subjects. Use the Teachers page to manage subject assignments."
    },
    {
      question: "What happens when I delete a subject?",
      answer: "Deleting a subject removes it from all class assignments and unassigns all teachers. Use caution as this affects results and timetables."
    },
    {
      question: "Can I rename a subject?",
      answer: "Yes, click 'Edit' on the subject to change its name. The change updates everywhere the subject is used."
    },
    {
      question: "Are there standard subject suggestions?",
      answer: "Consider your curriculum framework (WAEC, IGCSE, etc.). Standard subjects include Math, English, Science, Social Studies, Physical Education, Arts, etc."
    }
  ],
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
};

export default function SubjectsPageClient({
  classes,
  subjects,
  subjectClasses,
  teacherSubjects,
}: {
  classes: any[];
  subjects: any[];
  subjectClasses: any[];
  teacherSubjects: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const activeSubjectCount = subjects.length;
  const activeClassCount = classes.length;

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const query = searchQuery.toLowerCase();
    return subjects.filter((subject) => {
      const assignedClasses = subjectClasses
        .filter((sc) => sc.subjectId === subject.id)
        .map((sc) => sc.class?.name ?? "")
        .join(" ")
        .toLowerCase();
      const teacherNames = teacherSubjects
        .filter((ts) => ts.subjectId === subject.id)
        .map((ts) => ts.teacher?.name ?? "")
        .join(" ")
        .toLowerCase();
      return (
        subject.name.toLowerCase().includes(query) ||
        assignedClasses.includes(query) ||
        teacherNames.includes(query)
      );
    });
  }, [subjects, subjectClasses, teacherSubjects, searchQuery]);

  const openSubjectModal = (subject?: any) => {
    if (subject) {
      setSelectedSubject(subject);
      setSubjectName(subject.name);
      setSelectedClassIds(
        subjectClasses.filter((sc) => sc.subjectId === subject.id).map((sc) => sc.classId),
      );
    } else {
      setSelectedSubject(null);
      setSubjectName("");
      setSelectedClassIds([]);
    }
    setIsOpen(true);
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClassIds((current) =>
      current.includes(classId)
        ? current.filter((id) => id !== classId)
        : [...current, classId],
    );
  };

  const iconSubjectCount = (subject: any) =>
    subjectClasses.filter((sc) => sc.subjectId === subject.id).length;

  const teacherListForSubject = (subject: any) =>
    teacherSubjects
      .filter((ts) => ts.subjectId === subject.id)
      .map((ts) => ts.teacher?.name ?? "Unknown");

  return (
    <>
      <div className="w-full">
      <div className="mb-4 text-sm text-brand">
        <Link href="/admin" className="hover:underline">
          ← Admin
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Manage the curriculum with searchable subject records and class assignments.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center">
          <div className="hidden rounded-full bg-background px-4 py-2 text-sm text-muted sm:block">
            {activeSubjectCount} subject{activeSubjectCount === 1 ? "" : "s"} · {activeClassCount} class{activeClassCount === 1 ? "" : "es"}
          </div>
          <Button type="button" onClick={() => openSubjectModal()} className="w-full sm:w-auto">Add subject</Button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search subjects, classes, or teachers..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {/* Desktop Table */}
        <table className="hidden sm:table w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Subject</th>
              <th className="px-4 py-2 font-medium">Classes</th>
              <th className="px-4 py-2 font-medium">Teachers</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => {
                const assignedClasses = iconSubjectCount(subject);
                const teacherNames = teacherListForSubject(subject);
                return (
                  <tr key={subject.id} className="border-t border-border hover:bg-background/50 transition-colors">
                    <td className="px-4 py-2 font-medium text-foreground">{subject.name}</td>
                    <td className="px-4 py-2 text-sm text-muted">
                      {assignedClasses > 0 ? `${assignedClasses} class${assignedClasses === 1 ? "" : "es"}` : "No classes"}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted">
                      {teacherNames.length > 0 ? teacherNames.join(", ") : "No teachers assigned"}
                    </td>
                    <td className="px-4 py-2">
                      <Button type="button" variant="secondary" onClick={() => openSubjectModal(subject)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-sm text-muted">
                  No subjects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile List */}
        <div className="sm:hidden space-y-2 p-4">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => {
              const assignedClasses = iconSubjectCount(subject);
              return (
                <button
                  key={subject.id}
                  onClick={() => openSubjectModal(subject)}
                    className="block w-full text-left rounded-lg border border-border bg-surface px-4 py-2 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{subject.name}</p>
                    </div>
                    <div className="flex-shrink-0 text-right ml-2">
                      <p className="text-xs text-muted">
                        {assignedClasses} class{assignedClasses === 1 ? "" : "es"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center text-sm text-muted py-4">
              No subjects found.
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedSubject ? "Edit subject" : "Add new subject"}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {selectedSubject
                    ? "Update the subject name and the classes it belongs to."
                    : "Create a new subject and assign it to one or more classes."}
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>

            <form action={selectedSubject ? updateSubject : createSubject} className="space-y-6">
              {selectedSubject && <input type="hidden" name="id" value={selectedSubject.id} />}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Subject name
                  <input
                    name="name"
                    value={subjectName}
                    onChange={(event) => setSubjectName(event.target.value)}
                    required
                    placeholder="Mathematics"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>

                <div className="text-sm font-medium">
                  <span>Assign classes</span>
                  <div className="mt-1 grid gap-2 rounded-lg border border-border bg-background p-3">
                    {classes.length === 0 ? (
                      <p className="text-sm text-muted">No classes available</p>
                    ) : (
                      classes.map((classItem) => {
                        const isSelected = selectedClassIds.includes(classItem.id);
                        return (
                          <label
                            key={classItem.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 transition hover:bg-background"
                          >
                            <input
                              type="checkbox"
                              name="classIds"
                              value={classItem.id}
                              checked={isSelected}
                              onChange={() => handleClassToggle(classItem.id)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">
                              {classItem.name}
                              {classItem.arm ? ` ${classItem.arm}` : ""}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {selectedSubject && (
                <div className="rounded-3xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">Teachers assigned to this subject</p>
                  {teacherSubjects.filter((ts) => ts.subjectId === selectedSubject.id).length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm text-foreground">
                      {teacherSubjects
                        .filter((ts) => ts.subjectId === selectedSubject.id)
                        .map((ts) => (
                          <li key={ts.id} className="rounded-2xl bg-surface p-3">
                            {ts.teacher?.name ?? "Unnamed teacher"}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-muted">No teachers currently assigned.</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{selectedSubject ? "Save changes" : "Add subject"}</Button>
                </div>
              </div>
            </form>

            {selectedSubject && (
              <div className="mt-4 flex justify-end">
                <form action={deleteSubject} className="inline">
                  <input type="hidden" name="id" value={selectedSubject.id} />
                  <Button type="submit" variant="destructive">
                    Delete subject
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      <UserGuide guide={SUBJECTS_GUIDE} />
    </>
  );
}
