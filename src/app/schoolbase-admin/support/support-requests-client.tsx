"use client";

import { getBackendUrl } from "@/lib/backend-url";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [replyStatus, setReplyStatus] = useState("IN_PROGRESS");
  const [readRequestIds, setReadRequestIds] = useState<string[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRequests = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/schoolbase-admin/api/support`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Unable to load support requests.");
      }

      const data = await res.json();
      setRequests(data.supportRequests || []);
    } catch (err) {
      console.error("Error loading support requests:", err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const storedRead = window.localStorage.getItem("support:read-requests");
      if (storedRead) {
        setReadRequestIds(JSON.parse(storedRead));
      }

      const storedDrafts = window.localStorage.getItem("support:reply-drafts");
      if (storedDrafts) {
        setReplyDrafts(JSON.parse(storedDrafts));
      }
    } catch (err) {
      console.error("Error loading draft state:", err);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("support:read-requests", JSON.stringify(readRequestIds));
  }, [readRequestIds]);

  useEffect(() => {
    window.localStorage.setItem("support:reply-drafts", JSON.stringify(replyDrafts));
  }, [replyDrafts]);

  useEffect(() => {
    void refreshRequests(true);

    const intervalId = window.setInterval(() => {
      void refreshRequests(false);
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshRequests(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshRequests]);

  useEffect(() => {
    if (selectedRequestId) {
      setReadRequestIds((current) => (current.includes(selectedRequestId) ? current : [...current, selectedRequestId]));
    }
  }, [selectedRequestId]);

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

  const unreadCount = useMemo(
    () => requests.filter((request) => !readRequestIds.includes(request.id)).length,
    [requests, readRequestIds],
  );

  const selectedRequest = selectedRequestId
    ? requests.find((request) => request.id === selectedRequestId) ?? null
    : null;

  useEffect(() => {
    if (filtered.length === 0) {
      if (selectedRequestId) setSelectedRequestId(null);
      return;
    }

    if (!selectedRequestId || !filtered.some((request) => request.id === selectedRequestId)) {
      setSelectedRequestId(filtered[0].id);
    }
  }, [filtered, selectedRequestId]);

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

  const quickReplies = [
    {
      label: "Need more details",
      text: "Thanks for reporting this. Could you please share a bit more detail about the issue, including screenshots, steps to reproduce, and the impact on your school operations?",
    },
    {
      label: "Thanks for waiting",
      text: "Thanks for your patience. We are reviewing this issue and will follow up with an update shortly with the next steps.",
    },
    {
      label: "Investigating",
      text: "We have received your report and are investigating the issue now. We will keep you updated as we work through it.",
    },
    {
      label: "Action required",
      text: "We need a little more information from your side to proceed. Please reply with the affected module, user role, and any recent changes made.",
    },
    {
      label: "Resolved",
      text: "This issue has now been resolved. Please test it on your end and let us know if anything else comes up.",
    },
    {
      label: "Escalated",
      text: "We have escalated this request to our technical team. You will receive an update as soon as we have more information.",
    },
  ];

  const handleReply = async () => {
    if (!selectedRequest) return;
    const currentDraft = replyDrafts[selectedRequest.id] ?? "";
    if (!currentDraft.trim()) {
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
          response: currentDraft,
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
      setReplyDrafts((current) => {
        const next = { ...current };
        delete next[selectedRequest.id];
        return next;
      });
      setSelectedRequestId(selectedRequest.id);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Unable to send reply.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Center</h1>
          <p className="mt-1 text-sm text-muted">
            Review and respond to school support tickets from a single, focused workspace.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets..."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-64"
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

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-border bg-surface p-4 shadow-sm lg:max-h-[70vh] lg:overflow-y-auto lg:overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tickets</h3>
              <p className="text-xs text-muted">{filtered.length} visible • {unreadCount} unread</p>
            </div>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background p-4 text-sm text-muted">
                No support requests match your search.
              </div>
            ) : (
              filtered.map((request) => {
                const isActive = selectedRequest?.id === request.id;
                return (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => {
                      setSelectedRequestId(request.id);
                      setReplyStatus(request.status === "OPEN" ? "IN_PROGRESS" : request.status);
                      setReplyError(null);
                      setReplySuccess(null);
                    }}
                    className={`w-full rounded-2xl border p-3 text-left transition ${isActive ? "border-brand bg-brand/5 shadow-sm" : "border-border bg-background hover:border-brand/40 hover:bg-brand/5"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{request.subject}</p>
                        <p className="mt-1 text-xs text-muted">{request.school?.name ?? "Unknown school"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {!readRequestIds.includes(request.id) ? (
                          <span className="rounded-full bg-brand/10 px-2 py-1 text-[10px] font-semibold text-brand">New</span>
                        ) : null}
                        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusClasses(request.status)}`}>
                          {request.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted">
                      <span className={`rounded-full px-2 py-1 ${priorityClasses(request.priority)}`}>{request.priority}</span>
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          {selectedRequest ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{selectedRequest.subject}</h2>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${priorityClasses(selectedRequest.priority)}`}>
                      {selectedRequest.priority}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses(selectedRequest.status)}`}>
                      {selectedRequest.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {selectedRequest.school ? (
                      <>
                        From {selectedRequest.school.name} • {selectedRequest.school.country}
                      </>
                    ) : (
                      "Unknown school"
                    )}
                  </p>
                </div>
                <div className="text-sm text-muted">
                  <div>Created {formatDate(selectedRequest.createdAt)}</div>
                  {selectedRequest.school ? (
                    <Link href={`/schoolbase-admin/schools/${selectedRequest.school.id}`} className="mt-1 inline-flex text-brand hover:underline">
                      View school
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Conversation</h3>
                  <span className="text-xs text-muted">
                    {selectedRequest.messages.length} {selectedRequest.messages.length === 1 ? "message" : "messages"}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedRequest.messages.length > 0 ? (
                    selectedRequest.messages.map((message) => {
                      const isSchoolMessage = message.senderRole === "SCHOOL";
                      const normalizedSenderName = typeof message.senderName === "string"
                        ? message.senderName.trim()
                        : "";
                      const senderName = isSchoolMessage
                        ? (selectedRequest.school?.name || normalizedSenderName || "School")
                        : (normalizedSenderName || "SchoolBase Support");
                      const badgeLabel = isSchoolMessage ? "School" : "Support";
                      const badgeClasses = isSchoolMessage
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-brand/10 text-brand";

                      return (
                        <div key={message.id} className="border-l-2 border-brand/30 pl-3 py-2">
                          <div className="flex items-start justify-between gap-3 text-[11px] text-muted">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${badgeClasses}`}>
                                {badgeLabel}
                              </span>
                              <span className="font-semibold text-foreground">{senderName}</span>
                            </div>
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-foreground whitespace-pre-line">{message.body}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-background px-3 py-4 text-sm text-muted">
                      No messages yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
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
                  <label className="mb-2 block text-sm font-medium text-foreground">Reply message</label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {quickReplies.map((template) => (
                      <button
                        key={template.label}
                        type="button"
                        onClick={() => setReplyDrafts((current) => ({ ...current, [selectedRequest.id]: `${current[selectedRequest.id] ?? ""}${current[selectedRequest.id] ? "\n\n" : ""}${template.text}`.trim() }))}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted transition hover:border-brand hover:text-brand"
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={replyDrafts[selectedRequest.id] ?? ""}
                    onChange={(event) => setReplyDrafts((current) => ({ ...current, [selectedRequest.id]: event.target.value }))}
                    className="min-h-[160px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    placeholder="Write your support reply here..."
                  />
                </div>
              </div>

              {replyError ? <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{replyError}</div> : null}
              {replySuccess ? <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{replySuccess}</div> : null}

              <div className="flex flex-wrap gap-3">
                <Button type="button" disabled={busy} onClick={handleReply}>
                  {busy ? "Sending reply..." : "Send reply"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted">
              Select a ticket from the left to view the conversation and reply.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
