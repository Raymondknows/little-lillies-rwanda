"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { createTeacher, updateTeacher, addTeacherClass, removeTeacherClass, addTeacherSubject, removeTeacherSubject } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserGuide } from "@/components/ui/user-guide";
import { X, Plus } from "lucide-react";

const TEACHER_GUIDE = {
  title: "Teachers Management",
  overview: "Manage teacher profiles, class assignments, and subject allocations. Teachers can mark attendance, enter results, and communicate with parents.",
  steps: [
    "Click 'Add teacher' to create a new teacher account",
    "Fill in teacher details: name, email, and password",
    "Assign the teacher to classes and subjects",
    "Teacher account is created and they receive login credentials via email",
    "Click 'Details' on any teacher to view or edit their assignments"
  ],
  commonTasks: [
    {
      title: "Add a new teacher",
      description: "Use a professional email (not personal Gmail) for better email deliverability. Include the teacher's phone number in the form if available."
    },
    {
      title: "Assign a teacher to a class",
      description: "Teachers can be assigned to multiple classes and subjects. This allows flexibility for specialists or part-time teachers."
    },
    {
      title: "Edit teacher assignments",
      description: "Click 'Details' on any teacher row to view their current classes and subjects. Make updates and save."
    },
    {
      title: "Search for a teacher",
      description: "Use the search bar to find teachers by name, email, class name, or subject. Searches are case-insensitive."
    },
    {
      title: "View teacher statistics",
      description: "The header shows total teachers assigned to classes and subjects. This helps track staffing levels."
    }
  ],
  faqs: [
    {
      question: "Can I assign a teacher to multiple classes?",
      answer: "Yes, teachers can be assigned to multiple classes. This is useful for specialists or teachers who teach multiple grades."
    },
    {
      question: "Can I assign a teacher to multiple subjects?",
      answer: "Yes, teachers can teach multiple subjects. For example, a teacher can teach both English and Literature."
    },
    {
      question: "What happens when I delete a teacher?",
      answer: "Deleting a teacher removes them from all class and subject assignments. Their account is deactivated but historical records remain for audit purposes."
    },
    {
      question: "Can teachers reset their passwords?",
      answer: "Teachers can reset their passwords from the login page. As an admin, you can also reset passwords from the teacher details page."
    },
    {
      question: "How do I bulk import teachers?",
      answer: "Currently, teachers are added one at a time. For bulk imports, contact support or use the admin dashboard with CSV upload (coming soon)."
    }
  ],
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
};

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
  const [isTransitioning, startTransition] = useTransition();
  const [selectedClassToAdd, setSelectedClassToAdd] = useState("");
  const [selectedSubjectToAdd, setSelectedSubjectToAdd] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

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
    <>
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

        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center">
          <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto px-3 py-2 text-sm">Add teacher</Button>
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
                    <Button
                      type="button"
                      variant="secondary"
                      className="text-xs px-2 py-1"
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
                <td colSpan={5} className="px-4 py-4 text-center text-sm text-muted">
                  No teachers found.
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
                onClick={() => {
                  setSelectedTeacher(teacher);
                }}
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
            <div className="text-center text-sm text-muted py-8">
              No teachers found.
            </div>
          )}
        </div>
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

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                startTransition(async () => {
                  try {
                    const result = await createTeacher(formData);
                    if (result && !result.success && result.error) {
                      setErrorMessage(result.error);
                      setShowErrorModal(true);
                    } else if (result && result.success) {
                      // Close modal and refresh page
                      setIsOpen(false);
                      setErrorMessage(null);
                      window.location.reload();
                    }
                  } catch (error: unknown) {
                    if (error instanceof Error) {
                      setErrorMessage(error.message);
                      setShowErrorModal(true);
                    } else {
                      setErrorMessage("An unexpected error occurred. Please try again.");
                      setShowErrorModal(true);
                    }
                  }
                });
              }} 
              className="space-y-4"
            >
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

              <div className="flex justify-end">
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
                <h2 className="text-xl font-semibold text-foreground">Edit teacher</h2>
                <p className="mt-2 text-sm text-muted">
                  Update teacher information and assign classes and subjects.
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedTeacher(null)}>
                Close
              </Button>
            </div>

            <form action={updateTeacher} className="space-y-4">
              <input type="hidden" name="id" value={selectedTeacher.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Full name
                  <input
                    name="name"
                    defaultValue={selectedTeacher.name}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium">
                  Email address
                  <input
                    name="email"
                    type="email"
                    defaultValue={selectedTeacher.email}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="text-sm font-medium">
                Password (leave blank to keep current)
                <input
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current"
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
                    defaultValue={selectedTeacher.teacherClasses.map((t: any) => t.classId)}
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
                    defaultValue={selectedTeacher.teacherSubjects.map((t: any) => t.subjectId)}
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

              <div className="flex justify-end">
                <Button type="submit">Save teacher</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Unable to Add Teacher</h2>
              <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorMessage(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
      <UserGuide guide={TEACHER_GUIDE} />
    </>
  );
}
