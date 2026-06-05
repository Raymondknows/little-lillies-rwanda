"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, ArrowLeft } from "lucide-react";
import { pupilName } from "@/lib/format";

const PHASE_CONFIG = {
  EARLY_YEARS: { label: "Early Years", badge: "bg-amber-100 text-amber-800" },
  PRIMARY: { label: "Primary", badge: "bg-blue-100 text-blue-800" },
  SECONDARY: { label: "Secondary", badge: "bg-purple-100 text-purple-800" },
  ALL: { label: "All students", badge: "bg-gray-100 text-gray-800" },
};

const PHASE_ORDER = ["ALL", "EARLY_YEARS", "PRIMARY", "SECONDARY"];
const ITEMS_PER_PAGE = 20;

export default function TeacherStudentsPageClient({ pupils, assignedClasses }: { pupils: any[]; assignedClasses: any[] }) {
  const [activePhase, setActivePhase] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPupil, setSelectedPupil] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const formatDate = (value?: string | Date | null) => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatAge = (value?: string | Date | null) => {
    if (!value) return "—";
    const dob = value instanceof Date ? value : new Date(value);
    const diff = Date.now() - dob.getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return `${age} yrs`;
  };

  const openPupilModal = (pupil: any) => {
    setSelectedPupil(pupil);
    setModalOpen(true);
  };

  const closePupilModal = () => {
    setModalOpen(false);
    setSelectedPupil(null);
  };

  const filteredPupils = useMemo(() => {
    let filtered = pupils;

    // Filter by selected class
    if (selectedClass) {
      filtered = filtered.filter((p) => p.classId === selectedClass);
    }

    if (activePhase !== "ALL") {
      filtered = filtered.filter((p) => p.class?.phase === activePhase);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        const admissionNo = (p.admissionNo || "").toLowerCase();
        return fullName.includes(query) || admissionNo.includes(query);
      });
    }

    return filtered;
  }, [pupils, activePhase, selectedClass, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPupils.length / ITEMS_PER_PAGE));
  const paginatedPupils = filteredPupils.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);
    setCurrentPage(1);
  };

  const handleClassChange = (classId: string | null) => {
    setSelectedClass(classId);
    setCurrentPage(1);
    setDropdownOpen(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const getGuardian = (pupil: any) => {
    const entry = pupil.guardians?.[0] ?? null;
    return entry?.guardian ?? entry ?? null;
  };

  const guardian = selectedPupil ? getGuardian(selectedPupil) : null;

  const getPhaseCount = (phase: string) => {
    let filtered = pupils;
    if (selectedClass) {
      filtered = filtered.filter((p) => p.classId === selectedClass);
    }
    if (phase === "ALL") return filtered.length;
    return filtered.filter((p) => p.class?.phase === phase).length;
  };

  const selectedClassName = assignedClasses.find((c) => c.classId === selectedClass)?.class?.name;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="mt-2 text-sm text-muted">Only students in your assigned classes are shown here.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-background transition w-full sm:w-auto"
            >
              {selectedClassName ? `Class: ${selectedClassName}` : "All classes"}
              <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-lg border border-border bg-surface shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => handleClassChange(null)}
                  className={`w-full px-4 py-2 text-left text-sm transition ${
                    !selectedClass
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-background"
                  }`}
                >
                  All assigned classes
                </button>
                {assignedClasses.map((assignment) => (
                  <button
                    key={assignment.classId}
                    type="button"
                    onClick={() => handleClassChange(assignment.classId)}
                    className={`w-full px-4 py-2 text-left text-sm border-t border-border transition ${
                      selectedClass === assignment.classId
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-background"
                    }`}
                  >
                    {assignment.class.name}{assignment.class.arm ? ` ${assignment.class.arm}` : ""} • {assignment.class.phase}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => window.location.href = "/teacher"}
            aria-label="Back to teacher dashboard"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand text-white shadow-sm transition hover:bg-brand-hover"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search students by name or admission number"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border sm:gap-2">
        {PHASE_ORDER.map((phase) => {
          const count = getPhaseCount(phase);
          const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];
          const isActive = activePhase === phase;

          return (
            <button
              key={phase}
              type="button"
              onClick={() => handlePhaseChange(phase)}
              className={`rounded-t-lg border-b-2 px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {config.label}
              <span className="ml-2 inline-block rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-foreground">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        {/* Desktop Table */}
        <table className="hidden sm:table w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Photo</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Class</th>
              <th className="px-4 py-2 font-medium">Admission No.</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPupils.length > 0 ? (
              paginatedPupils.map((pupil) => (
                <tr key={pupil.id} className="border-t border-border hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3">
                    {pupil.photoUrl ? (
                      <img
                        src={pupil.photoUrl}
                        alt={`${pupil.firstName} ${pupil.lastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{pupilName(pupil.firstName, pupil.lastName)}</td>
                  <td className="px-4 py-3 text-muted">
                    {pupil.class?.name}{pupil.class?.arm ? ` ${pupil.class.arm}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted">{pupil.admissionNo ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openPupilModal(pupil)}
                      className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-hover"
                    >
                      View profile
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No students found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile List */}
        <div className="sm:hidden space-y-2 p-4">
          {paginatedPupils.length > 0 ? (
            paginatedPupils.map((pupil) => (
              <div
                key={pupil.id}
                className="rounded-lg border border-border bg-surface px-4 py-3 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{pupilName(pupil.firstName, pupil.lastName)}</p>
                    <p className="text-xs text-muted mt-1">
                      {pupil.class?.name}{pupil.class?.arm ? ` ${pupil.class.arm}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openPupilModal(pupil)}
                    className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-hover"
                  >
                    View details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted py-8">
              No students found for this filter.
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Showing {paginatedPupils.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredPupils.length)} of {filteredPupils.length}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded px-4 py-2 bg-brand text-white text-sm font-medium shadow-sm transition hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`rounded px-3 py-2 text-sm font-medium transition ${
                  page === currentPage
                    ? "bg-brand text-white shadow-sm"
                    : "bg-surface text-foreground border border-border hover:bg-background"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded px-4 py-2 bg-brand text-white text-sm font-medium shadow-sm transition hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {modalOpen && selectedPupil ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Student Transcript</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">{pupilName(selectedPupil.firstName, selectedPupil.lastName)}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedPupil.class?.name}{selectedPupil.class?.arm ? ` ${selectedPupil.class.arm}` : ""}</p>
              </div>
              <button
                type="button"
                onClick={closePupilModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Close student profile modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-8">
              <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,_1fr)]">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-slate-100">
                      {selectedPupil.photoUrl ? (
                        <img
                          src={selectedPupil.photoUrl}
                          alt={pupilName(selectedPupil.firstName, selectedPupil.lastName)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-semibold text-primary">
                          {pupilName(selectedPupil.firstName, selectedPupil.lastName)
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Admission No.</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{selectedPupil.admissionNo || selectedPupil.admissionNumber || selectedPupil.id}</p>
                      <p className="mt-3 text-sm text-muted">Enrolled {formatDate(selectedPupil.createdAt)}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-900">
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Class</span>
                      <span className="font-semibold">{selectedPupil.class?.name ?? "—"}{selectedPupil.class?.arm ? ` ${selectedPupil.class.arm}` : ""}</span>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Phase</span>
                      <span className="font-semibold">{PHASE_CONFIG[(selectedPupil.phase ?? "PRIMARY") as keyof typeof PHASE_CONFIG].label}</span>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Date of birth</span>
                      <span className="font-semibold">{formatDate(selectedPupil.dateOfBirth)}</span>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Age</span>
                      <span className="font-semibold">{formatAge(selectedPupil.dateOfBirth)}</span>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Gender</span>
                      <span className="font-semibold">{selectedPupil.gender ?? "—"}</span>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</span>
                      <span className="font-semibold">{selectedPupil.status || "Active"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 text-slate-900">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Profile details</h3>
                    <div className="mt-4 grid gap-2 text-sm">
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">First name</span>
                        <span className="font-semibold">{selectedPupil.firstName || "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Middle name</span>
                        <span className="font-semibold">{selectedPupil.middleName || "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Last name</span>
                        <span className="font-semibold">{selectedPupil.lastName || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Parent / guardian</h3>
                    <div className="mt-4 grid gap-2 text-sm">
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Name</span>
                        <span className="font-semibold">{guardian ? `${guardian.firstName ?? ""} ${guardian.lastName ?? ""}`.trim() || "—" : "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Relationship</span>
                        <span className="font-semibold">{selectedPupil.guardians?.[0]?.relation ?? "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-slate-200 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Phone</span>
                        <span className="font-semibold">{guardian?.phone ?? selectedPupil.guardians?.[0]?.phone ?? "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</span>
                        <span className="font-semibold">{guardian?.email ?? selectedPupil.guardians?.[0]?.email ?? "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={closePupilModal}
                      className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
