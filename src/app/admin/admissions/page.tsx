"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Clock3,
  FileText,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import { Button } from "@/components/ui/button";
import SubscriptionModal from "@/components/subscription-modal";
import { playCloseTone, playOpenTone } from "@/lib/sounds";

const statusStyles: Record<string, string> = {
  SUBMITTED: "bg-slate-100 text-slate-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

const statusBadgeStyles: Record<string, string> = {
  SUBMITTED: "border-slate-200 bg-slate-50 text-slate-700",
  UNDER_REVIEW: "border-blue-200 bg-blue-50 text-blue-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusBadgeIcons: Record<string, typeof FileText> = {
  SUBMITTED: FileText,
  UNDER_REVIEW: Clock3,
  APPROVED: CheckCircle2,
  REJECTED: CircleX,
};

function getStatusLabel(status: string) {
  return String(status || "SUBMITTED")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Success");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "rejected">("success");
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string } | null>(null);

  const summary = useMemo(() => {
    const counts: Record<string, number> = {
      total: applications.length,
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      APPROVED: 0,
      REJECTED: 0,
    };

    applications.forEach((application) => {
      const status = String(application.status || "SUBMITTED").toUpperCase();
      if (status in counts) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [applications]);

  async function loadApplications() {
    setLoading(true);
    setMessage(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/admissions`, { credentials: "include" });
      const data = await response.json().catch(() => null);

      if (response.status === 403 && data?.code === "SUBSCRIPTION_INACTIVE") {
        setSubscriptionBlocked({ reason: data?.reason || "Your school subscription is not active" });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load admissions");
      }

      setApplications(data?.applications || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load admissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingApplicationId(id);
    setMessage(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/admissions/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => null);

      if (response.status === 403 && data?.code === "SUBSCRIPTION_INACTIVE") {
        setSubscriptionBlocked({ reason: data?.reason || "Your school subscription is not active" });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to update status");
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === id
            ? { ...application, status: data.application?.status || status, updatedAt: new Date().toISOString() }
            : application
        )
      );

      const createdStudent = data.student ? ` A student record has been created (${data.student.id}).` : "";
      const studentCreationError = data?.studentCreationError;

      if (studentCreationError) {
        setModalType("error");
        setModalTitle("Something went wrong");
        setModalMessage(`The application was approved, but the student record could not be created automatically. ${studentCreationError}`);
        setSuccessModalOpen(true);
        playOpenTone();
        return;
      }

      if (status === "REJECTED") {
        setModalType("rejected");
        setModalTitle("Application Rejected");
        setModalMessage("The application has been rejected and will remain marked as rejected in the admin workflow.");
      } else if (status === "APPROVED") {
        setModalType("success");
        setModalTitle("Application Approved");
        setModalMessage(`The application has been approved successfully.${createdStudent}`);
      } else {
        setModalType("success");
        setModalTitle("Status updated");
        setModalMessage(`The application status has been updated successfully.${createdStudent}`);
      }

      setSuccessModalOpen(true);
      playOpenTone();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update status");
      setModalType("error");
      setModalTitle("Something went wrong");
      setModalMessage(error instanceof Error ? error.message : "Unable to update status");
      setSuccessModalOpen(true);
      playOpenTone();
    } finally {
      setUpdatingApplicationId(null);
    }
  }

  const filteredApplications = useMemo(
    () => applications.filter((application) => statusFilter === "ALL" || application.status === statusFilter),
    [applications, statusFilter]
  );

  function openApplicationDetail(application: any) {
    setSelectedApplication(application);
    setDetailModalOpen(true);
    playOpenTone();
  }

  function closeApplicationDetail() {
    setDetailModalOpen(false);
    setSelectedApplication(null);
    playCloseTone();
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} />;
  }

  const detailStatus = String(selectedApplication?.status || "SUBMITTED").toUpperCase();
  const detailStatusIcon = statusBadgeIcons[detailStatus] || FileText;
  const DetailStatusIcon = detailStatusIcon;
  const detailStatusClass = statusBadgeStyles[detailStatus] || statusBadgeStyles.SUBMITTED;

  const detailActionOptions = (() => {
    switch (detailStatus) {
      case "APPROVED":
        return ["UNDER_REVIEW", "REJECTED"];
      case "REJECTED":
        return ["APPROVED", "UNDER_REVIEW"];
      case "UNDER_REVIEW":
        return ["APPROVED", "REJECTED"];
      default:
        return ["APPROVED", "UNDER_REVIEW", "REJECTED"];
    }
  })();

  return (
    <main className="min-h-screen px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admissions requests</h1>
            <p className="mt-1 text-muted">Manage admission applications and track request status in one place</p>
          </div>
          <Button
            type="button"
            variant="primary"
            className="h-10 px-4 py-2 text-sm"
            onClick={() => void loadApplications()}
          >
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 shadow-sm">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total requests</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summary.total}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted">All admission requests submitted through the public form.</p>
          </div>
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 shadow-sm">
                <Clock3 className="h-4 w-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Under review</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summary.UNDER_REVIEW}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted">Applications waiting for final review.</p>
          </div>
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Approved</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summary.APPROVED}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted">Applications accepted and ready for onboarding.</p>
          </div>
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 shadow-sm">
                <Clock3 className="h-4 w-4 text-rose-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Rejected</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summary.REJECTED}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted">Applications that were declined or require follow-up.</p>
          </div>
        </div>

        {message ? (
          <div className="rounded-3xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
            {message}
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Incoming admission requests</h2>
              <p className="mt-1 text-sm text-slate-600">Filter and update request statuses directly from the admin panel.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                <span className="font-medium text-slate-600">Status filter</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="bg-transparent text-sm text-foreground outline-none"
                >
                  <option value="ALL">All</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <Button
                type="button"
                variant="primary"
                className="h-10 px-4 py-2 text-sm"
                onClick={() => void loadApplications()}
              >
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading admissions...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="rounded-b-3xl px-6 py-16 text-center text-sm text-slate-600">
              No applications match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Applicant</th>
                    <th className="px-5 py-3">Child</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="align-top hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{application.applicantName || `${application.firstName || ""} ${application.lastName || ""}`.trim() || "Unnamed applicant"}</div>
                        <div className="mt-1 text-xs text-slate-500">{application.intendedClass || "No intended class"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{application.childName || "—"}</div>
                        <div className="mt-1 text-xs text-slate-500">{application.parentName || "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-700">{application.email || "—"}</div>
                        <div className="mt-1 text-xs text-slate-500">{application.phone || "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[application.status] || statusStyles.SUBMITTED}`}>
                            {application.status.replace(/_/g, " ")}
                          </span>
                          <select
                            value={application.status}
                            onChange={(event) => void updateStatus(application.id, event.target.value)}
                            disabled={updatingApplicationId === application.id}
                            className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400"
                          >
                            <option value="SUBMITTED">Submitted</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex items-center gap-2 text-xs">
                          <Clock3 className="h-3.5 w-3.5" />
                          {new Date(application.updatedAt || application.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openApplicationDetail(application)}
                          className="rounded-full bg-[#0A66C2] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0858a8]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[460px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    background:
                      modalType === "success"
                        ? "rgba(16,185,129,0.12)"
                        : modalType === "rejected"
                          ? "rgba(244,63,94,0.12)"
                          : "rgba(245,158,11,0.12)",
                    borderColor:
                      modalType === "success"
                        ? "rgba(16,185,129,0.24)"
                        : modalType === "rejected"
                          ? "rgba(244,63,94,0.24)"
                          : "rgba(245,158,11,0.24)",
                  }}
                >
                  {modalType === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : modalType === "rejected" ? (
                    <CircleX className="h-5 w-5 text-rose-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{modalTitle}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {modalType === "success"
                      ? "The request has been updated successfully."
                      : modalType === "rejected"
                        ? "The application status has been changed to rejected."
                        : "Please review the message below and try again."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close result modal"
                onClick={() => {
                  playCloseTone();
                  setSuccessModalOpen(false);
                }}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm leading-6 text-slate-700">{modalMessage}</p>
            </div>
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  playCloseTone();
                  setSuccessModalOpen(false);
                }}
                className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {detailModalOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 sm:px-4">
          <div className="w-full max-w-[1120px] max-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.18)]">
            <div
              className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              style={{ background: "linear-gradient(90deg, rgba(10,102,194,0.12), rgba(10,102,194,0.04))" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/70 shadow-sm"
                  style={{ background: detailStatus === "APPROVED" ? "rgba(16,185,129,0.12)" : "rgba(10,102,194,0.12)" }}
                >
                  <DetailStatusIcon className="h-5 w-5" style={{ color: detailStatus === "APPROVED" ? "#059669" : "#0A66C2" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#0A66C2" }}>Admissions workspace</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-slate-900">Application Review</h2>
                    {selectedApplication.applicationNumber ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tracking-[0.2em] text-slate-600">
                        {selectedApplication.applicationNumber}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${detailStatusClass}`}>
                  <DetailStatusIcon className="h-3.5 w-3.5" />
                  {getStatusLabel(detailStatus)}
                </span>
                <button
                  type="button"
                  aria-label="Close application review"
                  onClick={closeApplicationDetail}
                  className="rounded-full bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid max-h-[calc(100vh-14rem)] gap-0 overflow-y-auto lg:grid-cols-[1.7fr_0.9fr]">
              <div className="min-w-0 px-5 py-4 sm:px-6">
                <div className="space-y-3">
                  <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#0A66C2" }}>Applicant Information</p>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">First Name</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.firstName || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Last Name</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.lastName || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Email</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.email || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Phone Number</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.phone || "—"}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#0A66C2" }}>Child Information</p>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Child Name</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{`${selectedApplication.studentFirstName || selectedApplication.childName || ""} ${selectedApplication.studentMiddleName || ""} ${selectedApplication.studentLastName || ""}`.replace(/\s+/g, " ").trim() || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Date of Birth</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.dateOfBirth ? new Date(selectedApplication.dateOfBirth).toLocaleDateString("en-NG") : "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Intended Class</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.intendedClass || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Parent / Guardian Name</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{`${selectedApplication.guardianFirst || ""} ${selectedApplication.guardianLast || ""}`.trim() || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Student Email</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.studentEmail || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Student Phone</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.studentPhone || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Gender</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.gender || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Admission Date</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.admissionDate ? new Date(selectedApplication.admissionDate).toLocaleDateString("en-NG") : "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Previous School</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.previousSchool || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Previous Class</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.previousClass || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3 sm:col-span-2">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Address</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.address || "—"}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#0A66C2" }}>Guardian Information</p>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Guardian Name</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{`${selectedApplication.guardianFirst || ""} ${selectedApplication.guardianLast || ""}`.trim() || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Relationship</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.guardianRelationship || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Guardian Email</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.guardianEmail || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Guardian Phone</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.guardianPhone || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Alternate Phone</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.guardianAltPhone || "—"}</dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Occupation</dt>
                        <dd className="mt-1.5 text-sm font-medium text-foreground">{selectedApplication.guardianOccupation || "—"}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#0A66C2" }}>Additional Information</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-sm leading-6 text-foreground whitespace-pre-wrap">{selectedApplication.note || "No additional note was submitted for this application."}</p>
                    </div>
                  </section>
                </div>
              </div>

              <aside className="border-t border-slate-200 bg-slate-50 px-5 py-4 lg:border-l lg:border-t-0 lg:border-slate-200 lg:px-6">
                <div className="space-y-3">
                  {selectedApplication.photoUrl ? (
                    <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#0A66C2" }}>Uploaded Photo</p>
                      <img src={selectedApplication.photoUrl} alt="Applicant photo" className="mt-4 h-72 w-full rounded-2xl object-cover" />
                    </section>
                  ) : null}

                  <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#0A66C2" }}>Internal Review Notes</p>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-foreground whitespace-pre-wrap">
                      {selectedApplication.note || "No internal review notes are currently attached to this application."}
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#0A66C2" }}>Medical Notes</p>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-foreground whitespace-pre-wrap">
                      {selectedApplication.medicalNotes || "—"}
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#0A66C2" }}>Meta</p>
                    <dl className="mt-4 space-y-3 text-sm text-foreground">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Submitted</dt>
                        <dd className="mt-1">{new Date(selectedApplication.createdAt).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Last Updated</dt>
                        <dd className="mt-1">{new Date(selectedApplication.updatedAt).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd>
                      </div>
                      {selectedApplication.applicationNumber ? (
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Application Ref</dt>
                          <dd className="mt-1">{selectedApplication.applicationNumber}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </section>
                </div>
              </aside>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {detailActionOptions.includes("APPROVED") ? (
                    <button
                      type="button"
                      onClick={() => void updateStatus(selectedApplication.id, "APPROVED")}
                      className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      Approve
                    </button>
                  ) : null}
                  {detailActionOptions.includes("UNDER_REVIEW") ? (
                    <button
                      type="button"
                      onClick={() => void updateStatus(selectedApplication.id, "UNDER_REVIEW")}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                      Under Review
                    </button>
                  ) : null}
                  {detailActionOptions.includes("REJECTED") ? (
                    <button
                      type="button"
                      onClick={() => void updateStatus(selectedApplication.id, "REJECTED")}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                    >
                      Reject
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={closeApplicationDetail}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
