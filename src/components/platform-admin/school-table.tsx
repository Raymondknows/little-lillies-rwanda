"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

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
  busy,
}: {
  school: SchoolRow;
  performAction: (schoolId: string, action: string, payload?: Record<string, unknown>) => Promise<void>;
  impersonate: (schoolId: string) => Promise<void>;
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

export function SchoolTable({ initialSchools }: { initialSchools: SchoolRow[] }) {
  const [schools, setSchools] = useState(initialSchools);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return schools.filter((school) => {
      const matchesSearch = [school.name, school.country, school.plan, school.email, school.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || school.status === statusFilter;
      const matchesVerification =
        verificationFilter === "ALL" ||
        (verificationFilter === "VERIFIED" && school.isVerified) ||
        (verificationFilter === "UNVERIFIED" && !school.isVerified);
      return matchesSearch && matchesStatus && matchesVerification;
    });
  }, [schools, search, statusFilter, verificationFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

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
        setSchools((current) =>
          current.map((school) => (school.id === schoolId ? { ...school, ...result.school } : school)),
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
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
      window.location.href = "/admin";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impersonation failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm shadow-slate-200/50">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Schools management</h2>
          <p className="mt-1 text-sm text-muted">
            Search, filter and manage active schools across the platform.
          </p>
        </div>
        <div className="grid gap-3 sm:flex sm:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search schools..."
            className="min-w-[240px] rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={verificationFilter}
            onChange={(event) => setVerificationFilter(event.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
          >
            <option value="ALL">All verifications</option>
            <option value="VERIFIED">Verified only</option>
            <option value="UNVERIFIED">Unverified only</option>
          </select>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(parseInt(event.target.value));
              setPage(1);
            }}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
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
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-sm font-semibold text-brand">
                      {school.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{school.name}</div>
                      <div className="text-xs text-muted">{school.email ?? "No email"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-foreground">{school.country}</td>
                <td className="px-4 py-4 text-muted">{school.phone ?? "—"}</td>
                <td className="px-4 py-4 font-semibold text-foreground">{school.plan}</td>
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
                  <ActionMenu school={school} performAction={performAction} impersonate={impersonate} busy={busy} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Showing {paginated.length} of {filtered.length} schools.</p>
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
            {Array.from({ length: Math.max(1, Math.ceil(filtered.length / pageSize)) }).map((_, i) => {
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
            disabled={page * pageSize >= filtered.length}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
