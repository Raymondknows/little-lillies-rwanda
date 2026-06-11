"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getBackendUrl } from "@/lib/backend-url";

export type SupportRequestRow = {
  id: string;
  subject: string;
  message: string;
  response?: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{
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

export default function SupportClient({
  initialRequests,
}: {
  initialRequests: SupportRequestRow[];
}) {
  const [requests, setRequests] = useState<SupportRequestRow[]>(initialRequests);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [requests],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    setBusy(true);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/support`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, priority }),
      });

      const contentType = response.headers.get("content-type") || "";
      let result: any = null;
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        // Non-JSON response (likely HTML redirect). Read text for diagnostics.
        const text = await response.text();
        if (!response.ok) {
          setError(text || "Unable to create support request.");
          return;
        }
        // If ok but non-JSON, still treat as success fallback (unlikely)
        result = { supportRequest: null };
      }

      if (!response.ok) {
        setError(result?.message || "Unable to create support request.");
        return;
      }

      if (!result?.supportRequest) {
        setError("Unable to create support request.");
        return;
      }

      setRequests((current) => [result.supportRequest, ...current]);
      setSubject("");
      setMessage("");
      setSuccess("Support request created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create support request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Create support request</h2>
              <p className="mt-1 text-sm text-muted">Send a support ticket for help with your school workflow.</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Subject</label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Example: Payment setup issue"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Priority</label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Message</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-[140px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Please explain the issue in detail."
              />
            </div>
            {error ? <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
            {success ? <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div> : null}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Sending..." : "Submit support request"}
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm h-fit">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent requests</h2>
              <p className="mt-1 text-sm text-muted">Your school's support history.</p>
            </div>
            <p className="text-sm font-semibold text-foreground flex-shrink-0">{sorted.length} requests</p>
          </div>

          <div className="space-y-3">
            {sorted.length === 0 ? (
              <p className="text-center text-sm text-muted py-6">No support requests yet.</p>
            ) : (
              sorted.map((request) => (
                <div 
                  key={request.id} 
                  className="rounded-2xl border border-border bg-background p-3 hover:shadow-md transition cursor-pointer"
                  onClick={() => setExpandedRequestId(expandedRequestId === request.id ? null : request.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">{request.subject}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${priorityClasses(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses(request.status)}`}>
                      {request.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted mb-2">{formatDate(request.createdAt)}</p>
                  {expandedRequestId === request.id && (
                    <div className="border-t border-border pt-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-3">
                        {request.messages?.length ? (
                          request.messages.map((message) => (
                            <div key={message.id} className="rounded-2xl border border-border bg-background p-3">
                              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                                <span className="font-semibold text-foreground">
                                  {message.senderRole === "SCHOOL" ? message.senderName || "Your school" : message.senderName || "Support team"}
                                </span>
                                <span>{formatDate(message.createdAt)}</span>
                              </div>
                              <p className="mt-2 text-sm text-foreground whitespace-pre-line">{message.body}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted mb-3">{request.message}</p>
                        )}
                      </div>

                      <div className="mt-3">
                        <label className="mb-2 block text-sm font-medium text-foreground">Reply to support</label>
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="min-h-[100px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                          placeholder="Write a reply to the support team..."
                        />
                        {replyError ? <div className="mt-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{replyError}</div> : null}
                        {replySuccess ? <div className="mt-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{replySuccess}</div> : null}
                        <div className="mt-3 flex gap-2">
                          <Button
                            type="button"
                            disabled={replyBusy}
                            onClick={async (ev) => {
                              ev.stopPropagation();
                              setReplyError(null);
                              setReplySuccess(null);
                              if (!replyMessage.trim()) {
                                setReplyError("Reply cannot be empty.");
                                return;
                              }
                              setReplyBusy(true);
                              try {
                                const backendUrl = getBackendUrl();
                                const res = await fetch(`${backendUrl}/api/admin/support/reply`, {
                                  method: "PATCH",
                                  credentials: "include",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ requestId: request.id, response: replyMessage }),
                                });

                                const contentType = res.headers.get("content-type") || "";
                                let json: any = null;
                                if (contentType.includes("application/json")) {
                                  json = await res.json();
                                } else {
                                  const text = await res.text();
                                  if (!res.ok) {
                                    setReplyError(text || "Unable to send reply.");
                                    return;
                                  }
                                  setReplyError("Unexpected non-JSON response from server.");
                                  return;
                                }

                                if (!res.ok) {
                                  setReplyError(json?.message || "Unable to send reply.");
                                  return;
                                }

                                if (!json?.supportRequest) {
                                  setReplyError("Unexpected server response when sending reply.");
                                  return;
                                }

                                setRequests((current) => current.map((r) => (r.id === request.id ? json.supportRequest : r)));
                                setReplySuccess("Reply sent successfully.");
                                setReplyMessage("");
                                setExpandedRequestId(null);
                              } catch (err) {
                                setReplyError(err instanceof Error ? err.message : "Unable to send reply.");
                              } finally {
                                setReplyBusy(false);
                              }
                            }}
                          >
                            {replyBusy ? "Sending..." : "Send reply"}
                          </Button>
                          <Button type="button" variant="secondary" onClick={(ev) => { ev.stopPropagation(); setExpandedRequestId(null); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
