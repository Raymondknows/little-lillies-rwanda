"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackendUrl } from "@/lib/backend-url";
import { formatMoney, pupilName as formatPupilName, invoiceStatusLabel } from "@/lib/format";
import { Download, Printer, ChevronLeft, Check, AlertCircle } from "lucide-react";

const BRAND_BLUE = "#0A66C2";
const LIGHT_BLUE = "#E7F1F8";
const DARK_GRAY = "#1F2937";
const MID_GRAY = "#6B7280";
const LIGHT_GRAY = "#F3F4F6";
const BORDER_GRAY = "#E5E7EB";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [invoice, setInvoice] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await params;
      setInvoiceId(p.id);

      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/invoices/${p.id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch invoice");
        }

        const data = await response.json();
        setInvoice(data.invoice);
        setSchool(data.school);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  const handleDownloadPDF = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/invoices/${invoiceId}/pdf`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceNo}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download invoice");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/admin/fees" className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition" style={{ color: BRAND_BLUE }}>
            <ChevronLeft size={16} />
            Back to Fees
          </Link>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4" style={{ borderLeftColor: "#EF4444" }}>
            <div className="flex items-start gap-3">
              <AlertCircle size={20} style={{ color: "#EF4444" }} className="flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Invoice Not Found</h3>
                <p className="text-sm text-gray-600 mt-1">{error || "This invoice could not be loaded."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const outstanding = Math.max(0, invoice.amountDue - invoice.amountPaid);
  const isPaid = outstanding === 0;
  const isPartPaid = invoice.amountPaid > 0 && outstanding > 0;
  const pupilFullName = formatPupilName(invoice.pupil.firstName, invoice.pupil.lastName);
  const className = invoice.pupil.class
    ? `${invoice.pupil.class.name}${invoice.pupil.class.arm ? ` ${invoice.pupil.class.arm}` : ""}`
    : "Unassigned";
  const termName = invoice.feeSchedule?.term?.name || "Unknown Term";
  const academicYear = invoice.feeSchedule?.term?.academicYear?.name || "";
  const currency = school?.currency || "NGN";
  const invoiceDate = new Date(invoice.createdAt);
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/admin/fees" className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition" style={{ color: BRAND_BLUE }}>
            <ChevronLeft size={16} />
            Back to Fees
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: LIGHT_BLUE, color: BRAND_BLUE }}
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: LIGHT_BLUE, color: BRAND_BLUE }}
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="rounded-xl bg-white p-8 print:p-6 print:bg-white">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                {school?.logoUrl ? (
                  <img src={school.logoUrl} alt="School logo" className="h-12 w-12 rounded-full border border-gray-300 object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-gray-700">
                    {school?.name?.charAt(0) || "S"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Invoice</p>
                  <h1 className="mt-1 text-3xl font-semibold text-gray-900">{school?.name || "School Name"}</h1>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                {school?.address && <p>{school.address}</p>}
                {school?.email && <p>{school.email}</p>}
                {school?.phone && <p>{school.phone}</p>}
              </div>
            </div>

            <div className="lg:text-right">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Invoice No.</div>
              <div className="mt-2 text-xl font-semibold text-gray-900">{invoice.invoiceNo}</div>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                {isPaid ? <Check size={14} /> : <AlertCircle size={14} />}
                {isPaid ? "Paid" : isPartPaid ? "Part Paid" : "Outstanding"}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="grid gap-8 pb-8 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Bill To</p>
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <p className="text-lg font-semibold text-gray-900">{pupilFullName}</p>
                  <p>{className}</p>
                  <p>{termName}</p>
                  {academicYear ? <p>{academicYear}</p> : null}
                </div>
              </div>

              <div className="md:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Invoice Details</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">{invoiceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <span className="text-gray-500">Due</span>
                    <span className="font-medium text-gray-900">{dueDate ? dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "On Demand"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium text-gray-900">{invoiceStatusLabel(invoice.status)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <span className="text-gray-500">Currency</span>
                    <span className="font-medium text-gray-900">{currency}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Description</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-4 text-sm text-gray-700">
                      {invoice.feeSchedule?.name || "School Fees"} for {termName}{academicYear ? ` • ${academicYear}` : ""}
                    </td>
                    <td className="py-4 text-right text-lg font-bold text-gray-900">{formatMoney(invoice.amountDue, currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatMoney(invoice.amountDue, currency)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
                  <span>Amount Paid</span>
                  <span className="font-medium text-gray-900">{formatMoney(invoice.amountPaid, currency)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-4 text-base font-bold text-gray-900">
                  <span>{outstanding > 0 ? "Outstanding Balance" : "Total Paid"}</span>
                  <span>{formatMoney(outstanding > 0 ? outstanding : invoice.amountPaid, currency)}</span>
                </div>
              </div>
            </div>

            {invoice.payments && invoice.payments.length > 0 && (
              <div className="mt-8 pt-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Payment History</h3>
                <div className="mt-4 space-y-3">
                  {invoice.payments.map((payment: any, idx: number) => (
                    <div key={payment.id || idx} className="flex flex-col gap-2 py-3 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{(payment.method || "Payment").replace(/_/g, " ")}</p>
                        <p className="text-xs text-gray-500">{new Date(payment.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        {payment.reference && <p className="text-xs text-gray-500">Ref: {payment.reference}</p>}
                      </div>
                      <p className="font-semibold text-gray-900">{formatMoney(payment.amount, currency)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Payment Instructions</h3>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                {school?.manualPaymentAccountName && <p><span className="font-medium text-gray-900">Account Name:</span> {school.manualPaymentAccountName}</p>}
                {school?.manualPaymentAccountNumber && <p><span className="font-medium text-gray-900">Account Number:</span> {school.manualPaymentAccountNumber}</p>}
                {school?.manualPaymentBankName && <p><span className="font-medium text-gray-900">Bank:</span> {school.manualPaymentBankName}</p>}
                {!school?.manualPaymentAccountName && !school?.manualPaymentAccountNumber && !school?.manualPaymentBankName && (
                  <p>Payments should be made through the school’s approved payment channel. Kindly keep a copy of the receipt for reference.</p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 text-center text-xs text-gray-500">
              <p>This invoice was generated by SchoolBase and should be retained for your records.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          
          .print\\:mt-6 {
            margin-top: 1.5rem !important;
          }
          
          .print\\:pt-4 {
            padding-top: 1rem !important;
          }
          
          .print\\:pt-6 {
            padding-top: 1.5rem !important;
          }
          
          .print\\:gap-4 {
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
