"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { playOpenTone, playCloseTone } from "@/lib/sounds";
import { ErrorModal } from "@/components/ui/error-modal";

// Safe play helpers: use global if present, otherwise play a short beep via WebAudio
const safePlayTone = (freq: number, dur = 0.12) => {
  if (typeof window !== "undefined" && typeof (window as any).playOpenTone === "function") {
    // prefer layout-provided handlers if available
    try {
      if (freq === 880) (window as any).playOpenTone();
      else (window as any).playCloseTone();
      return;
    } catch (e) {}
  }

  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.value = 0.0001;
    o.start();
    g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur + 0.02);
    setTimeout(() => { try { ctx.close(); } catch (e) {} }, (dur + 50) );
  } catch (e) {
    // no-op on failure
  }
};

const safePlayOpenTone = () => safePlayTone(880, 0.12);
const safePlayCloseTone = () => safePlayTone(520, 0.12);
// Guarded play helpers: prefer canonical handlers, fallback to layout/global then safe beeps.
const doPlayOpenTone = () => {
  try {
    if (typeof playOpenTone === "function") {
      playOpenTone();
      return;
    }
  } catch (e) {}

  try {
    if (typeof (window as any).playOpenTone === "function") {
      (window as any).playOpenTone();
      return;
    }
  } catch (e) {}

  safePlayOpenTone();
};

const doPlayCloseTone = () => {
  try {
    if (typeof playCloseTone === "function") {
      playCloseTone();
      return;
    }
  } catch (e) {}

  try {
    if (typeof (window as any).playCloseTone === "function") {
      (window as any).playCloseTone();
      return;
    }
  } catch (e) {}

  safePlayCloseTone();
};
import { useRouter } from "next/navigation";
import { X, TrendingUp, CheckCircle, AlertCircle, ArrowUpRight, Edit2, Trash2, Search, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserGuide, type PageHelpGuide } from "@/components/ui/user-guide";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";

type ClassItem = { id: string; name: string; arm?: string | null };
type TermItem = { id: string; name: string; academicYear: { name: string } };
type FeeScheduleItem = {
  id: string;
  name: string;
  amount: number;
  createdAt: string | Date;
  term: TermItem;
  class?: ClassItem | null;
};

