"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Clock3 } from "lucide-react";
import AdminPageShell from "@/components/admin-page-shell";
import { getBackendUrl } from "@/lib/backend-url";

interface EmailLog {
  id: string;
  schoolId?: string | null;
  schoolName?: string | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  emailType?: string | null;
  subject?: string | null;
  status?: string | null;
  sentAt?: string | null;
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchLogs() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/schoolbase-admin/api/email-logs?limit=200`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to load email logs");
        }

        const data = await response.json();
        setLogs(data.logs || []);
      } catch (error) {
        console.error("Failed to load email logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const delivered = logs.filter((log) => (log.status || "").toLowerCase() === "sent").length;
    const pending = logs.filter((log) => (log.status || "").toLowerCase() === "pending").length;
    const failed = logs.filter((log) => (log.status || "").toLowerCase() === "failed").length;

    return { total, delivered, pending, failed };
  }, [logs]);

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedLogs = logs.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [logs.length]);

  return (
    <AdminPageShell
      title="Email logs"
      subtitle="Review recent platform email activity for schools."
      actions={
        <Link
          href="/schoolbase-admin/email-center"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-brand hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to email center
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Total emails", value: stats.total, icon: Mail, tone: "bg-slate-100 text-slate-700" },
            { label: "Delivered", value: stats.delivered, icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
            { label: "Pending", value: stats.pending, icon: Clock3, tone: "bg-amber-100 text-amber-700" },
            { label: "Failed", value: stats.failed, icon: AlertCircle, tone: "bg-rose-100 text-rose-700" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{card.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{card.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          {loading ? (
            <div className="rounded-2xl border border-border bg-background px-4 py-8 text-sm text-muted">Loading email logs…</div>
          ) : logs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background px-4 py-8 text-sm text-muted">No email logs found.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Recent email activity</p>
                  <p className="text-sm text-muted">Showing {Math.min(pageSize, logs.length)} entries per page</p>
                </div>
                <div className="text-sm text-muted">Page {page} of {totalPages}</div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.6fr] bg-background px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  <div>Recipient</div>
                  <div>School</div>
                  <div>Type</div>
                  <div>Status</div>
                </div>
                <div className="divide-y divide-border bg-white">
                  {paginatedLogs.map((log) => (
                    <div key={log.id} className="grid grid-cols-[1.3fr_1fr_0.8fr_0.6fr] gap-3 px-4 py-3 text-sm text-foreground">
                      <div className="min-w-0">
                        <p className="font-medium">{log.recipientName || log.recipientEmail || "Unknown recipient"}</p>
                        {log.recipientEmail ? <p className="mt-1 text-xs text-muted">{log.recipientEmail}</p> : null}
                      </div>
                      <div className="text-muted">{log.schoolName || "—"}</div>
                      <div className="text-muted">{log.emailType || "—"}</div>
                      <div>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          (log.status || "").toLowerCase() === "sent"
                            ? "bg-emerald-100 text-emerald-700"
                            : (log.status || "").toLowerCase() === "failed"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}>
                          {log.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, logs.length)} of {logs.length} logs
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
