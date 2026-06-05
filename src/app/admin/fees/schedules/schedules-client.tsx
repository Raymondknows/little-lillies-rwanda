"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { createFeeScheduleAction } from "@/app/admin/actions";

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

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-foreground">Fee schedules</h1>
          <p className="mt-2 text-sm text-muted">
            Manage fee schedules, review past records by academic year and term, and keep billing rules organized.
          </p>
        </div>
        <Button type="button" variant="primary" onClick={() => setShowModal(true)}>
          New fee schedule
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Total schedules</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{feeSchedules.length}</p>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Filtered schedules</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{filteredSchedules.length}</p>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Current currency</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{currency}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <label className="text-sm font-medium">
            Year
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="ALL">All years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            Term
            <select
              value={termFilter}
              onChange={(event) => setTermFilter(event.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="ALL">All terms</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} • {term.academicYear.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex-1 min-w-0">
          <label className="text-sm font-medium">
            Search schedules
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, term, year, or class"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3">Academic year</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                    No fee schedules found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="border-t border-border hover:bg-surface/70 transition-colors">
                    <td className="px-4 py-3 text-foreground">{schedule.name}</td>
                    <td className="px-4 py-3">{schedule.term.name}</td>
                    <td className="px-4 py-3">{schedule.term.academicYear.name}</td>
                    <td className="px-4 py-3">
                      {schedule.class ? `${schedule.class.name}${schedule.class.arm ? ` ${schedule.class.arm}` : ""}` : "All classes"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(schedule.amount, currency)}</td>
                    <td className="px-4 py-3 text-muted">{new Date(schedule.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {success ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-success/10 p-3 text-success">✓</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Fee schedule saved successfully</h3>
                <p className="mt-2 text-sm text-muted">Your new fee schedule has been created and applied to the selected term.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin/fees/schedules")}
                className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90 sm:w-auto"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/fees/schedules")}
                className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-foreground transition hover:bg-slate-50 sm:w-auto"
              >
                Back to schedules
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-surface shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Create fee schedule</h2>
                <p className="mt-1 text-sm text-muted">
                  Add a schedule for the selected term and class, or leave class empty to apply it to all pupils.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-muted transition hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={createFeeScheduleAction} className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Term
                <select
                  name="termId"
                  defaultValue={terms[0]?.id ?? ""}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name} • {term.academicYear.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Class (optional)
                <select
                  name="classId"
                  defaultValue=""
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="">All classes</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}{classItem.arm ? ` ${classItem.arm}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Schedule name
                <input
                  name="name"
                  required
                  placeholder="Example: First Term fees or JSS 1 fees"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Amount
                <input
                  name="amount"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount in your currency"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </label>

              <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit">Save fee schedule</Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>

              <p className="sm:col-span-2 text-sm text-muted">
                Leaving class empty makes the schedule apply to all students in the selected term.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