export default function FeeSchedulesPageClient({
  feeSchedules,
  currency,
  terms,
  classes,
  success,
}: {
  feeSchedules: FeeScheduleItem[];
  currency: string;
  terms: TermItem[];
  classes: ClassItem[];
  success?: boolean;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [termFilter, setTermFilter] = useState("ALL");
  const [selectedAcademicYearName, setSelectedAcademicYearName] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; amount: string } | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState<string>("");
  const [feeScheduleItems, setFeeScheduleItems] = useState<FeeScheduleItem[]>(feeSchedules);
  
  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteAnimateState, setDeleteAnimateState] = useState<"enter" | "exit">("enter");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const backendUrl = getBackendUrl();

      const response = await fetch(`${backendUrl}/api/admin/fees/schedules`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          termId: formData.get("termId"),
          classId: formData.get("classId") || null,
          name: formData.get("name"),
          amount: formData.get("amount"),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create fee schedule");
      }

      const result = await response.json();
      const created = result.feeSchedule ?? result;
      const newSchedule: FeeScheduleItem = {
        id: created.id,
        name: created.name,
        amount: created.amount,
        createdAt: created.createdAt,
        term: created.term,
        class: created.class,
      };
      setFeeScheduleItems((current) => [newSchedule, ...current]);
      setShowModal(false);
      setError(null);
      setSuccessModalMessage("A new fee schedule has been created successfully.");
      setSuccessModalOpen(true);
    } catch (err) {
      console.error("Error creating fee schedule:", err);
      setError(err instanceof Error ? err.message : "Failed to create fee schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId || !editFormData) return;
    setEditSubmitting(true);
    setEditError(null);

    try {
      const backendUrl = getBackendUrl();

      const response = await fetch(`${backendUrl}/api/admin/fees/schedules/${editingId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editFormData.name, amount: editFormData.amount }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to update fee schedule");
      }

      router.refresh();
      setEditingId(null);
      setEditFormData(null);
    } catch (err) {
      console.error("Error updating fee schedule:", err);
      setEditError(err instanceof Error ? err.message : "Failed to update fee schedule");
    } finally {
        setEditSubmitting(false);
        doPlayCloseTone();
      }
  };

  const startEdit = (schedule: FeeScheduleItem) => {
    setEditingId(schedule.id);
    setEditFormData({ name: schedule.name, amount: (schedule.amount / 100).toFixed(2) });
    setEditError(null);
    doPlayOpenTone();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/fees/schedules/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete fee schedule");
      }

      setFeeScheduleItems((current) => current.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting fee schedule:", err);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete fee schedule");
    } finally {
      setDeleteLoading(false);
      doPlayCloseTone();
    }
  };

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(terms.map((term) => term.academicYear.name)));
    return years.sort((a, b) => b.localeCompare(a));
  }, [terms]);

  // Default to the most recent academic year and its first term when the page loads
  useEffect(() => {
    if (!selectedAcademicYearName && yearOptions.length > 0) {
      const firstYear = yearOptions[0];
      setSelectedAcademicYearName(firstYear);
      const firstTerm = terms.find((t) => t.academicYear.name === firstYear);
      if (firstTerm) setTermFilter(firstTerm.id);
    }
  }, [yearOptions, terms, selectedAcademicYearName]);

  // Default selected academic year to first available (if any)
  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const filteredTerms = useMemo(() => {
    if (!selectedAcademicYearName) return terms || [];
    return terms.filter((t) => t.academicYear.name === selectedAcademicYearName);
  }, [terms, selectedAcademicYearName]);

  const filteredSchedules = useMemo(() => {
    let filtered = feeScheduleItems;

    if (selectedAcademicYearName) {
      filtered = filtered.filter(
        (schedule) => (schedule.term.academicYear?.name || "") === selectedAcademicYearName,
      );
    }

    if (termFilter !== "ALL") {
      filtered = filtered.filter((schedule) => schedule.term.id === termFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((schedule) => {
        const classLabel = schedule.class
          ? `${schedule.class.name}${schedule.class.arm ? ` ${schedule.class.arm}` : ""}`
          : "all classes";
        return (
          schedule.name.toLowerCase().includes(query) ||
          schedule.term.name.toLowerCase().includes(query) ||
          schedule.term.academicYear.name.toLowerCase().includes(query) ||
          classLabel.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [feeScheduleItems, termFilter, searchQuery, selectedAcademicYearName]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalAmount = filteredSchedules.reduce((sum, s) => sum + s.amount, 0);
    const uniqueTerms = new Set(filteredSchedules.map(s => s.term.id));
    const uniqueClasses = new Set(filteredSchedules.filter(s => s.class).map(s => s.class!.id));
    
    return {
      total: totalAmount,
      scheduleCount: filteredSchedules.length,
      termCount: uniqueTerms.size,
      classCount: uniqueClasses.size,
    };
  }, [filteredSchedules]);

  const formatStatMoney = (amount: number) => formatMoney(amount, currency);

  return (
    <>
      <ErrorModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Fee schedule saved"
        message={successModalMessage}
        type="success"
        confirmLabel="Okay"
      />

      {/* Main Page */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fee Schedules</h1>
            <p className="mt-1 text-muted">Manage billing rules by term and class for automated invoicing</p>
          </div>
          <Button type="button" onClick={() => { setShowModal(true); doPlayOpenTone(); }} className="gap-2">
            <span>+ New Schedule</span>
          </Button>
        </div>

        {/* Summary Cards - Desktop */}
        <div className="hidden sm:grid grid-cols-3 gap-3">
          <div className="group rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total Amount</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{formatStatMoney(summaryStats.total)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.scheduleCount} schedule{summaryStats.scheduleCount !== 1 ? "s" : ""}</p>
          </div>

          <div className="group rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Terms Covered</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{summaryStats.termCount}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Academic terms</p>
          </div>

          <div className="group rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Classes</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{summaryStats.classCount}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Specific class schedules</p>
          </div>
        </div>

        {/* Summary Cards - Mobile */}
        <div className="sm:hidden space-y-3">
          <div className="group rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total Amount</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{formatStatMoney(summaryStats.total)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.scheduleCount} schedule{summaryStats.scheduleCount !== 1 ? "s" : ""}</p>
          </div>

          <div className="group rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Terms Covered</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{summaryStats.termCount}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Academic terms</p>
          </div>

          <div className="group rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Classes</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{summaryStats.classCount}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Specific class schedules</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`overflow-hidden transition-all duration-300 ease-out flex-shrink-0 ${isSearchOpen ? "w-72 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-full"}`}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, term, year, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              {isSearchOpen ? "Close Search" : "Search Schedules"}
            </Button>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-[#0A66C2] bg-background px-2.5 py-1.5 text-sm text-foreground shadow-sm">
            <CalendarDays className="h-4 w-4 text-[#0A66C2]" />
            <div className="flex items-center gap-2">
              <select
                value={selectedAcademicYearName}
                onChange={(e) => setSelectedAcademicYearName(e.target.value)}
                className="bg-transparent text-sm text-foreground outline-none"
              >
                <option value="">Session</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="bg-transparent text-sm text-foreground outline-none"
              >
                <option value="ALL">Select term</option>
                {filteredTerms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile list (mobile-only) */}
        <div className="sm:hidden space-y-3">
          {filteredSchedules.length === 0 ? (
            <div className="rounded-lg border border-border bg-background p-6 text-center text-sm text-muted">No fee schedules found for the selected filters</div>
          ) : (
            filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{schedule.name}</p>
                    <p className="text-sm text-muted">{schedule.term.name} • {schedule.term.academicYear.name}</p>
                    <p className="text-sm text-muted mt-1">{schedule.class ? `${schedule.class.name}${schedule.class.arm ? ` ${schedule.class.arm}` : ""}` : "All classes"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatStatMoney(schedule.amount)}</p>
                    <p className="text-sm text-muted mt-1">{new Date(schedule.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => startEdit(schedule)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => { setDeleteAnimateState("enter"); setDeleteId(schedule.id); doPlayOpenTone(); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table (desktop only) */}
        <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Schedule Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Term</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Academic Year</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Class</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Created</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
                      No fee schedules found for the selected filters
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {schedule.name}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {schedule.term.name}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {schedule.term.academicYear.name}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {schedule.class
                          ? `${schedule.class.name}${
                              schedule.class.arm ? ` ${schedule.class.arm}` : ""
                            }`
                          : "All classes"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {formatStatMoney(schedule.amount)}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(schedule.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => startEdit(schedule)}
                              className="flex items-center gap-2 inline-flex px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-background text-sm font-medium transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              onClick={() => {
                                setDeleteAnimateState("enter");
                                setDeleteId(schedule.id);
                                doPlayOpenTone();
                              }}
                              className="inline-flex px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <style>{`
            @keyframes classes_modal_enter { from { transform: translateX(36px) scale(.98); opacity: 0 } to { transform: translateX(0) scale(1); opacity: 1 } }
            @keyframes classes_modal_exit  { from { transform: translateX(0) scale(1); opacity: 1 } to { transform: translateX(36px) scale(.98); opacity: 0 } }
          `}</style>

          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_50px_rgba(10,102,194,0.16)]"
            style={{ animation: `classes_modal_enter 320ms cubic-bezier(.2,.9,.2,1)` }}
          >
            <div className="border-b border-border px-6 py-5" style={{ background: "linear-gradient(90deg, rgba(10,102,194,0.12), rgba(10,102,194,0.04))" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Create Fee Schedule</h2>
                  <p className="mt-1 text-sm text-muted">Add a new fee schedule for a term. Leave class empty to apply to all students.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    doPlayCloseTone();
                    setShowModal(false);
                    setError(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-background transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Term *</label>
                  <select name="termId" required className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="">Select term</option>
                    {filteredTerms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} • {t.academicYear.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Class (optional)</label>
                  <select name="classId" className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="">All classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Schedule Name *</label>
                  <input type="text" name="name" required placeholder="e.g., First Term Tuition or JSS1 Fees" className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Amount ({currency}) *</label>
                  <input type="number" name="amount" required min="0" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => { doPlayCloseTone(); setShowModal(false); setError(null); }} disabled={submitting} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface/90 disabled:opacity-50 text-foreground">Cancel</button>
                <button type="submit" disabled={submitting} className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50" style={{ background: "#0A66C2" }}>
                  {submitting ? (<><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Creating...</>) : (<>Create Schedule</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && editFormData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <style>{`
            @keyframes classes_modal_enter { from { transform: translateX(36px) scale(.98); opacity: 0 } to { transform: translateX(0) scale(1); opacity: 1 } }
            @keyframes classes_modal_exit  { from { transform: translateX(0) scale(1); opacity: 1 } to { transform: translateX(36px) scale(.98); opacity: 0 } }
          `}</style>

          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_50px_rgba(10,102,194,0.16)]"
            style={{ animation: `classes_modal_enter 320ms cubic-bezier(.2,.9,.2,1)` }}
          >
            <div className="border-b border-border px-6 py-5" style={{ background: "linear-gradient(90deg, rgba(10,102,194,0.12), rgba(10,102,194,0.04))" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Edit Fee Schedule</h2>
                  <p className="mt-1 text-sm text-muted">Update schedule name and amount</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    doPlayCloseTone();
                    setEditingId(null);
                    setEditFormData(null);
                    setEditError(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-background transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5 px-6 py-6">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Schedule Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  placeholder="e.g., First Term Tuition or JSS1 Fees"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Amount ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {editError && (
                <div className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{editError}</p>
                </div>
              )}

              <div className="flex gap-3 border-t border-border bg-surface/80 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    playCloseTone();
                    setEditingId(null);
                    setEditFormData(null);
                    setEditError(null);
                  }}
                  disabled={editSubmitting}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface/90 disabled:opacity-50 text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: "#0A66C2" }}
                >
                  {editSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>Update Schedule</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <style>{`
            @keyframes classes_delete_enter { from { transform: translateX(36px) scale(.98); opacity: 0 } to { transform: translateX(0) scale(1); opacity: 1 } }
            @keyframes classes_delete_exit { from { transform: translateX(0) scale(1); opacity: 1 } to { transform: translateX(36px) scale(.98); opacity: 0 } }
          `}</style>

          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_50px_rgba(220,38,38,0.16)]"
            style={{
              animation: `${deleteAnimateState === "enter" ? "classes_delete_enter" : "classes_delete_exit"} 320ms cubic-bezier(.2,.9,.2,1)`,
            }}
          >
            <div className="border-b border-border px-6 py-5" style={{ background: "linear-gradient(90deg, rgba(220,38,38,0.12), rgba(220,38,38,0.04))" }}>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/70 bg-red-100 shadow-sm">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Delete Schedule?</h2>
                  <p className="mt-1 text-sm text-muted">This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              {deleteError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{deleteError}</p>
                </div>
              )}
              <p className="text-sm leading-6 text-foreground">
                You are about to permanently delete this fee schedule.
              </p>
            </div>

            <div className="flex gap-3 border-t border-border bg-surface/80 px-6 py-4">
                <button
                type="button"
                onClick={() => {
                  doPlayCloseTone();
                  setDeleteId(null);
                  setDeleteError(null);
                }}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface/90 disabled:opacity-50 text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteAnimateState("exit");
                  setTimeout(() => {
                    handleDelete();
                  }, 220);
                }}
                disabled={deleteLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: "#DC2626" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#991B1B")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}
              >
                {deleteLoading ? (
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
      <UserGuide
        guide={SCHEDULES_HELP}
      />
    </>
  );
}

const SCHEDULES_HELP: PageHelpGuide = {
  title: "Managing Fee Schedules",
  overview: "Create and manage fee schedules for terms and classes. Use schedules to automate invoicing and apply consistent fees across students.",
  steps: [
    "Create a fee schedule and set an amount for a term. Leave class empty to apply to all students.",
    "Edit a schedule to update amounts or names — edits affect future invoices.",
    "Delete schedules you no longer need; this will not retroactively remove invoices already issued.",
    "Use the search, session and term filters to find specific schedules quickly.",
  ],
  commonTasks: [
    {
      title: "Create a New Schedule",
      description: "Click '+ New Schedule', choose term and class (optional), set the name and amount, then create.",
      tips: ["Use clear schedule names (e.g., 'First Term Tuition').", "Amounts are entered in the school's currency."],
    },
    {
      title: "Apply Schedule to All Classes",
      description: "Leave the Class field empty when creating a schedule to apply it to all students in the term.",
      tips: ["This is useful for school-wide fees like examination or registration charges."],
    },
  ],
  faqs: [
    { question: "Will deleting a schedule remove issued invoices?", answer: "No — deleting only removes the schedule; issued invoices remain unchanged." },
    { question: "How do I find schedules for a past academic year?", answer: "Use the Session dropdown to select the academic year, then choose the term." },
  ],
};