"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Activity, Clock3 } from "lucide-react";
import AdminPageShell from "@/components/admin-page-shell";
import { getBackendUrl } from "@/lib/backend-url";

interface AuditLog {
  id: string;
  action?: string | null;
  details?: string | null;
  createdAt?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  school?: {
    name?: string | null;
  } | null;
}

function formatAuditDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function formatActionLabel(action?: string | null) {
  const value = (action || "").toString().trim().toUpperCase();
  if (!value) return "Platform activity";

  const map: Record<string, string> = {
    UPGRADE: "Plan upgrade",
    SETPLAN: "Plan update",
    SET_PLAN: "Plan update",
    EXTENDTRIAL: "Trial extended",
    EXTEND_TRIAL: "Trial extended",
    CANCEL: "Subscription cancelled",
    SUSPEND: "School suspended",
    ACTIVATE: "School activated",
    IMPERSONATE: "School impersonated",
    VERIFY: "Verification updated",
    VERIFIED: "Verification updated",
  };

  return map[value] || value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getActionTone(action?: string | null) {
  const value = (action || "").toString().trim().toUpperCase();

  if (["UPGRADE", "SETPLAN", "SET_PLAN"].includes(value)) {
    return "bg-sky-100 text-sky-700";
  }

  if (["CANCEL", "SUSPEND"].includes(value)) {
    return "bg-rose-100 text-rose-700";
  }

  if (["ACTIVATE", "VERIFY", "VERIFIED"].includes(value)) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (["IMPERSONATE"].includes(value)) {
    return "bg-violet-100 text-violet-700";
  }

  return "bg-slate-100 text-slate-700";
}

function formatDetailText(details?: string | null) {
  if (!details) return null;

  const trimmed = details.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if (typeof parsed.plan === "string" && parsed.plan) {
        const expiresAt = typeof parsed.expiresAt === "string" ? new Date(parsed.expiresAt) : null;
        const expiresLabel = expiresAt && !Number.isNaN(expiresAt.getTime()) ? ` • expires ${expiresAt.toLocaleDateString()}` : "";
        return `Plan set to ${parsed.plan}${expiresLabel}`;
      }

      if (typeof parsed.by === "string" && parsed.by) {
        return `Updated by ${parsed.by}`;
      }
    }
  } catch {
    // fall back to plain text
  }

  return trimmed;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchLogs() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/schoolbase-admin/api/audit-logs?limit=200`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to load audit logs");
        }

        const data = await response.json();
        setLogs(data.logs || []);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const recent = logs.filter((log) => {
      if (!log.createdAt) return false;
      const created = new Date(log.createdAt).getTime();
      const cutoff = Date.now() - 1000 * 60 * 60 * 24;
      return created >= cutoff;
    }).length;

    return { total, recent };
  }, [logs]);

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedLogs = logs.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [logs.length]);

  return (
    <AdminPageShell
      title="Audit trail"
      subtitle="Review recent platform and school administrative activity."
      actions={
        <Link
          href="/schoolbase-admin"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-brand hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Total events", value: stats.total, sub: "All recorded events", icon: Activity, tone: "bg-slate-100 text-slate-700" },
            { label: "Recent (24h)", value: stats.recent, sub: "Within the last day", icon: Clock3, tone: "bg-sky-100 text-sky-700" },
            { label: "Protected", value: logs.filter((log) => (log.action || "").toLowerCase().includes("verify") || (log.details || "").toLowerCase().includes("verify")).length, sub: "Verification-related activity", icon: ShieldCheck, tone: "bg-emerald-100 text-emerald-700" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-lg border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
                    <p className="mt-2 text-xs text-muted">{card.sub}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          {loading ? (
            <div className="rounded-2xl border border-border bg-background px-4 py-8 text-sm text-muted">Loading audit logs…</div>
          ) : logs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background px-4 py-8 text-sm text-muted">No audit logs found.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Recent platform activity</p>
                  <p className="text-sm text-muted">Showing {Math.min(pageSize, logs.length)} entries per page</p>
                </div>
                <div className="text-sm text-muted">Page {page} of {totalPages}</div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr] bg-background px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  <div>Action</div>
                  <div>Actor</div>
                  <div>School</div>
                  <div>Time</div>
                </div>
                <div className="divide-y divide-border bg-white">
                  {paginatedLogs.map((log) => {
                    const actionLabel = formatActionLabel(log.action);
                    const detailText = formatDetailText(log.details);
                    const actorName = log.user?.name || log.user?.email || "Platform admin";
                    const schoolName = log.school?.name || "—";

                    return (
                      <div key={log.id} className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr] gap-3 px-4 py-3 text-sm text-foreground">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getActionTone(log.action)}`}>
                              {actionLabel}
                            </span>
                          </div>
                          {detailText ? <p className="mt-2 text-xs text-muted">{detailText}</p> : null}
                        </div>
                        <div className="text-muted">{actorName}</div>
                        <div className="text-muted">{schoolName}</div>
                        <div className="text-muted">{formatAuditDate(log.createdAt)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, logs.length)} of {logs.length} events
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
