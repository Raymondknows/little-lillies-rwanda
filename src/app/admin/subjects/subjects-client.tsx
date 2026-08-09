"use client";

import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserGuide } from "@/components/ui/user-guide";
import { getBackendUrl } from "@/lib/backend-url";
import { Search, Trash2, X, Check, AlertCircle, Edit2 } from "lucide-react";

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
  classes: initialClasses,
  subjects: initialSubjects,
  subjectClasses: initialSubjectClasses,
  teacherSubjects,
}: {
  classes: any[];
  subjects: any[];
  subjectClasses: any[];
  teacherSubjects: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [subjectClasses, setSubjectClasses] = useState(initialSubjectClasses);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [deletingSubjectName, setDeletingSubjectName] = useState("");
  const [deleteAnimateState, setDeleteAnimateState] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const activeSubjectCount = subjects.length;
  const activeClassCount = initialClasses.length;

  const classColumns = useMemo(() => {
    const columns: any[][] = [];
    const itemsPerColumn = 10;

    initialClasses.forEach((classItem, index) => {
      const columnIndex = Math.floor(index / itemsPerColumn);
      if (!columns[columnIndex]) {
        columns[columnIndex] = [];
      }
      columns[columnIndex].push(classItem);
    });

    return columns;
  }, [initialClasses]);

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
    setError(null);
    setIsOpen(true);
    playOpenTone();
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClassIds((current) =>
      current.includes(classId)
        ? current.filter((id) => id !== classId)
        : [...current, classId],
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const backendUrl = getBackendUrl();

      // Create or update subject
      const subjectPayload = { name: subjectName };
      const subjectUrl = selectedSubject
        ? `${backendUrl}/api/admin/subjects/${selectedSubject.id}`
        : `${backendUrl}/api/admin/subjects`;
      const subjectMethod = selectedSubject ? 'PATCH' : 'POST';

      const subjectResponse = await fetch(subjectUrl, {
        method: subjectMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectPayload),
        credentials: 'include',
      });

      if (!subjectResponse.ok) {
        const errorData = await subjectResponse.json();
        throw new Error(errorData.error || 'Failed to save subject');
      }

      const savedSubject = await subjectResponse.json();
      const subjectId = savedSubject.id;

      // Handle class assignments
      if (selectedSubject) {
        // Remove old assignments
        const oldClassIds = subjectClasses
          .filter((sc) => sc.subjectId === selectedSubject.id)
          .map((sc) => sc.classId);

        for (const classId of oldClassIds) {
          if (!selectedClassIds.includes(classId)) {
            await fetch(`${backendUrl}/api/admin/class-subjects/${classId}/${subjectId}`, {
              method: 'DELETE',
              credentials: 'include',
            });
          }
        }

        // Add new assignments
        for (const classId of selectedClassIds) {
          if (!oldClassIds.includes(classId)) {
            await fetch(`${backendUrl}/api/admin/class-subjects/${classId}/${subjectId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });
          }
        }
      } else {
        // Add all new class assignments
        for (const classId of selectedClassIds) {
          await fetch(`${backendUrl}/api/admin/class-subjects/${classId}/${subjectId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
        }
      }

      // Refresh data
      const dataResponse = await fetch(`${backendUrl}/api/admin/subjects/data`, {
        credentials: 'include',
      });

      if (dataResponse.ok) {
        const data = await dataResponse.json();
        setSubjects(data.subjects);
        setSubjectClasses(data.subjectClasses);
      }

      setIsOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!selectedSubject) return;
    setDeletingSubjectId(selectedSubject.id);
    setDeletingSubjectName(selectedSubject.name);
    setDeleteAnimateState("enter");
    setDeleteModalOpen(true);
    playOpenTone();
  };

  const openDeleteModal = (subject: any) => {
    setSelectedSubject(subject);
    setDeletingSubjectId(subject.id);
    setDeletingSubjectName(subject.name);
    setDeleteAnimateState("enter");
    setDeleteModalOpen(true);
    playOpenTone();
  };

  const confirmDeleteSubject = async () => {
    if (!deletingSubjectId) return;
    try {
      setLoading(true);
      const backendUrl = getBackendUrl();

      const response = await fetch(`${backendUrl}/api/admin/subjects/${deletingSubjectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subject');
      }

      const dataResponse = await fetch(`${backendUrl}/api/admin/subjects/data`, {
        credentials: 'include',
      });

      if (dataResponse.ok) {
        const data = await dataResponse.json();
        setSubjects(data.subjects);
        setSubjectClasses(data.subjectClasses);
      }

      setIsOpen(false);
      setSelectedSubject(null);
      setError(null);
      closeDeleteModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteAnimateState("exit");
    playCloseTone();
    setTimeout(() => {
      setDeleteModalOpen(false);
      setDeletingSubjectId(null);
      setDeletingSubjectName("");
    }, 320);
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
          {/* Animated Search Panel - slides out on same line */}
          <div className={`overflow-hidden transition-all duration-300 ease-out flex-shrink-0 ${isSearchOpen ? "w-72 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-full"}`}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search subjects, classes, or teachers..."
              className="w-full rounded-lg border-2 border-[#0A66C2] bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
            />
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsSearchOpen((open) => !open)}
            className="h-9 rounded-md border border-[#0A66C2] bg-[#0A66C2] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#0858a8]"
          >
            <Search className="h-4 w-4" />
            {isSearchOpen ? "Close Search" : "Search Subject"}
          </Button>
          <button
            type="button"
            onClick={() => openSubjectModal()}
            className="h-9 rounded-md border border-[#0A66C2] bg-[#0A66C2] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#0858a8]"
          >
            Add subject
          </button>
        </div>
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
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => openSubjectModal(subject)}
                          aria-label="Edit subject"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0A66C2]/20 bg-[#0A66C2]/10 text-[#0A66C2] transition hover:bg-[#0A66C2]/15 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/30"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(subject)}
                          aria-label="Delete subject"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
          <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(10,102,194,0.16)]">
            <div className="border-b border-slate-100 px-6 py-5" style={{ background: "linear-gradient(90deg, rgba(10,102,194,0.12), rgba(10,102,194,0.04))" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedSubject ? "Edit subject" : "Add new subject"}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {selectedSubject
                      ? "Update the subject name and the classes it belongs to."
                      : "Create a new subject and assign it to one or more classes."}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedSubject && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      title="Delete subject"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0A66C2]/20 bg-[#0A66C2]/10 text-[#0A66C2] transition hover:bg-[#0A66C2]/15 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/30"
                      aria-label="Delete subject"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      playCloseTone();
                      setIsOpen(false);
                    }}
                    title="Close modal"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0A66C2]/20 bg-[#0A66C2]/10 text-[#0A66C2] transition hover:bg-[#0A66C2]/15 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/30"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(90vh-160px)] overflow-y-auto space-y-5 px-6 py-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]">
                <div className="space-y-4">
                  <label className="text-sm font-medium block">
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
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-medium">
                    <span>Assign classes</span>
                    <div className="mt-1 rounded-lg border border-border bg-background p-3">
                      {initialClasses.length === 0 ? (
                        <p className="text-sm text-muted">No classes available</p>
                      ) : (
                        <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                          <div className="grid gap-3 md:grid-cols-2">
                            {classColumns.map((columnClasses, columnIndex) => (
                              <div key={`class-column-${columnIndex}`} className="space-y-2">
                                {columnClasses.map((classItem) => {
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
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex items-end justify-end pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={loading}
                  title={selectedSubject ? "Save changes" : "Add subject"}
                  aria-label={selectedSubject ? "Save changes" : "Add subject"}
                  className="rounded-lg bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0858a8] disabled:opacity-50"
                >
                  {loading ? "Saving..." : selectedSubject ? "Save changes" : "Add subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <style>{`
            @keyframes subjects_delete_enter { from { transform: translateX(36px) scale(.98); opacity: 0 } to { transform: translateX(0) scale(1); opacity: 1 } }
            @keyframes subjects_delete_exit { from { transform: translateX(0) scale(1); opacity: 1 } to { transform: translateX(36px) scale(.98); opacity: 0 } }
          `}</style>

          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(220,38,38,0.16)]"
            style={{
              animation: `${deleteAnimateState === "enter" ? "subjects_delete_enter" : "subjects_delete_exit"} 320ms cubic-bezier(.2,.9,.2,1)`,
            }}
          >
            <div className="border-b border-slate-100 px-6 py-5" style={{ background: "linear-gradient(90deg, rgba(220,38,38,0.12), rgba(220,38,38,0.04))" }}>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/70 bg-red-100 shadow-sm">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Delete Subject?</h2>
                  <p className="mt-1 text-sm text-slate-600">This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-slate-700">
                You are about to permanently delete <strong>“{deletingSubjectName}”</strong>.
              </p>
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs text-red-700">
                  <strong>Warning:</strong> This will remove the subject from the system and unassign it from all classes.
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={loading}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 disabled:opacity-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSubject}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: "#DC2626" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#991B1B")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      <UserGuide guide={SUBJECTS_GUIDE} />
    </>
  );
}

function playOpenTone() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const playTone = (freq: number, duration: number, gain: number, delay = 0) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);
      gainNode.gain.setValueAtTime(0.0001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };

    playTone(880, 0.16, 0.05, 0);
    playTone(1174, 0.16, 0.05, 0.08);
    setTimeout(() => ctx.close(), 700);
  } catch (e) {
    // ignore
  }
}

function playCloseTone() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 420;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.045, now + 0.01);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    o.stop(now + 0.24);
    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    // ignore
  }
}
