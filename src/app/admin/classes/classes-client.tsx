"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClass, updateClass, deleteClass } from "@/app/admin/actions";
import { UserGuide } from "@/components/ui/user-guide";

const CLASS_GUIDE = {
  title: "Classes Management",
  overview: "Manage school classes by phase (Early Years, Primary, Secondary) and arm (A, B, C). Classes organize students for fee invoicing and result publishing.",
  steps: [
    "Click 'Add class' to create a new class",
    "Enter class name (e.g., 'JSS 1', 'Primary 4'), phase, and arm if applicable",
    "Click 'Create' to save the class",
    "Classes appear in the list, color-coded by phase",
    "Click 'Edit' to modify class details or 'Delete' to remove a class"
  ],
  commonTasks: [
    {
      title: "Create a new class",
      description: "Use consistent naming conventions (e.g., 'JSS 1', 'Primary 4 A'). This helps with student enrollment and fee tracking."
    },
    {
      title: "Assign students to a class",
      description: "Go to the Students page and assign each student to their class. Students inherit fee terms from their class."
    },
    {
      title: "Filter classes by phase",
      description: "Use the phase tabs (Early Years, Primary, Secondary) to quickly see classes in each section."
    },
    {
      title: "Search for a class",
      description: "Use the search bar to find specific classes by name, arm, or phase."
    },
    {
      title: "Archive vs Delete",
      description: "Avoid deleting classes with students. Instead, mark them as inactive or archive them to maintain historical records."
    }
  ],
  faqs: [
    {
      question: "What phases are available?",
      answer: "Three phases: Early Years (preschool), Primary (ages 6-11), Secondary (ages 12+). Choose based on your school structure."
    },
    {
      question: "What is an 'Arm'?",
      answer: "An arm is a suffix for the class name, typically used when there are multiple classes at the same level (e.g., Primary 4 A, Primary 4 B, Primary 4 C)."
    },
    {
      question: "Can I rename a class?",
      answer: "Yes, click 'Edit' on the class row to modify the name, phase, or arm. Changes take effect immediately."
    },
    {
      question: "What happens if I delete a class?",
      answer: "Deleting a class removes it and all associated student enrollments. Use caution, as this may affect fee invoicing for those students."
    },
    {
      question: "How many classes can I create?",
      answer: "You can create unlimited classes. However, keep your structure manageable for easy administration."
    }
  ],
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
};

const PHASE_OPTIONS = [
  { value: "ALL", label: "All classes" },
  { value: "EARLY_YEARS", label: "Early Years" },
  { value: "PRIMARY", label: "Primary" },
  { value: "SECONDARY", label: "Secondary" },
];

function getPhaseLabel(phase: string) {
  return PHASE_OPTIONS.find((option) => option.value === phase)?.label ?? phase;
}

