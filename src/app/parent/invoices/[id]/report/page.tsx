import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { PrintButton } from "@/components/admin/print-button";
import { prisma } from "@/lib/db";
import { formatMoney, invoiceStatusLabel, pupilName } from "@/lib/format";
import { getParentSession } from "@/lib/auth";
import { AppLogo } from "@/components/app-logo";

export const metadata: Metadata = {
  title: "Invoice Report | SchoolBase",
  description: "Professional invoice report with student details and payment information.",
};

export default async function ParentInvoiceReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getParentSession();
  if (!session) redirect("/parent/login");

  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      schoolId: session.schoolId,
      pupil: {
        guardians: {
          some: {
            guardianId: session.guardianId,
          },
        },
      },
    },
    include: {
      pupil: {
        include: {
          class: true,
          school: true,
        },
      },
      payments: {
        orderBy: { paidAt: "desc" },
      },
      feeSchedule: true,
    },
  });

  if (!invoice) notFound();

  const balance = invoice.amountDue - invoice.amountPaid;
  const school = invoice.pupil.school;

  return (
    <div className="min-h-screen bg-white p-6 sm:p-12 print:p-4">
      <div className="mx-auto w-full max-w-4xl print:w-[210mm] print:max-w-[210mm] print:min-h-[297mm] bg-white print:shadow-none print:border-none">
        <div className="flex items-start justify-between gap-6 mb-6 print:hidden">
          <div>
            <Link href={`/parent/invoices/${id}`} className="text-sm text-muted hover:underline">
              ← Back to invoice
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <PrintButton label="Print" />
            <PrintButton label="Download PDF" />
          </div>
        </div>

        {/* Top header */}
        <div className="mb-4 text-center" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
          <div className="flex justify-center">
            {school?.logoUrl ? (
              <img
                src={school.logoUrl}
                alt={`${school.name} logo`}
                className="h-24 object-contain"
              />
            ) : (
              <AppLogo href="" size="lg" showText={false} />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mt-4">{school?.name}</h1>
          {school?.address && (
            <p className="text-sm text-muted mt-2">{school.address}</p>
          )}
          <p className="text-xs text-muted mt-1">Generated {new Date().toLocaleDateString()}</p>
        </div>

        <div className="mb-8 border-t border-border pt-6" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Fee Invoice</p>
          </div>

          <div className="text-sm text-foreground">
            <div className="grid gap-4 grid-cols-[240px_minmax(200px,1fr)] items-start">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-28 w-28 rounded-md overflow-hidden border border-border bg-background flex-shrink-0">
                  {invoice.pupil.photoUrl ? (
                    <img
                      src={invoice.pupil.photoUrl}
                      alt={pupilName(invoice.pupil.firstName, invoice.pupil.lastName)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted text-xs">No photo</div>
                  )}
                </div>

                <div className="grid gap-3 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs uppercase tracking-[0.24em] text-muted">Student</span>
                    <span className="text-2xl font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                      {pupilName(invoice.pupil.firstName, invoice.pupil.lastName)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs uppercase tracking-[0.24em] text-muted">Class</span>
                    <span className="font-semibold text-foreground whitespace-nowrap">
                      {invoice.pupil.class?.name}
                      {invoice.pupil.class?.arm ? ` ${invoice.pupil.class.arm}` : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs uppercase tracking-[0.24em] text-muted">Admission No</span>
                    <span className="font-semibold text-foreground whitespace-nowrap">{invoice.pupil.admissionNo}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 justify-end text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-muted">Invoice No:</span>
                  <span className="font-semibold">{invoice.invoiceNo}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-muted">Date:</span>
                  <span className="font-semibold">
                    {new Date(invoice.createdAt).toLocaleDateString("en-NG", {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-muted">Status:</span>
                  <span className="inline-block bg-brand/10 text-brand px-3 py-1 rounded font-semibold text-xs">
                    {invoiceStatusLabel(invoice.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-[1.25rem] border border-border bg-slate-50">
          <div className="grid gap-3 md:grid-cols-2 p-5 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 border border-border">
              <span className="text-xs uppercase tracking-[0.24em] text-muted">Fee schedule</span>
              <span className="font-semibold text-foreground">{invoice.feeSchedule?.name ?? "School fees"}</span>
            </div>
            <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 border border-border">
              <span className="text-xs uppercase tracking-[0.24em] text-muted">Due date</span>
              <span className="font-semibold text-foreground">
                {invoice.dueDate
                  ? new Date(invoice.dueDate).toLocaleDateString("en-NG", { dateStyle: "medium" })
                  : "No due date"}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.25rem] border border-brand/10 mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-brand/5 text-brand">
                <tr>
                  <th className="px-4 py-2 font-semibold">Description</th>
                  <th className="px-4 py-2 font-semibold">Qty</th>
                  <th className="px-4 py-2 font-semibold">Unit price</th>
                  <th className="px-4 py-2 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/10 bg-white">
                <tr>
                  <td className="px-4 py-3 align-top text-slate-900">
                    {invoice.feeSchedule?.name ?? "School fees"}
                    <p className="mt-2 text-sm text-slate-600">Billed for the current term and class fees.</p>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-900">1</td>
                  <td className="px-4 py-3 align-top text-slate-900">{formatMoney(invoice.amountDue, school?.currency ?? "NGN")}</td>
                  <td className="px-4 py-3 align-top text-right font-semibold text-slate-900">{formatMoney(invoice.amountDue, school?.currency ?? "NGN")}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-brand/5 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-2 lg:items-end lg:text-right">
              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-700">Amount due</span>
                <span className="text-sm font-semibold text-slate-900">{formatMoney(invoice.amountDue, school?.currency ?? "NGN")}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-700">Amount paid</span>
                <span className="text-sm font-semibold text-slate-900">{formatMoney(invoice.amountPaid, school?.currency ?? "NGN")}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-brand/10 pt-3">
                <span className="text-sm font-semibold text-slate-900">Balance</span>
                <span className="text-sm font-semibold text-brand">{formatMoney(balance, school?.currency ?? "NGN")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.25rem] border border-brand/10 bg-brand/5">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Payment activity</h3>
                <p className="mt-1 text-sm text-slate-700">Recent payments recorded for this invoice.</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-brand shadow-sm">
                {invoice.payments.length} payment{invoice.payments.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {invoice.payments.length > 0 ? (
            <div className="overflow-x-auto bg-white px-4 py-4 sm:px-5">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-slate-900">{formatMoney(payment.amount, school?.currency ?? "NGN")}</td>
                      <td className="px-4 py-4 text-slate-700">{payment.method.replace("_", " ")}</td>
                      <td className="px-4 py-4 text-slate-700">{new Date(payment.paidAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</td>
                      <td className="px-4 py-4 text-slate-700">{payment.reference ?? '—'}</td>
                      <td className="px-4 py-4 text-slate-700">{payment.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5 text-sm text-slate-600">
              No payments recorded for this invoice yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-xs text-muted">
          <p>Official Fee Invoice</p>
          <p className="mt-2">Page 1 of 1</p>
        </div>
      </div>
    </div>
  );
}
