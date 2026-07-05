"use client";

import { getBackendUrl } from "@/lib/backend-url";




import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserGuide } from "@/components/ui/user-guide";
import SubscriptionModal from "@/components/subscription-modal";
import AdminSkeleton from "@/components/ui/skeleton";
import { BookOpen, Users, Plus, Edit2, TrendingUp, LayoutGrid, ArrowUpRight } from "lucide-react";

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

function getPhaseColor(phase: string): { bg: string; text: string; icon: string } {
  switch (phase) {
    case "EARLY_YEARS":
      return { bg: "bg-purple-100", text: "text-purple-800", icon: "text-purple-600" };
    case "PRIMARY":
      return { bg: "bg-blue-100", text: "text-blue-800", icon: "text-blue-600" };
    case "SECONDARY":
      return { bg: "bg-green-100", text: "text-green-800", icon: "text-green-600" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", icon: "text-gray-600" };
  }
}

export default function ClassesPageClient({ classes: initialClasses }: { classes: any[] }) {
  const [classes, setClasses] = useState<any[]>(initialClasses || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string; schoolName?: string } | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [activePhase, setActivePhase] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [className, setClassName] = useState("");
  const [classPhase, setClassPhase] = useState("PRIMARY");
  const [classArm, setClassArm] = useState("");

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const backendUrl = getBackendUrl();
        const [response, verifyResponse] = await Promise.all([
          fetch(`${backendUrl}/api/admin/classes/data`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`${backendUrl}/api/admin/verify`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
        ]);

        let schoolNameToUse = "";
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json().catch(() => null);
          if (verifyData?.authenticated && verifyData.session?.schoolId) {
            try {
              const schoolResponse = await fetch(`${backendUrl}/api/admin/school/${verifyData.session.schoolId}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
              });
              if (schoolResponse.ok) {
                const schoolData = await schoolResponse.json().catch(() => null);
                schoolNameToUse = schoolData?.name || "";
              }
            } catch (err) {
              console.error("Error fetching school name:", err);
            }
          }
        }

        if (!response.ok) {
          if (response.status === 403) {
            const errorBody = await response.json().catch(() => null);
            if (errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
              setSubscriptionBlocked({
                reason: errorBody.reason || 'Your school subscription is not active',
                schoolName: schoolNameToUse || undefined,
              });
              setSchoolName(schoolNameToUse);
              setLoading(false);
              return;
            }
          }
          throw new Error("Failed to fetch classes");
        }
        const data = await response.json();
        setSchoolName(schoolNameToUse);
        setClasses(data.classes || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load classes");
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const backendUrl = getBackendUrl();

      const payload = {
        name: className,
        phase: classPhase,
        arm: classArm || undefined,
      };

      const url = selectedClass
        ? `${backendUrl}/api/admin/classes/${selectedClass.id}`
        : `${backendUrl}/api/admin/classes`;

      const method = selectedClass ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save class');
      }

      // Refresh the classes list
      const classesResponse = await fetch(`${backendUrl}/api/admin/classes/data`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (classesResponse.ok) {
        const data = await classesResponse.json();
        setClasses(data.classes || []);
      }

      setIsOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classItem: any) => {
    if (!confirm(`Are you sure you want to delete "${classItem.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const backendUrl = getBackendUrl();

      const response = await fetch(`${backendUrl}/api/admin/classes/${classItem.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete class');
      }

      // Refresh the classes list
      const classesResponse = await fetch(`${backendUrl}/api/admin/classes/data`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (classesResponse.ok) {
        const data = await classesResponse.json();
        setClasses(data.classes || []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class');
    } finally {
      setLoading(false);
    }
  };

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} schoolName={subscriptionBlocked.schoolName || schoolName || 'Your School'} />;
  }

  return (
    <>
      {loading && (
        <div className="min-h-screen bg-background">
          <AdminSkeleton />
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Classes</h1>
            <p className="mt-1 text-muted">Manage school classes, phases, and student assignments</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">Error: {error}</p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="hidden sm:grid grid-cols-3 gap-4">
            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 shadow-sm">
                  <LayoutGrid className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Total Classes</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{classes.length}</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
              </div>
              <p className="mt-2 text-[11px] text-muted">Classes created</p>
            </div>

            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 shadow-sm">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Total Students</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{classes.reduce((sum, c) => sum + (c._count?.pupils ?? 0), 0)}</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
              </div>
              <p className="mt-2 text-[11px] text-muted">Enrolled across classes</p>
            </div>

            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 shadow-sm">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Total Subjects</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{classes.reduce((sum, c) => sum + (c._count?.subjectClasses ?? 0), 0)}</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
              </div>
              <p className="mt-2 text-[11px] text-muted">Assigned to classes</p>
            </div>
          </div>

          {/* Mobile Summary Cards */}
          <div className="sm:hidden space-y-3">
            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 shadow-sm">
                  <LayoutGrid className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Total Classes</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{classes.length}</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
              </div>
              <p className="mt-2 text-[11px] text-muted">Classes created</p>
            </div>

            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 shadow-sm">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Total Students</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{classes.reduce((sum, c) => sum + (c._count?.pupils ?? 0), 0)}</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
              </div>
              <p className="mt-2 text-[11px] text-muted">Enrolled across classes</p>
            </div>

            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 shadow-sm">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Total Subjects</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{classes.reduce((sum, c) => sum + (c._count?.subjectClasses ?? 0), 0)}</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
              </div>
              <p className="mt-2 text-[11px] text-muted">Assigned to classes</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Animated Search Panel - slides out on same line */}
              <div className={`overflow-hidden transition-all duration-300 ease-out flex-shrink-0 ${isSearchOpen ? "w-72 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-full"}`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search classes by name, arm, or phase..."
                  className="w-full rounded-lg border-2 border-[#0A66C2] bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsSearchOpen((open) => !open)}
                className="px-3 py-2 text-sm"
              >
                {isSearchOpen ? "Close Search" : "Search Classes"}
              </Button>
              <Button onClick={() => openModal()} className="gap-2 flex items-center whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Add class
              </Button>
            </div>
          </div>

          {/* Phase Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted self-center">School Phase:</span>
            {PHASE_OPTIONS.map((phaseOption) => {
              const isActive = activePhase === phaseOption.value;
              const count = getPhaseCount(phaseOption.value);

              return (
                <button
                  key={phaseOption.value}
                  type="button"
                  onClick={() => setActivePhase(phaseOption.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? "bg-brand text-white"
                      : "bg-background text-muted hover:bg-surface"
                  }`}
                >
                  {phaseOption.label}
                  <span className="ml-1 inline-block">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="mb-4 text-sm text-muted">
            Showing {filteredClasses.length} class{filteredClasses.length === 1 ? "" : "es"} in {getPhaseLabel(activePhase)}
          </div>

          {/* Classes Grid/Table */}
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {/* Desktop Table */}
            <table className="hidden sm:table w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Phase</th>
                  <th className="px-4 py-3 font-semibold">Arm</th>
                  <th className="px-4 py-3 font-semibold">Pupils</th>
                  <th className="px-4 py-3 font-semibold">Subjects</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((classItem) => {
                    const colors = getPhaseColor(classItem.phase);
                    return (
                      <tr key={classItem.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{classItem.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {getPhaseLabel(classItem.phase)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">{classItem.arm ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{classItem._count?.pupils ?? 0}</td>
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{classItem._count?.subjectClasses ?? 0}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openModal(classItem)}
                              className="flex items-center gap-2 inline-flex px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-background text-sm font-medium transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(classItem)}
                              className="inline-flex px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted">
                      No classes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile List */}
            <div className="sm:hidden space-y-2 p-4">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((classItem) => {
                  const colors = getPhaseColor(classItem.phase);
                  return (
                    <button
                      key={classItem.id}
                      onClick={() => openModal(classItem)}
                      className="block w-full text-left rounded-lg border border-border bg-surface p-4 hover:border-blue-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{classItem.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                              {getPhaseLabel(classItem.phase)}
                            </span>
                            {classItem.arm && (
                              <span className="text-xs text-muted">Arm {classItem.arm}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-muted mb-1">Pupils</p>
                          <p className="text-sm font-bold text-foreground">{classItem._count?.pupils ?? 0}</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center text-sm text-muted py-8">
                  No classes found.
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-2xl rounded-lg border border-border bg-surface p-6 shadow-lg">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedClass ? "Edit class" : "Add new class"}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {selectedClass
                        ? "Update the class details and phase assignment."
                        : "Create a new class group for your school."}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-background transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form 
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {selectedClass && <input type="hidden" name="id" value={selectedClass.id} />}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Class name
                      </label>
                      <input
                        name="name"
                        value={className}
                        onChange={(event) => setClassName(event.target.value)}
                        required
                        placeholder="Primary 1"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phase
                      </label>
                      <select
                        name="phase"
                        value={classPhase}
                        onChange={(event) => setClassPhase(event.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        {PHASE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Arm / section
                    </label>
                    <input
                      name="arm"
                      value={classArm}
                      onChange={(event) => setClassArm(event.target.value)}
                      placeholder="A"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  <div className="flex justify-between gap-3 pt-4 border-t border-border">
                    <div>
                      {selectedClass && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${selectedClass.name}"? This cannot be undone.`)) {
                              handleDelete(selectedClass);
                              setIsOpen(false);
                            }
                          }}
                          className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-background transition-colors"
                      >
                        Cancel
                      </button>
                      <Button type="submit">{selectedClass ? "Save changes" : "Add class"}</Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      <UserGuide guide={CLASS_GUIDE} />
    </>
  );
}
