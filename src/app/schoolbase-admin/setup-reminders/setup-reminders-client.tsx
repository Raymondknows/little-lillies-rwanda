"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Mail, Zap } from "lucide-react";
import { sendSetupCompletionRemindersAction, sendSetupCompletionReminder } from "@/app/schoolbase-admin/actions";
import { ErrorModal } from "@/components/ui/error-modal";
import { Pagination } from "@/components/ui/pagination";
import { getBackendUrl } from "@/lib/backend-url";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 500];

interface School {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
}

interface EmailLog {
  id: string;
  schoolId?: string;
  schoolName?: string;
  recipientEmail: string;
  recipientName?: string;
  emailType: string;
  subject: string;
  sentAt: string;
  status: string;
}

interface Props {
  initialSchools: School[];
  initialEmailLogs: EmailLog[];
}

export default function SetupRemindersClient({
  initialSchools = [],
  initialEmailLogs = [],
}: Props) {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(
    Array.isArray(initialEmailLogs) ? initialEmailLogs : []
  );
  const [setupStatuses, setSetupStatuses] = useState<Record<string, any>>({});
  const [sending, setSending] = useState(false);
  const [sendingFor, setSendingFor] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "new">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [emailLogPage, setEmailLogPage] = useState(1);
  const [emailLogItemsPerPage, setEmailLogItemsPerPage] = useState(10);
  const [pageLoading, setPageLoading] = useState(true);
  const [statusModal, setStatusModal] = useState<{ open: boolean; type: "success" | "error"; title?: string; message: string }>({
    open: false,
    type: "success",
    message: "",
  });

  // Load schools and email logs
  useEffect(() => {
    const loadData = async () => {
      try {
        const [schoolsRes, logsRes] = await Promise.all([
          fetch(`/schoolbase-admin/api/schools?limit=500`, {
            credentials: "include",
          }),
          fetch(`/schoolbase-admin/api/email-logs?emailType=SETUP_COMPLETION_REMINDER&limit=500`, {
            credentials: "include",
          }),
        ]);
        
        if (!schoolsRes.ok) {
          console.error('Schools fetch failed:', schoolsRes.status, await schoolsRes.text());
          setPageLoading(false);
          return;
        }
        
        const schoolsData = await schoolsRes.json();
        const logsData = logsRes.ok ? await logsRes.json() : { logs: [] };
        
        setSchools(schoolsData.schools || []);
        setEmailLogs(logsData.logs || []);
        
        // Load setup status for each school
        if (schoolsData.schools && schoolsData.schools.length > 0) {
          const statuses: Record<string, any> = {};
          for (const school of schoolsData.schools) {
            try {
              const statusRes = await fetch(`${getBackendUrl()}/api/admin/school/${school.id}/setup-status`, {
                credentials: "include",
              });
              if (statusRes.ok) {
                const statusData = await statusRes.json();
                // Map backend field names to frontend field names
                statuses[school.id] = {
                  isComplete: statusData.isComplete,
                  completionPercent: statusData.completionPercentage || 0,
                  incompleteTasks: statusData.incompleteItems || [],
                };
              } else {
                // Default status if endpoint fails
                statuses[school.id] = {
                  isComplete: false,
                  completionPercent: 0,
                  incompleteTasks: [],
                };
              }
            } catch (err) {
              console.error(`Failed to load setup status for school ${school.id}:`, err);
              statuses[school.id] = {
                isComplete: false,
                completionPercent: 0,
                incompleteTasks: [],
              };
            }
          }
          setSetupStatuses(statuses);
        }
        
        setPageLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setPageLoading(false);
      }
    };
    loadData();
  }, []);

  const handleBulkSend = async () => {
    try {
      setSending(true);

      const result = await sendSetupCompletionRemindersAction();

      setStatusModal({
        open: true,
        type: "success",
        title: "Reminders Sent",
        message: `Sent ${result.sentCount} reminders. Skipped ${result.skippedCount}.`,
      });

      // Reload email logs
      const response = await fetch(
        `/schoolbase-admin/api/email-logs?emailType=SETUP_COMPLETION_REMINDER&limit=50`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data.logs ?? []);
      }
    } catch (err) {
      setStatusModal({
        open: true,
        type: "error",
        title: "Reminder Failed",
        message: `Failed to send reminders: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendToSchool = async (schoolId: string) => {
    try {
      setSendingFor(schoolId);

      await sendSetupCompletionReminder(schoolId);

      setStatusModal({
        open: true,
        type: "success",
        title: "Email Sent",
        message: "The setup reminder email was sent successfully.",
      });

      // Reload email logs
      const response = await fetch(
        `/schoolbase-admin/api/email-logs?emailType=SETUP_COMPLETION_REMINDER&limit=50`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data.logs ?? []);
      }
    } catch (err) {
      setStatusModal({
        open: true,
        type: "error",
        title: "Email Failed",
        message: `Failed to send: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setSendingFor("");
    }
  };

  const incompleteSchools = useMemo(
    () => schools.filter(school => {
      const status = setupStatuses[school.id];
      return status && !status.isComplete;
    }),
    [schools, setupStatuses]
  );

  const displaySchools = useMemo(
    () => (filter === "all" ? schools : incompleteSchools),
    [schools, incompleteSchools, filter]
  );

  const completeCount = useMemo(
    () => schools.filter(school => {
      const status = setupStatuses[school.id];
      return status && status.isComplete;
    }).length,
    [schools, setupStatuses]
  );

  const totalPages = Math.max(1, Math.ceil(displaySchools.length / itemsPerPage));
  const paginatedSchools = useMemo(
    () =>
      displaySchools.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [displaySchools, currentPage, itemsPerPage]
  );

  const emailLogTotalPages = Math.max(1, Math.ceil(emailLogs.length / emailLogItemsPerPage));
  const paginatedEmailLogs = useMemo(
    () =>
      emailLogs.slice(
        (emailLogPage - 1) * emailLogItemsPerPage,
        emailLogPage * emailLogItemsPerPage
      ),
    [emailLogs, emailLogPage, emailLogItemsPerPage]
  );

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleEmailLogPageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEmailLogItemsPerPage(Number(event.target.value));
    setEmailLogPage(1);
  };

  const handleFilterToggle = () => {
    setFilter(filter === "all" ? "new" : "all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <ErrorModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        confirmLabel={statusModal.type === "success" ? "Okay" : "Try again"}
      />

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total schools",
            value: schools.length,
            sub: "Total registered schools",
            icon: Zap,
            iconClass: "bg-slate-100 text-slate-700",
            href: "/schoolbase-admin/schools",
          },
          {
            label: "Setup complete",
            value: completeCount,
            sub: "Schools with full setup",
            icon: CheckCircle2,
            iconClass: "bg-emerald-100 text-emerald-700",
            href: "/schoolbase-admin/schools",
          },
          {
            label: "Incomplete setup",
            value: incompleteSchools.length,
            sub: "Need reminders",
            icon: Bell,
            iconClass: "bg-amber-100 text-amber-800",
            href: "/schoolbase-admin/setup-reminders",
          },
          {
            label: "Emails sent",
            value: emailLogs.length,
            sub: "Setup reminder emails",
            icon: Mail,
            iconClass: "bg-sky-100 text-sky-700",
            href: "/schoolbase-admin/setup-reminders",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Schools Table Section */}
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm shadow-slate-200/50">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              School setup status
            </h2>
            <p className="mt-1 text-sm text-muted">
              Track setup progress and send reminders to incomplete schools
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleFilterToggle}
              className="rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
            >
              {filter === "all" ? "Show Incomplete" : "Show All"}
            </button>
            <button
              onClick={handleBulkSend}
              disabled={sending || incompleteSchools.length === 0}
              className="rounded-2xl border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:border-brand/80 hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send to All Incomplete"}
            </button>
          </div>
          </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <p className="text-sm text-muted">
            Showing {pageLoading ? "..." : (paginatedSchools.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0)}–
            {pageLoading ? "..." : Math.min(currentPage * itemsPerPage, displaySchools.length)} of {pageLoading ? "..." : displaySchools.length} schools
          </p>
          <label className="text-sm text-muted">
            Rows per page
            <select
              value={itemsPerPage}
              onChange={handlePageSizeChange}
              className="ml-2 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-border text-sm">
            <thead className="bg-background text-left text-xs uppercase tracking-[0.15em] text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">School Name</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold">Incomplete</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displaySchools.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No schools to display
                  </td>
                </tr>
              ) : (
                paginatedSchools.map((school) => {
                  const status = setupStatuses[school.id];
                  if (!status) return null;

                  return (
                    <tr
                      key={school.id}
                      className="hover:bg-brand/5 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <Link
                          href={`/schoolbase-admin/schools/${school.id}`}
                          className="font-semibold text-brand hover:underline"
                        >
                          {school.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-border overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                status.completionPercent === 100
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                              style={{
                                width: `${status.completionPercent}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground min-w-8">
                            {status.completionPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {(!status.incompleteTasks || status.incompleteTasks.length === 0) ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                            ✓ Complete
                          </span>
                        ) : (
                          <span className="text-sm text-muted">
                            {status.incompleteTasks.length} item
                            {status.incompleteTasks.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {!status.isComplete && (
                          <button
                            onClick={() => handleSendToSchool(school.id)}
                            disabled={
                              sending || sendingFor === school.id
                            }
                            className="rounded-lg bg-brand/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20 transition disabled:opacity-50"
                          >
                            {sendingFor === school.id
                              ? "Sending..."
                              : "Send"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-4"
        />
      </div>

      {/* Email Logs Section */}
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm shadow-slate-200/50">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Email logs</h2>
          <p className="mt-1 text-sm text-muted">
            Recent setup reminder emails sent to schools
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <p className="text-sm text-muted">
            Showing {emailLogs.length === 0 ? 0 : (emailLogPage - 1) * emailLogItemsPerPage + 1}–
            {Math.min(emailLogPage * emailLogItemsPerPage, emailLogs.length)} of {emailLogs.length} emails
          </p>
          <label className="text-sm text-muted">
            Rows per page
            <select
              value={emailLogItemsPerPage}
              onChange={handleEmailLogPageSizeChange}
              className="ml-2 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-border text-sm">
            <thead className="bg-background text-left text-xs uppercase tracking-[0.15em] text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Recipient</th>
                <th className="px-4 py-3 font-semibold">School</th>
                <th className="px-4 py-3 font-semibold">Sent</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {emailLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No emails sent yet
                  </td>
                </tr>
              ) : (
                paginatedEmailLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-brand/5 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {log.recipientName || log.recipientEmail}
                        </p>
                        <p className="text-xs text-muted">
                          {log.recipientEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {log.schoolName || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {new Date(log.sentAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          log.status === "SENT"
                            ? "bg-emerald-100 text-emerald-700"
                            : log.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {emailLogTotalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={emailLogPage}
              totalPages={emailLogTotalPages}
              onPageChange={setEmailLogPage}
              className="justify-end"
            />
          </div>
        )}
      </div>
    </div>
  );
}
