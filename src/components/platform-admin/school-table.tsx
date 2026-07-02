"use client";

import { useMemo, useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { resolveSchoolAssetUrl } from "@/lib/asset-urls";
import { Bell, CalendarPlus, CheckSquare, Download, Pause, Play, X } from "lucide-react";

export type SchoolRow = {
  id: string;
  name: string;
  logoUrl: string | null;
  country: string;
  email: string | null;
  phone: string | null;
  plan: string;
  status: string;
  isVerified?: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  userCount?: number;
  pupilCount?: number;
  classCount?: number;
};

// Helper function to get the next plan tier
function getNextPlan(currentPlan: string): string {
  const planProgression: Record<string, string> = {
    'FREE': 'STARTER',
    'STARTER': 'GROWTH',
    'GROWTH': 'ENTERPRISE',
    'ENTERPRISE': 'ENTERPRISE'
  };
  return planProgression[currentPlan] || currentPlan;
}

function ActionMenu({
  school,
  performAction,
  impersonate,
  sendReminder,
  busy,
}: {
  school: SchoolRow;
  performAction: (schoolId: string, action: string, payload?: Record<string, unknown>) => Promise<void>;
  impersonate: (schoolId: string) => Promise<void>;
  sendReminder: (schoolId: string) => Promise<void>;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuWidth = 176; // match w-44
    const top = rect.bottom + 8 + window.scrollY;
    const left = Math.max(8 + window.scrollX, rect.right - menuWidth + window.scrollX);
    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (btnRef.current && btnRef.current.contains(target)) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold bg-white text-brand border border-brand"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Actions
      </button>

      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              style={{ position: "absolute", top: `${pos.top}px`, left: `${pos.left}px`, width: "176px" }}
              className="z-50 origin-top-right rounded-md border border-border bg-background shadow-lg"
            >
              <div className="py-1">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface"
                  onClick={() => { setOpen(false); performAction(school.id, school.status === "SUSPENDED" ? "activate" : "suspend"); }}
                  disabled={busy}
                >
                  {school.status === "SUSPENDED" ? "Activate" : "Suspend"}
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface"
                  onClick={() => { setOpen(false); performAction(school.id, "upgrade"); }}
                  disabled={busy || school.plan === "ENTERPRISE"}
                >
                  Upgrade to {getNextPlan(school.plan)}
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface"
                  onClick={() => { setOpen(false); performAction(school.id, "extendTrial", { days: 30 }); }}
                  disabled={busy}
                >
                  +30d trial
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface"
                  onClick={() => { setOpen(false); performAction(school.id, "cancel"); }}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface"
                  onClick={() => { setOpen(false); sendReminder(school.id); }}
                  disabled={busy}
                >
                  Send reminder
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface"
                  onClick={() => { setOpen(false); impersonate(school.id); }}
                  disabled={busy}
                >
                  Impersonate
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function SchoolTable({ schools, filterControls }: { schools: SchoolRow[]; filterControls?: ReactNode }) {
  const [displaySchools, setDisplaySchools] = useState<SchoolRow[]>(schools);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<"NONE" | "TRIAL_ENDING" | "UNVERIFIED" | "SUSPENDED">("NONE");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDisplaySchools(schools);
    setPage(1);
  }, [schools]);

  const filteredSchools = useMemo(() => {
    return displaySchools.filter((school) => {
      const matchesQuickFilter =
        quickFilter === "NONE" ||
        (quickFilter === "TRIAL_ENDING" && school.trialEndsAt && (() => {
          const endDate = new Date(school.trialEndsAt);
          const diffDays = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 14;
        })()) ||
        (quickFilter === "UNVERIFIED" && !school.isVerified) ||
        (quickFilter === "SUSPENDED" && school.status === "SUSPENDED");

      return matchesQuickFilter;
    });
  }, [displaySchools, quickFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSchools.slice(start, start + pageSize);
  }, [filteredSchools, page, pageSize]);

  const currentPageIds = useMemo(
    () => paginated.map((school) => school.id),
    [paginated],
  );

  const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedSchoolIds.has(id));
  const someCurrentPageSelected = currentPageIds.some((id) => selectedSchoolIds.has(id));
  const selectedCount = selectedSchoolIds.size;
  const selectedSchools = useMemo(
    () => filteredSchools.filter((school) => selectedSchoolIds.has(school.id)),
    [filteredSchools, selectedSchoolIds],
  );

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someCurrentPageSelected && !allCurrentPageSelected;
    }
  }, [someCurrentPageSelected, allCurrentPageSelected]);

  const toggleSchoolSelection = (schoolId: string) => {
    setSelectedSchoolIds((current) => {
      const next = new Set(current);
      if (next.has(schoolId)) next.delete(schoolId);
      else next.add(schoolId);
      return next;
    });
  };

  const toggleSelectCurrentPage = () => {
    setSelectedSchoolIds((current) => {
      const next = new Set(current);
      if (allCurrentPageSelected) {
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedSchoolIds(new Set(filteredSchools.map((school) => school.id)));
  };

  const clearSelection = () => setSelectedSchoolIds(new Set());

  const exportSelectedCsv = () => {
    const rows = selectedCount > 0 ? selectedSchools : filteredSchools;
    const csvHeader = ["Name","Country","Email","Phone","Plan","Status","Verified","Trial Ends","Registered","Admins","Students","Classes"];
    const csvRows = rows.map((school) => [
      school.name,
      school.country,
      school.email || "",
      school.phone || "",
      school.plan,
      school.status,
      school.isVerified ? "Yes" : "No",
      school.trialEndsAt ? new Date(school.trialEndsAt).toLocaleDateString() : "",
      new Date(school.createdAt).toLocaleDateString(),
      String(school.userCount ?? 0),
      String(school.pupilCount ?? 0),
      String(school.classCount ?? 0),
    ]);
    const content = [csvHeader, ...csvRows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schools-${selectedCount > 0 ? "selected" : "all"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const performBulkAction = async (action: string, payload?: Record<string, unknown>) => {
    const ids = Array.from(selectedSchoolIds);
    if (ids.length === 0) {
      setMessage("Select at least one school to perform a bulk action.");
      return;
    }
    setBusy(true);
    setMessage(null);

    try {
      const results = await Promise.all(ids.map(async (schoolId) => {
        const response = await fetch("/schoolbase-admin/api/schools", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ schoolId, action, ...payload }),
        });
        return response.json();
      }));

      setMessage(`Bulk action completed for ${ids.length} school${ids.length === 1 ? "" : "s"}.`);
      setDisplaySchools((current) =>
        current.map((school) => {
          const updated = results.find((result: any) => result?.school?.id === school.id);
          return updated?.school ? { ...school, ...updated.school } : school;
        }),
      );
      clearSelection();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bulk action failed.");
    } finally {
      setBusy(false);
    }
  };

  const performAction = async (
    schoolId: string,
    action: string,
    payload?: Record<string, unknown>,
  ) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/schoolbase-admin/api/schools", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schoolId, action, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Action failed.");
      } else {
        setMessage(result.message || "Action completed.");
        setDisplaySchools((current) =>
          current.map((school) => (school.id === schoolId ? { ...school, ...result.school } : school)),
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const sendReminder = async (schoolId: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/schoolbase-admin/api/reminders/send-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schoolId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Failed to send reminder.");
      } else {
        setMessage(result.message || "Reminder sent.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to send reminder.");
    } finally {
      setBusy(false);
    }
  };

  const sendBulkReminders = async () => {
    const ids = Array.from(selectedSchoolIds);
    if (ids.length === 0) {
      setMessage("Select at least one school to send reminders.");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const results = await Promise.all(ids.map(async (schoolId) => {
        const response = await fetch("/schoolbase-admin/api/reminders/send-single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ schoolId }),
        });
        return response.json();
      }));

      const successCount = results.filter((result: any) => result?.success || !result?.message).length;
      setMessage(`Sent reminders to ${successCount} of ${ids.length} selected schools.`);
      clearSelection();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to send reminders.");
    } finally {
      setBusy(false);
    }
  };

  const sendReminderToIncompleteSchools = async () => {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/schoolbase-admin/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Failed to send reminders to incomplete schools.");
      } else {
        const sentCount = result.sentCount ?? result.total ?? "all";
        setMessage(result.message || `Sent reminders to ${sentCount} incomplete schools.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to send reminders to incomplete schools.");
    } finally {
      setBusy(false);
    }
  };

  const impersonate = async (schoolId: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/schoolbase-admin/api/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schoolId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Impersonation failed.");
        return;
      }
      const redirectUrl = result.redirectUrl || `/admin?impersonate=${encodeURIComponent(result.token)}`;
      window.location.href = redirectUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impersonation failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm shadow-slate-200/50">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="mb-4 w-full">
          {filterControls ?? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${quickFilter === "NONE" ? "bg-brand text-white" : "bg-background text-foreground border border-border"}`}
                onClick={() => setQuickFilter("NONE")}
              >
                All
              </button>
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${quickFilter === "TRIAL_ENDING" ? "bg-brand text-white" : "bg-background text-foreground border border-border"}`}
                onClick={() => setQuickFilter("TRIAL_ENDING")}
              >
                Trials ending soon
              </button>
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${quickFilter === "UNVERIFIED" ? "bg-brand text-white" : "bg-background text-foreground border border-border"}`}
                onClick={() => setQuickFilter("UNVERIFIED")}
              >
                Unverified
              </button>
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${quickFilter === "SUSPENDED" ? "bg-brand text-white" : "bg-background text-foreground border border-border"}`}
                onClick={() => setQuickFilter("SUSPENDED")}
              >
                Suspended
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-row flex-nowrap flex-1 min-w-0 items-center justify-end gap-1 overflow-x-auto pb-2 whitespace-nowrap sm:overflow-visible sm:pb-0">
          <button
            type="button"
            title={selectedCount > 0 ? `Export ${selectedCount} selected schools` : "Export all schools"}
            aria-label={selectedCount > 0 ? `Export ${selectedCount} selected schools` : "Export all schools"}
            className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-[#0A66C2] bg-[#0A66C2] px-2 text-white shadow-sm transition hover:bg-[#0952a4] hover:border-[#0952a4] sm:h-11 sm:min-w-[44px] sm:px-3"
            onClick={exportSelectedCsv}
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Select all filtered schools"
            aria-label="Select all filtered schools"
            className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-[#0A66C2] bg-[#0A66C2] px-2 text-white shadow-sm transition hover:bg-[#0952a4] hover:border-[#0952a4] sm:h-11 sm:min-w-[44px] sm:px-3"
            onClick={selectAllFiltered}
          >
            <CheckSquare className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Clear selection"
            aria-label="Clear selection"
            className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-[#0A66C2] bg-[#0A66C2] px-2 text-white shadow-sm transition hover:bg-[#0952a4] hover:border-[#0952a4] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:min-w-[44px] sm:px-3"
            onClick={clearSelection}
            disabled={selectedCount === 0}
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Send reminder to selected schools"
            aria-label="Send reminder to selected schools"
            className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-[#0A66C2] bg-[#0A66C2] px-2 text-white shadow-sm transition hover:bg-[#0952a4] hover:border-[#0952a4] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:min-w-[44px] sm:px-3"
            onClick={sendBulkReminders}
            disabled={selectedCount === 0 || busy}
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Send reminders to all incomplete schools"
            aria-label="Send reminders to all incomplete schools"
            className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-[#0A66C2] bg-[#0A66C2] px-2 text-white shadow-sm transition hover:bg-[#0952a4] hover:border-[#0952a4] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:min-w-[44px] sm:px-3"
            onClick={sendReminderToIncompleteSchools}
            disabled={busy}
          >
            <CalendarPlus className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Suspend selected schools"
            aria-label="Suspend selected schools"
            className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-[#0A66C2] bg-[#0A66C2] px-2 text-white shadow-sm transition hover:bg-[#0952a4] hover:border-[#0952a4] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:min-w-[44px] sm:px-3"
            onClick={() => performBulkAction("suspend")}
            disabled={selectedCount === 0 || busy}
          >
            <Pause className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Activate selected schools"
            aria-label="Activate selected schools"
            className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-[#0A66C2] bg-[#0A66C2] px-2 text-white shadow-sm transition hover:bg-[#0952a4] hover:border-[#0952a4] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:min-w-[44px] sm:px-3"
            onClick={() => performBulkAction("activate")}
            disabled={selectedCount === 0 || busy}
          >
            <Play className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Extend trial by 30 days for selected schools"
            aria-label="Extend trial by 30 days for selected schools"
            className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-[#0A66C2] bg-[#0A66C2] px-2 text-white shadow-sm transition hover:bg-[#0952a4] hover:border-[#0952a4] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:min-w-[44px] sm:px-3"
            onClick={() => performBulkAction("extendTrial", { days: 30 })}
            disabled={selectedCount === 0 || busy}
          >
            <CalendarPlus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {message ? (
        <div className="mb-4 rounded-2xl border border-border px-4 py-3 text-sm text-foreground bg-brand/5">
          {message}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase tracking-[0.15em] text-muted">
            <tr>
              <th className="px-4 py-3">
                <label className="flex items-center gap-2">
                  <input
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={toggleSelectCurrentPage}
                    className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="sr-only">Select all current page</span>
                </label>
              </th>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Verification</th>
              <th className="px-4 py-3">Trial ends</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((school) => (
              <tr key={school.id} className="hover:bg-brand/5 transition-colors">
                <td className="px-4 py-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSchoolIds.has(school.id)}
                      onChange={() => toggleSchoolSelection(school.id)}
                      className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                    />
                    <span className="sr-only">Select {school.name}</span>
                  </label>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-sm font-semibold text-brand">
                      {school.logoUrl ? (
                        <img
                          src={resolveSchoolAssetUrl(school.logoUrl) || school.logoUrl}
                          alt={`${school.name} logo`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{school.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{school.name}</div>
                      <div className="text-xs text-muted">{school.email ?? "No email"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-foreground">{school.country}</td>
                <td className="px-4 py-4 text-muted">{school.phone || "—"}</td>
                <td className="px-4 py-4 font-semibold text-foreground">
                  <div>{school.plan}</div>
                  <div className="text-xs text-muted">
                    {school.userCount ?? 0} admins · {school.pupilCount ?? 0} students
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                    school.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : school.status === "TRIAL"
                      ? "bg-sky-100 text-sky-700"
                      : school.status === "SUSPENDED"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-700"
                  }`}>
                    {school.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                    school.isVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {school.isVerified ? "✓ Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-4 py-4 text-muted">{school.trialEndsAt ? new Date(school.trialEndsAt).toLocaleDateString() : "n/a"}</td>
                <td className="px-4 py-4 text-muted">{new Date(school.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  <ActionMenu
                    school={school}
                    performAction={performAction}
                    sendReminder={sendReminder}
                    impersonate={impersonate}
                    busy={busy}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Showing {paginated.length} of {filteredSchools.length} schools.</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="px-3 py-2 text-xs"
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Prev
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.max(1, Math.ceil(filteredSchools.length / pageSize)) }).map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded ${page === pageNumber ? "bg-brand text-white" : "bg-background text-foreground border border-border"}`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            className="px-3 py-2 text-xs"
            disabled={page * pageSize >= filteredSchools.length}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