export default function ClassesPageClient({ classes }: { classes: any[] }) {
  const [activePhase, setActivePhase] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [className, setClassName] = useState("");
  const [classPhase, setClassPhase] = useState("PRIMARY");
  const [classArm, setClassArm] = useState("");

  const filteredClasses = useMemo(() => {
    let visible = classes;

    if (activePhase !== "ALL") {
      visible = visible.filter((classItem) => classItem.phase === activePhase);
    }

    if (!searchQuery.trim()) {
      return visible;
    }

    const query = searchQuery.toLowerCase();
    return visible.filter((classItem) => {
      return (
        classItem.name.toLowerCase().includes(query) ||
        (classItem.arm ?? "").toLowerCase().includes(query) ||
        classItem.phase.toLowerCase().includes(query)
      );
    });
  }, [classes, activePhase, searchQuery]);

  const getPhaseCount = (phase: string) => {
    if (phase === "ALL") return classes.length;
    return classes.filter((classItem) => classItem.phase === phase).length;
  };

  const openModal = (classItem?: any) => {
    if (classItem) {
      setSelectedClass(classItem);
      setClassName(classItem.name ?? "");
      setClassPhase(classItem.phase ?? "PRIMARY");
      setClassArm(classItem.arm ?? "");
    } else {
      setSelectedClass(null);
      setClassName("");
      setClassPhase("PRIMARY");
      setClassArm("");
    }
    setIsOpen(true);
  };

  return (
    <>
      <div className="w-full">
      <div className="mb-4 text-sm text-brand">
        <a href="/admin" className="hover:underline">
          ← Admin
        </a>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-foreground">Classes</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {classes.length} class{classes.length === 1 ? "" : "es"} available for your school.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center">
          <Button type="button" onClick={() => openModal()} className="w-full sm:w-auto px-3 py-2 text-sm">
            Add class
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search classes by name, arm, or phase..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border pb-2 sm:gap-2 sm:pb-0">
        {PHASE_OPTIONS.map((phaseOption) => {
          const isActive = activePhase === phaseOption.value;
          const count = getPhaseCount(phaseOption.value);

          return (
            <button
              key={phaseOption.value}
              type="button"
              onClick={() => setActivePhase(phaseOption.value)}
              className={`px-2 py-2 font-medium text-xs sm:px-3 sm:text-sm sm:py-2 transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {phaseOption.label}
              <span className="ml-1 inline-flex rounded-full bg-background px-1.5 py-0.5 text-xs font-semibold text-foreground sm:ml-2 sm:px-2">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 text-sm text-muted">
        Showing {filteredClasses.length} class{filteredClasses.length === 1 ? "" : "es"} in {getPhaseLabel(activePhase)}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {/* Desktop Table */}
        <table className="hidden sm:table w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Class</th>
              <th className="px-4 py-2 font-medium">Phase</th>
              <th className="px-4 py-2 font-medium">Arm</th>
              <th className="px-4 py-2 font-medium">Pupils</th>
              <th className="px-4 py-2 font-medium">Subjects</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.length > 0 ? (
              filteredClasses.map((classItem) => (
                <tr key={classItem.id} className="border-t border-border hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2 font-medium text-foreground">{classItem.name}</td>
                  <td className="px-4 py-2">
                    <Badge variant="default">{getPhaseLabel(classItem.phase)}</Badge>
                  </td>
                  <td className="px-4 py-2 text-muted">{classItem.arm ?? "—"}</td>
                  <td className="px-4 py-2 text-sm text-muted">{classItem._count?.pupils ?? 0}</td>
                  <td className="px-4 py-2 text-sm text-muted">{classItem._count?.subjectClasses ?? 0}</td>
                  <td className="px-4 py-2">
                    <Button type="button" variant="secondary" className="text-xs px-2 py-1" onClick={() => openModal(classItem)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted">
                  No classes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile List */}
        <div className="sm:hidden space-y-2 p-4">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((classItem) => (
              <button
                key={classItem.id}
                onClick={() => openModal(classItem)}
                className="block w-full text-left rounded-lg border border-border bg-surface px-3 py-2 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{classItem.name}</p>
                    <p className="text-xs text-muted mt-1">{getPhaseLabel(classItem.phase)}</p>
                  </div>
                  <div className="flex-shrink-0 text-right ml-2">
                    <p className="text-xs text-muted">{classItem._count?.pupils ?? 0} pupil{(classItem._count?.pupils ?? 0) !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-sm text-muted py-8">
              No classes found.
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
                  {selectedClass ? "Edit class" : "Add new class"}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {selectedClass
                    ? "Update the class details and phase assignment."
                    : "Create a new class group for your school."}
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>

            <form action={selectedClass ? updateClass : createClass} className="space-y-6">
              {selectedClass && <input type="hidden" name="id" value={selectedClass.id} />}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Class name
                  <input
                    name="name"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    required
                    placeholder="Primary 1"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>

                <label className="text-sm font-medium">
                  Phase
                  <select
                    name="phase"
                    value={classPhase}
                    onChange={(event) => setClassPhase(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {PHASE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="text-sm font-medium">
                Arm / section
                <input
                  name="arm"
                  value={classArm}
                  onChange={(event) => setClassArm(event.target.value)}
                  placeholder="A"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>

              <div className="flex justify-end">
                <Button type="submit">{selectedClass ? "Save changes" : "Add class"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      <UserGuide guide={CLASS_GUIDE} />
    </>
  );
}
