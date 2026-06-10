"use client";

import { getBackendUrl } from "@/lib/backend-url";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export type PlatformSupportRequestRow = {
  id: string;
  subject: string;
  message: string;
  response?: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderRole: string;
    senderName: string;
    senderEmail?: string | null;
    body: string;
    createdAt: string;
  }>;
  school: {
    id: string;
    name: string;
    country: string;
  } | null;
};

function statusClasses(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-100 text-emerald-700";
    case "IN_PROGRESS":
      return "bg-sky-100 text-sky-700";
    case "RESOLVED":
      return "bg-slate-100 text-slate-700";
    case "CLOSED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function priorityClasses(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return "bg-rose-100 text-rose-800";
    case "HIGH":
      return "bg-amber-100 text-amber-800";
    case "MEDIUM":
      return "bg-sky-100 text-sky-700";
    case "LOW":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SupportRequestsClient({
  initialRequests = [],
}: {
  initialRequests?: PlatformSupportRequestRow[];
}) {
  const [requests, setRequests] = useState<PlatformSupportRequestRow[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("IN_PROGRESS");
  const [busy, setBusy] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/schoolbase-admin/api/support`, {
          credentials: "include",
        });
        const data = await res.json();
        setRequests(data.supportRequests || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading support requests:", err);
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const filtered = useMemo(
    () =>
      requests.filter((request) => {
        const text = [
          request.subject,
          request.message,
          request.school?.name,
          request.status,
          request.priority,
          request.response,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesSearch = !search.trim() || text.includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || request.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [requests, search, statusFilter],
  );

  const selectedRequest = selectedRequestId
    ? requests.find((request) => request.id === selectedRequestId) ?? null
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="mt-3 text-muted">Loading support requests...</p>
        </div>
      </div>
    );
  }

  const handleReply = async () => {
    if (!selectedRequest) return;
    if (!replyText.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    setReplyError(null);
    setReplySuccess(null);
    setBusy(true);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/schoolbase-admin/api/support/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          requestId: selectedRequest.id,
          response: replyText,
          status: replyStatus,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setReplyError(result.message || "Unable to send reply.");
        return;
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === selectedRequest.id ? result.supportRequest : request,
        ),
      );
      setReplySuccess("Reply sent successfully.");
      setReplyText("");
      setSelectedRequestId(null);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Unable to send reply.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">All support requests</h2>
            <p className="text-sm text-muted">
              Review and filter support tickets by school, priority, or status. Select a ticket to reply from the panel below.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px] xl:grid-cols-[360px_minmax(0,1fr)]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-background text-left text-xs uppercase tracking-[0.15em] text-muted">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Response</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
                    No support requests match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((request) => (
                  <tr key={request.id} className="hover:bg-brand/5 transition-colors">
                    <td className="px-4 py-4 font-semibold text-foreground">{request.subject}</td>
                    <td className="px-4 py-4 text-muted">
                      {request.school ? (
                        <Link href={`/schoolbase-admin/schools/${request.school.id}`} className="text-brand hover:underline">
                          {request.school.name}
                        </Link>
                      ) : (
                        "Unknown"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${priorityClasses(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses(request.status)}`}>
                        {request.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted">{formatDate(request.createdAt)}</td>
                    <td className="px-4 py-4 text-muted line-clamp-2">
                      {request.response ? request.response : "No reply yet."}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRequestId(request.id);
                          setReplyText(request.response ?? "");
                          setReplyStatus(request.status === "OPEN" ? "IN_PROGRESS" : request.status);
                          setReplyError(null);
                          setReplySuccess(null);
                        }}
                        className="rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-brand hover:text-brand"
                      >
                        Reply
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest ? (
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Reply to support request</h2>
              <p className="mt-1 text-sm text-muted">{selectedRequest.subject} — {selectedRequest.school?.name ?? "Unknown school"}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRequestId(null)}
              className="rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-background p-4">
              <h3 className="text-sm font-semibold text-foreground">Conversation thread</h3>
              <div className="mt-4 space-y-3">
                {selectedRequest.messages.length > 0 ? (
                  selectedRequest.messages.map((message) => (
                    <div key={message.id} className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center justify-between gap-3 text-xs text-muted">
                        <span className="font-semibold text-foreground">
                          {message.senderRole === "SCHOOL" ? message.senderName || "School" : message.senderName || "Support team"}
                        </span>
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-foreground whitespace-pre-line">{message.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No messages yet.</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Set status</label>
                <select
                  value={replyStatus}
                  onChange={(event) => setReplyStatus(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                >
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Current status</label>
              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                {selectedRequest.status.replace("_", " ")}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-foreground">Reply message</label>
            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              className="min-h-[160px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="Write your support reply here..."
            />
          </div>

          {replyError ? <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{replyError}</div> : null}
          {replySuccess ? <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{replySuccess}</div> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" disabled={busy} onClick={handleReply}>
              {busy ? "Sending reply..." : "Send reply"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setSelectedRequestId(null)}>
              Cancel
            </Button>
          </div>
        </div>
        </section>
      ) : null}
    </div>
  );
}
