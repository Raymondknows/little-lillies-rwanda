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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
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

        {/* Invoice Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
          {/* Header Section with Brand Color */}
          <div className="p-8 print:p-0" style={{ backgroundColor: BRAND_BLUE }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Invoice</h1>
                <p className="text-blue-100 mt-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>{invoice.invoiceNo}</p>
              </div>
              <div className="text-right">
                {school?.logoUrl && (
                  <img src={school.logoUrl} alt="School Logo" className="h-12 mb-3 opacity-90" />
                )}
                <p className="text-white text-sm font-medium">{school?.name || "School"}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 print:p-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-8 mb-8 print:gap-4 print:mb-6">
              {/* Left Column - Dates */}
              <div>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MID_GRAY }}>Invoice Date</p>
                    <p className="text-base font-semibold mt-1" style={{ color: DARK_GRAY }}>{invoiceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MID_GRAY }}>Due Date</p>
                    <p className="text-base font-semibold mt-1" style={{ color: DARK_GRAY }}>{dueDate ? dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "On Demand"}</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Status & Invoice ID */}
              <div className="text-right">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MID_GRAY }}>Status</p>
                    <div className="mt-2 inline-flex">
                      {isPaid ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${BRAND_BLUE}15`, color: BRAND_BLUE }}>
                          <Check size={14} />
                          <span className="text-xs font-semibold">Paid</span>
                        </div>
                      ) : isPartPaid ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                          <AlertCircle size={14} />
                          <span className="text-xs font-semibold">Part Paid</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: "#FCE7F3", color: "#831843" }}>
                          <AlertCircle size={14} />
                          <span className="text-xs font-semibold">Outstanding</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MID_GRAY }}>Invoice ID</p>
                    <p className="text-sm font-mono mt-1" style={{ color: DARK_GRAY }}>{invoice.invoiceNo}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${BORDER_GRAY}`, margin: "2rem 0" }}></div>

            {/* Bill To Section */}
            <div className="grid grid-cols-2 gap-8 mb-8 print:gap-4 print:mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MID_GRAY }}>Bill To</p>
                <div className="mt-3 space-y-1">
                  <p className="text-base font-semibold" style={{ color: DARK_GRAY }}>{pupilFullName}</p>
                  <p className="text-sm" style={{ color: MID_GRAY }}>{className}</p>
                  <p className="text-sm" style={{ color: MID_GRAY }}>{termName}, {academicYear}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MID_GRAY }}>School Details</p>
                <div className="mt-3 space-y-1">
                  <p className="text-sm" style={{ color: MID_GRAY }}>{school?.address}</p>
                  {school?.email && <p className="text-sm" style={{ color: MID_GRAY }}>{school.email}</p>}
                  {school?.phone && <p className="text-sm" style={{ color: MID_GRAY }}>{school.phone}</p>}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${BORDER_GRAY}`, margin: "2rem 0" }}></div>

            {/* Line Items Table */}
            <table className="w-full mb-8 print:mb-6">
              <thead>
                <tr style={{ borderBottom: `2px solid ${BRAND_BLUE}` }}>
                  <th className="text-left py-3 px-0 text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND_BLUE }}>Description</th>
                  <th className="text-right py-3 px-0 text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND_BLUE }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${BORDER_GRAY}` }}>
                  <td className="py-4 px-0 text-sm" style={{ color: DARK_GRAY }}>{invoice.feeSchedule?.name || "School Fees"}</td>
                  <td className="text-right py-4 px-0 text-sm font-semibold" style={{ color: DARK_GRAY }}>{formatMoney(invoice.amountDue, currency)}</td>
                </tr>
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="space-y-3 mb-8 print:mb-6">
              <div className="flex justify-between items-center py-3 px-4 rounded-lg" style={{ backgroundColor: LIGHT_GRAY }}>
                <p className="text-sm" style={{ color: MID_GRAY }}>Subtotal</p>
                <p className="text-sm font-semibold" style={{ color: DARK_GRAY }}>{formatMoney(invoice.amountDue, currency)}</p>
              </div>
              <div className="flex justify-between items-center py-3 px-4 rounded-lg" style={{ backgroundColor: LIGHT_GRAY }}>
                <p className="text-sm" style={{ color: MID_GRAY }}>Amount Paid</p>
                <p className="text-sm font-semibold" style={{ color: BRAND_BLUE }}>{formatMoney(invoice.amountPaid, currency)}</p>
              </div>
              {outstanding > 0 && (
                <div className="flex justify-between items-center py-4 px-4 rounded-lg text-white font-semibold" style={{ backgroundColor: BRAND_BLUE }}>
                  <p className="text-sm">Outstanding Balance</p>
                  <p className="text-lg">{formatMoney(outstanding, currency)}</p>
                </div>
              )}
              {isPaid && (
                <div className="flex justify-between items-center py-4 px-4 rounded-lg text-white font-semibold" style={{ backgroundColor: `${BRAND_BLUE}` }}>
                  <p className="text-sm">Total Paid</p>
                  <p className="text-lg">{formatMoney(invoice.amountPaid, currency)}</p>
                </div>
              )}
            </div>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="mt-8 pt-8 print:mt-6 print:pt-6" style={{ borderTop: `1px solid ${BORDER_GRAY}` }}>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: DARK_GRAY }}>Payment History</h3>
                <div className="space-y-2">
                  {invoice.payments.map((payment: any, idx: number) => (
                    <div key={payment.id || idx} className="flex justify-between items-start py-3 px-4 rounded-lg" style={{ backgroundColor: LIGHT_GRAY }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: DARK_GRAY }}>{payment.method.replace(/_/g, " ")}</p>
                        <p className="text-xs mt-1" style={{ color: MID_GRAY }}>{new Date(payment.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        {payment.reference && <p className="text-xs" style={{ color: MID_GRAY }}>Ref: {payment.reference}</p>}
                      </div>
                      <p className="text-sm font-semibold" style={{ color: BRAND_BLUE }}>{formatMoney(payment.amount, currency)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Instructions */}
            {outstanding > 0 && school && (school.manualPaymentAccountName || school.manualPaymentAccountNumber) && (
              <div className="mt-8 p-6 rounded-lg print:mt-6" style={{ backgroundColor: LIGHT_BLUE, borderLeft: `4px solid ${BRAND_BLUE}` }}>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: BRAND_BLUE }}>Payment Instructions</h3>
                <div className="space-y-2 text-sm">
                  {school.manualPaymentAccountName && (
                    <p><span style={{ color: MID_GRAY }}>Account Name:</span> <span className="font-medium" style={{ color: DARK_GRAY }}>{school.manualPaymentAccountName}</span></p>
                  )}
                  {school.manualPaymentAccountNumber && (
                    <p><span style={{ color: MID_GRAY }}>Account Number:</span> <span className="font-medium" style={{ color: DARK_GRAY }}>{school.manualPaymentAccountNumber}</span></p>
                  )}
                  {school.manualPaymentBankName && (
                    <p><span style={{ color: MID_GRAY }}>Bank:</span> <span className="font-medium" style={{ color: DARK_GRAY }}>{school.manualPaymentBankName}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 print:mt-6 print:pt-4 text-center" style={{ borderTop: `1px solid ${BORDER_GRAY}` }}>
              <p className="text-xs" style={{ color: MID_GRAY }}>This invoice was generated by SchoolBase. Please retain for your records.</p>
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
