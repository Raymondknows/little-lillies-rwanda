"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Download, Printer, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import { formatMoney, pupilName as formatPupilName } from "@/lib/format";
import { resolveSchoolAssetUrl } from "@/lib/asset-urls";

type InvoicePayment = {
  id: string;
  amount: number;
  paidAt: string;
  method?: string;
  reference?: string;
};

type InvoiceDetail = {
  id: string;
  invoiceNo?: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  feeSchedule?: {
    name?: string;
    term?: {
      name?: string;
      academicYear?: {
        name?: string;
      };
    };
  };
  pupil: {
    firstName: string;
    lastName: string;
    middleName?: string | null;
    class?: {
      name?: string;
      arm?: string | null;
    } | null;
  };
  payments: InvoicePayment[];
};

type SchoolDetail = {
  name?: string;
  currency?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  principalName?: string;
  tagline?: string;
  principalComment?: string;
};

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/parent/invoices/${params.id}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load invoice");
        }

        const data = await res.json();
        setInvoice(data.invoice);
        setSchool(data.school);
      } catch (err) {
        console.error("Error loading invoice:", err);
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto" />
          <p className="mt-4 text-muted">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/parent/invoices")}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:opacity-80"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to invoices
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-900">Invoice unavailable</p>
            <p className="text-sm text-red-700 mt-1">{error || "This invoice could not be loaded."}</p>
          </div>
        </div>
      </div>
    );
  }

  const outstanding = Math.max(0, invoice.amountDue - invoice.amountPaid);
  const isPaid = outstanding === 0;
  const isPartPaid = invoice.amountPaid > 0 && outstanding > 0;
  const pupilName = formatPupilName(invoice.pupil.firstName, invoice.pupil.lastName, invoice.pupil.middleName || undefined);
  const className = invoice.pupil.class ? `${invoice.pupil.class.name}${invoice.pupil.class.arm ? ` ${invoice.pupil.class.arm}` : ""}` : "Unassigned";
  const termName = invoice.feeSchedule?.term?.name || "Current Term";
  const academicYear = invoice.feeSchedule?.term?.academicYear?.name || "";
  const currency = school?.currency || "NGN";
  let schoolLogo = resolveSchoolAssetUrl(school?.logoUrl);
  if (schoolLogo === "/api/admin/school-logo" && school?.name && school?.logoUrl) {
    // prefer public route with school id to avoid session-protected admin route
    // invoice data includes school info from backend; use school id if available in logoUrl or data
    // try to parse id from original logoUrl if possible, else use invoice school id from `school` object if present
    // here `school` may not contain id in this shape; fallback to leaving as-is if we can't determine id
    // If `school` has an `id` field, prefer that
    // @ts-ignore - some responses include `id`
    const maybeId = (school as any)?.id;
    if (maybeId) {
      schoolLogo = `/api/school-logo/${encodeURIComponent(maybeId)}`;
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => router.push("/parent/invoices")}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:opacity-80"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to invoices
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/10"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        {/* Invoice Container */}
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden print:shadow-none print:rounded-none">
          {/* Header Section with Brand Color */}
          <div className="p-6 md:p-8 bg-brand print:p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="text-white flex-1">
                <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-3 text-white/80">
                  Invoice details
                </div>
                <h1 className="text-3xl font-bold">{invoice.invoiceNo || invoice.id.slice(0, 8).toUpperCase()}</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/80">
                  A full breakdown of the billed amount, payment status, and school fee information for {pupilName}.
                </p>
              </div>
              <div className="text-right text-white">
                {schoolLogo ? (
                  <img src={schoolLogo} alt={school?.name || "School Logo"} className="h-14 w-14 rounded-lg bg-white/10 object-contain p-1.5 ml-auto mb-2" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-xl ml-auto mb-2">🏫</div>
                )}
                <p className="text-sm font-semibold">{school?.name || "School"}</p>
              </div>
            </div>
          </div>

          {/* Student/Term/Status Row */}
          <div className="grid grid-cols-3 gap-4 border-b border-border bg-background/50 p-6 md:p-8 md:gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Student</p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">{pupilName}</p>
              <p className="text-xs text-muted mt-0.5">{className}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Term</p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">{termName}</p>
              <p className="text-xs text-muted mt-0.5">{academicYear}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Status</p>
              <div className="mt-1.5 inline-flex">
                {isPaid ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Paid
                  </div>
                ) : isPartPaid ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                    <Clock3 className="h-3.5 w-3.5" />
                    Partial
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Outstanding
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8 md:gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Amount Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Billed</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{formatMoney(invoice.amountDue, currency)}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Paid</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600">{formatMoney(invoice.amountPaid, currency)}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Outstanding</p>
                  <p className={`mt-2 text-2xl font-bold ${outstanding > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {formatMoney(outstanding, currency)}
                  </p>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="rounded-xl border border-border p-5">
                <h2 className="text-lg font-bold text-foreground">Invoice summary</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Invoice date</p>
                    <p className="mt-1 text-sm text-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Due date</p>
                    <p className="mt-1 text-sm text-foreground">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "On demand"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Description</p>
                    <p className="mt-1 text-sm text-foreground">{invoice.feeSchedule?.name || "School fees"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Reference</p>
                    <p className="mt-1 text-sm text-foreground">{invoice.invoiceNo || invoice.id}</p>
                  </div>
                </div>
              </div>

              {/* Payments */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="border-b border-border bg-background/50 px-5 py-4">
                  <h2 className="text-lg font-bold text-foreground">Payments</h2>
                </div>
                {invoice.payments.length === 0 ? (
                  <div className="px-5 py-8 text-sm text-muted">No payments recorded for this invoice yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {invoice.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between gap-4 px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{payment.method || "Payment"}</p>
                          <p className="text-xs text-muted">{new Date(payment.paidAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{formatMoney(payment.amount, currency)}</p>
                          <p className="text-xs text-muted">{payment.reference || "No reference"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* School Details */}
              <div className="rounded-xl border border-border bg-background/50 p-5">
                <h2 className="text-lg font-bold text-foreground">School details</h2>
                {school?.tagline && <p className="mt-2 text-sm text-muted italic">{school.tagline}</p>}
                <div className="mt-4 space-y-3 text-sm text-foreground">
                  <p>{school?.address}</p>
                  <p>{school?.city}</p>
                  {school?.phone && <p>{school.phone}</p>}
                  {school?.email && <p>{school.email}</p>}
                </div>
              </div>

              {/* Principal Comment */}
              {school?.principalComment && (
                <div className="rounded-xl border border-border p-5">
                  <h2 className="text-lg font-bold text-foreground">Note from the school</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">{school.principalComment}</p>
                </div>
              )}

              {/* Payment Status */}
              <div className="rounded-xl border border-border p-5">
                <h2 className="text-lg font-bold text-foreground">Payment status</h2>
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-background/50 px-4 py-3">
                  {isPaid ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Clock3 className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{isPaid ? "Fully settled" : isPartPaid ? "Partially settled" : "Awaiting payment"}</p>
                    <p className="text-xs text-muted">{invoice.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
