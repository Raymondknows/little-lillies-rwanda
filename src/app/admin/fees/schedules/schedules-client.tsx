"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, TrendingUp, CheckCircle, AlertCircle, ArrowUpRight, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [yearFilter, setYearFilter] = useState("ALL");
  const [termFilter, setTermFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; amount: string } | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  
  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

      router.refresh();
      setShowModal(false);
      router.push("?success=1");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editFormData.name,
          amount: editFormData.amount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update fee schedule");
      }

      router.refresh();
      setEditingId(null);
      setEditFormData(null);
    } catch (err) {
      console.error("Error updating fee schedule:", err);
      setEditError(err instanceof Error ? err.message : "Failed to update fee schedule");
    } finally {
      setEditSubmitting(false);
    }
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
        const data = await response.json();
        throw new Error(data.error || "Failed to delete fee schedule");
      }

      router.refresh();
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting fee schedule:", err);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete fee schedule");
    } finally {
      setDeleteLoading(false);
    }
  };

  const startEdit = (schedule: FeeScheduleItem) => {
    setEditingId(schedule.id);
    setEditFormData({
      name: schedule.name,
      amount: (schedule.amount / 100).toFixed(2),
    });
    setEditError(null);
  };

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(terms.map((term) => term.academicYear.name)),
    );
    return years.sort((a, b) => b.localeCompare(a));
  }, [terms]);

  const filteredSchedules = useMemo(() => {
    let filtered = feeSchedules;

    if (yearFilter !== "ALL") {
      filtered = filtered.filter(
        (schedule) => schedule.term.academicYear.name === yearFilter,
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
  }, [feeSchedules, yearFilter, termFilter, searchQuery]);

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
      {/* Success Modal */}
      {success ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-green-100 p-3 text-green-600">✓</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Fee schedule saved</h3>
                <p className="mt-2 text-sm text-muted">Your new fee schedule has been created and applied to the selected term.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin/fees/schedules")}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Page */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fee Schedules</h1>
            <p className="mt-1 text-muted">Manage billing rules by term and class for automated invoicing</p>
          </div>
          <Button type="button" onClick={() => setShowModal(true)} className="gap-2">
            <span>+ New Schedule</span>
          </Button>
        </div>

        {/* Summary Cards - Desktop */}
        <div className="hidden sm:grid grid-cols-3 gap-3">
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <TrendingUp className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total Amount</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatStatMoney(summaryStats.total)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.scheduleCount} schedule{summaryStats.scheduleCount !== 1 ? "s" : ""}</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <CheckCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Terms Covered</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summaryStats.termCount}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Academic terms</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <AlertCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Classes</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summaryStats.classCount}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Specific class schedules</p>
          </div>
        </div>

        {/* Summary Cards - Mobile */}
        <div className="sm:hidden space-y-3">
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <TrendingUp className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total Amount</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatStatMoney(summaryStats.total)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.scheduleCount} schedule{summaryStats.scheduleCount !== 1 ? "s" : ""}</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <CheckCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Terms Covered</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summaryStats.termCount}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Academic terms</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <AlertCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Classes</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summaryStats.classCount}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Specific class schedules</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box - Left */}
          <input
            type="text"
            placeholder="Search by name, term, year, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />

          {/* Filter Dropdowns - Right */}
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="ALL">All years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="ALL">All terms</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} • {term.academicYear.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-background">
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
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(schedule)}
                            className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-foreground"
                            title="Edit schedule"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(schedule.id)}
                            className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600"
                            title="Delete schedule"
                          >
                            <Trash2 className="h-4 w-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-surface shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Create Fee Schedule</h2>
                <p className="mt-1 text-sm text-muted">
                  Add a new fee schedule for a term. Leave class empty to apply to all students.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
                className="rounded-full p-2 text-muted transition hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Term *
                </label>
                <select
                  name="termId"
                  defaultValue={terms[0]?.id ?? ""}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="" disabled>
                    Select a term
                  </option>
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name} • {term.academicYear.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Class (optional)
                </label>
                <select
                  name="classId"
                  defaultValue=""
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="">All classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                      {cls.arm ? ` ${cls.arm}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Schedule Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
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
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {error && (
                <div className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError(null);
                  }}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Schedule"}
                </button>
              </div>

              <p className="sm:col-span-2 text-xs text-muted">
                * Required fields. Leave class empty to apply the schedule to all students in the selected term.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-surface shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Edit Fee Schedule</h2>
                <p className="mt-1 text-sm text-muted">Update schedule name and amount</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setEditFormData(null);
                  setEditError(null);
                }}
                className="rounded-full p-2 text-muted transition hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
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

              <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditFormData(null);
                    setEditError(null);
                  }}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90 disabled:opacity-50"
                >
                  {editSubmitting ? "Updating..." : "Update Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-surface shadow-2xl">
            <div className="flex items-start gap-4 border-b border-border px-6 py-5">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Delete Schedule</h2>
                <p className="mt-1 text-sm text-muted">This action cannot be undone.</p>
              </div>
            </div>

            <div className="px-6 py-4">
              {deleteError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{deleteError}</p>
                </div>
              )}
              <p className="text-sm text-muted">
                Are you sure you want to delete this fee schedule? If this schedule has already been used to generate invoices, you won't be able to delete it.
              </p>
            </div>

            <div className="flex gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setDeleteId(null);
                  setDeleteError(null);
                }}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
