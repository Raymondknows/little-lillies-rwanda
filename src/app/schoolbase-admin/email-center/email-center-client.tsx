"use client";

import { useEffect, useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { getBackendUrl } from "@/lib/backend-url";
import { sendPlatformCommunicationEmailAction } from "@/app/schoolbase-admin/actions";

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

const EMAIL_TYPES = [
  { value: "PRODUCT_UPDATE", label: "Product update / feature announcement" },
  { value: "PRICE_UPDATE", label: "Price update / plan change" },
  { value: "SUPPORT_UPDATE", label: "Support case update" },
  { value: "ONBOARDING_GUIDANCE", label: "Onboarding guidance for new schools" },
  { value: "BEST_PRACTICE_TIP", label: "Best-practice tips for using SchoolBase" },
  { value: "MANUAL_ANNOUNCEMENT", label: "Custom announcement / manual follow-up" },
  { value: "POLICY_UPDATE", label: "Compliance / policy update" },
  { value: "ACCOUNT_SECURITY", label: "Account security notice" },
];

const PLATFORM_FEATURES = "Admissions, Student Records, Attendance, Fees, Payments, Results, Report Cards, Staff Management, and WhatsApp Communication";

const EMAIL_TEMPLATES: Record<string, { subject: string; body: string }> = {
  PRODUCT_UPDATE: {
    subject: "Product news: faster workflows and better parent engagement in SchoolBase",
    body: `Hello,

We’re excited to share a new SchoolBase release that makes it easier to manage Admissions, Student Records, Attendance, Fees, Payments, Results, Report Cards, Staff Management, and WhatsApp Communication from one platform.

What’s included:
• A faster admin dashboard for attendance, fees, and report cards.
• Streamlined student records and admissions workflows.
• Better WhatsApp communication tools for parents and staff.

Open SchoolBase to try the improved experience.`,
  },
  PRICE_UPDATE: {
    subject: "Important update: SchoolBase pricing and plan improvements",
    body: `Hello,

We’re notifying you about an upcoming SchoolBase pricing update that brings clearer value and more flexibility to your school.

Key points:
• Improved pricing structure aligned with Admissions, Student Records, Attendance, Fees, Payments, Results, Report Cards, Staff Management, and WhatsApp Communication usage.
• New plan options designed to support growing schools and simplify budgeting.
• Continued investment in reliability, support, and the tools your team uses every day.

This change is intended to help your school capture more value from SchoolBase while keeping costs predictable.

If you have questions or want a price review for your current plan, reply directly to this email.`,
  },
  SUPPORT_UPDATE: {
    subject: "Support update: your SchoolBase request is being handled",
    body: `Hello,

This is an update on your SchoolBase support request. Our team is reviewing the issue and will respond with a clear next step shortly.

We are tracking your request against the full SchoolBase experience, including ${PLATFORM_FEATURES}, so you can continue operating smoothly while we resolve it.

If there are any additional details, reply directly to this email.`,
  },
  ONBOARDING_GUIDANCE: {
    subject: "Onboarding guidance: get your school live with SchoolBase",
    body: `Hello,

Welcome to SchoolBase. We’re here to help your school complete setup and start using Admissions, Student Records, Attendance, Fees, Payments, Results, Report Cards, Staff Management, and WhatsApp Communication.

Key next steps:
• Confirm your school profile and contact information.
• Add teachers, classes, and students.
• Publish fee schedules and share the parent portal login.
• Activate WhatsApp communication for parents and staff updates.

Reply to this email if you want us to book a short onboarding call for your team.`,
  },
  BEST_PRACTICE_TIP: {
    subject: "Best practice tips: keep parents informed and collect fees faster",
    body: `Hello,

Here are three best practices for schools using SchoolBase across Admissions, Student Records, Attendance, Fees, Payments, Results, Report Cards, Staff Management, and WhatsApp Communication:

1) Send parent notifications early for term dates, fees, and events via portal and WhatsApp.
2) Use automated fee reminders and payment tracking to reduce late payments.
3) Review attendance and results reports each day to support student interventions.

These actions drive better communication, stronger finances, and better outcomes.`,
  },
  MANUAL_ANNOUNCEMENT: {
    subject: "Important announcement from SchoolBase operations",
    body: `Hello,

We have an important update for your school. This message covers core SchoolBase capabilities including Admissions, Student Records, Attendance, Fees, Payments, Results, Report Cards, Staff Management, and WhatsApp Communication.

[Add announcement details here]

Please review and share this with your administrative team. If you need support implementing this change, reply to this email.`,
  },
  POLICY_UPDATE: {
    subject: "Compliance update: new SchoolBase policy and data requirements",
    body: `Hello,

We’re writing to share an important compliance update for SchoolBase schools.

Please note the following changes:
• Updated data handling and privacy requirements for student records and staff accounts.
• New controls for access across admissions, fees, and results.
• Revised reporting requirements for audits and WhatsApp communication logs.

If you have any questions, our compliance team is available to assist.`,
  },
  ACCOUNT_SECURITY: {
    subject: "Security notice: protect your SchoolBase accounts",
    body: `Hello,

Your security is our top priority. Please review these recommended actions for all SchoolBase modules, including Admissions, Student Records, Attendance, Fees, Payments, Results, Report Cards, Staff Management, and WhatsApp Communication:
• Use strong, unique passwords for SchoolBase admin accounts.
• Enable two-factor authentication if available.
• Report any unexpected login activity immediately.

If you need help securing your account, reply to this email and our team will assist.`,
  },
};

const SEGMENTS = [
  { value: "all", label: "All schools" },
  { value: "active", label: "Active schools" },
  { value: "trial", label: "Trial schools" },
  { value: "new", label: "New schools (last 7 days)" },
];

const DEFAULT_SUBJECTS: Record<string, string> = {
  PRODUCT_UPDATE: "SchoolBase product update: new feature available",
  SUPPORT_UPDATE: "Support case update from SchoolBase",
  ONBOARDING_GUIDANCE: "Onboarding guidance for your SchoolBase setup",
  BEST_PRACTICE_TIP: "Best practice tips for using SchoolBase",
  MANUAL_ANNOUNCEMENT: "Important SchoolBase update from our team",
  PRICE_UPDATE: "Important price update for SchoolBase",
  POLICY_UPDATE: "Important compliance and policy update",
  ACCOUNT_SECURITY: "Important account security notice",
};

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

export default function EmailCenterClient({
  initialSchools,
  initialEmailLogs,
}: Props) {
  const [selectedTarget, setSelectedTarget] = useState<"school" | "segment">(
    "school"
  );
  const [selectedSchoolId, setSelectedSchoolId] = useState(
    initialSchools[0]?.id ?? ""
  );
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedEmailType, setSelectedEmailType] = useState(
    "MANUAL_ANNOUNCEMENT"
  );
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [emailLogs, setEmailLogs] = useState(initialEmailLogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  useEffect(() => {
    const template = EMAIL_TEMPLATES[selectedEmailType];
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [selectedEmailType]);

  const selectedSchool = useMemo(
    () => initialSchools.find((school) => school.id === selectedSchoolId),
    [initialSchools, selectedSchoolId]
  );

  const fetchEmailLogs = async (page = currentPage, pageSize = itemsPerPage) => {
    try {
      const backendUrl = getBackendUrl();
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      
      if (selectedEmailType && selectedEmailType !== "ALL") {
        params.append('emailType', selectedEmailType);
      }

      const response = await fetch(`${backendUrl}/schoolbase-admin/api/email-logs?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch email logs (${response.status})`);
      }

      const data = await response.json();
      setEmailLogs(data.logs || []);
      setTotalCount(data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching email logs:', err);
      setEmailLogs([]);
      setTotalCount(0);
    }
  };

  // Email logs are loaded as initialEmailLogs from server, fetch from API when available
  useEffect(() => {
    fetchEmailLogs(currentPage, itemsPerPage);
  }, [selectedEmailType, currentPage, itemsPerPage]);

  const emailTypeLabel = useMemo(
    () =>
      EMAIL_TYPES.find((option) => option.value === selectedEmailType)?.label ||
      "Manual email",
    [selectedEmailType]
  );

  const defaultSubject = DEFAULT_SUBJECTS[selectedEmailType] || "SchoolBase update";

  const refreshEmailLogs = async () => {
    await fetchEmailLogs(currentPage, itemsPerPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setError("");
    setSuccessModalMessage("");

    try {
      if (!subject.trim()) {
        throw new Error("Please enter an email subject.");
      }
      if (!body.trim()) {
        throw new Error("Please enter an email message.");
      }
      if (selectedTarget === "school" && !selectedSchoolId) {
        throw new Error("Please select a school.");
      }

      const emailData = {
        targetType: selectedTarget as 'school' | 'segment',
        selectedSchoolId: selectedTarget === 'school' ? selectedSchoolId : undefined,
        selectedSegment: selectedTarget === 'segment' ? selectedSegment : undefined,
        emailType: selectedEmailType,
        subject,
        body,
      };

      const result = await sendPlatformCommunicationEmailAction(emailData);

      const message = `Sent ${result.sentCount} email(s). ${result.skippedCount} skipped.`;
      setSuccessModalMessage(message);
      setShowSuccessModal(true);
      setError("");
      await refreshEmailLogs();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send platform email."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm shadow-slate-200/50">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Send platform communication email</h2>
              <p className="mt-2 text-sm text-muted">
                Choose a school or a school segment, then send announcements, product news, updates, or security notices.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Email type</label>
                <select
                  value={selectedEmailType}
                  onChange={(event) => setSelectedEmailType(event.target.value)}
                  name="emailType"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand"
                >
                  {EMAIL_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Send to</label>
                <div className="grid gap-2 rounded-3xl border border-transparent bg-background p-2 sm:border-border">
                  <label className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50">
                    <input
                      type="radio"
                      name="target"
                      value="school"
                      checked={selectedTarget === "school"}
                      onChange={() => setSelectedTarget("school")}
                      className="h-4 w-4 accent-brand"
                    />
                    Single school
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50">
                    <input
                      type="radio"
                      name="target"
                      value="segment"
                      checked={selectedTarget === "segment"}
                      onChange={() => setSelectedTarget("segment")}
                      className="h-4 w-4 accent-brand"
                    />
                    School segment
                  </label>
                </div>
              </div>
            </div>

            {selectedTarget === "school" ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Select school</label>
                <select
                  name="schoolId"
                  value={selectedSchoolId}
                  onChange={(event) => setSelectedSchoolId(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand"
                >
                  {initialSchools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name} {school.email ? `(${school.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Select segment</label>
                <select
                  name="segment"
                  value={selectedSegment}
                  onChange={(event) => setSelectedSegment(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand"
                >
                  {SEGMENTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Subject</label>
              <input
                type="text"
                name="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder={defaultSubject}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Message</label>
              <textarea
                name="body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={10}
                placeholder={`Write your ${emailTypeLabel.toLowerCase()} message here.`}
                className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand"
              />
              <p className="text-sm text-muted">
                Note: the selected template already includes a greeting and signing text, so you can focus on the main message content.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {selectedTarget === "school"
                  ? "The email will be sent to the selected school admin email address."
                  : "The email will be sent to the admin user of each school in the selected segment."}
              </p>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send email"}
              </button>
            </div>

            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm shadow-slate-200/50">
          <h2 className="text-lg font-semibold text-foreground">Email details</h2>
          <div className="mt-4 space-y-4 text-sm text-muted">
            <p>
              Use this panel for platform announcements, product news, support updates, onboarding guidance, compliance alerts, and security notices.
            </p>
            <p>
              SchoolBase will send these messages to the primary school admin email address for each selected school.
            </p>
            <div className="rounded-3xl border border-transparent bg-background p-4 sm:border-border">
              <p className="text-sm font-semibold text-foreground">Recommended use</p>
              <ul className="mt-2 space-y-2 pl-4 text-sm text-muted list-disc">
                <li>Product updates and feature announcements</li>
                <li>Support case updates and follow-ups</li>
                <li>Onboarding guidance for new schools</li>
                <li>Best-practice tips for using SchoolBase</li>
                <li>Manual announcements or operational messages</li>
                <li>Compliance, policy, and account security alerts</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm shadow-slate-200/50">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent email activity</h2>
            <p className="mt-1 text-sm text-muted">Recently sent platform communication emails.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={refreshEmailLogs}
              className="rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
            >
              Refresh logs
            </button>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground">
              <label htmlFor="pageSize" className="text-sm text-muted">
                Rows per page:
              </label>
              <select
                id="pageSize"
                value={itemsPerPage}
                onChange={handlePageSizeChange}
                className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-background text-left text-xs uppercase tracking-[0.15em] text-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {emailLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted">
                    No email activity yet.
                  </td>
                </tr>
              ) : (
                emailLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="cursor-pointer hover:bg-brand/5 transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-4 py-4 text-sm text-muted">{new Date(log.sentAt).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{log.schoolName ?? "Platform"}</td>
                    <td className="px-4 py-4 text-sm text-muted">{log.emailType}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{log.subject}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">{log.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(totalCount / itemsPerPage))}
          onPageChange={setCurrentPage}
          className="mt-4"
        />
      </section>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Email sent successfully</h3>
                <p className="mt-2 text-sm text-muted">{successModalMessage}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white"
                onClick={() => setShowSuccessModal(false)}
              >
                Back to email center
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLog && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 px-4 py-8">
          <div className="h-full w-full max-w-2xl overflow-y-auto rounded-l-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Email details</h3>
                <p className="mt-1 text-sm text-muted">View the full record for this email log.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-2xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm text-muted">
              <div>
                <p className="font-semibold text-foreground">School</p>
                <p>{selectedLog.schoolName ?? "Platform"}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Recipient</p>
                <p>{selectedLog.recipientEmail}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Type</p>
                <p>{selectedLog.emailType}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Subject</p>
                <p>{selectedLog.subject}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Status</p>
                <p>{selectedLog.status}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Sent</p>
                <p>{new Date(selectedLog.sentAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
