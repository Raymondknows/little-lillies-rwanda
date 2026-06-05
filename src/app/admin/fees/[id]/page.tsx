import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/admin/print-button";
import { prisma } from "@/lib/db";
import { formatMoney, invoiceStatusLabel, pupilName } from "@/lib/format";
import { getCurrentSchool } from "@/lib/school";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getCurrentSchool();

  let invoice;
  try {
    invoice = await prisma.invoice.findFirst({
      where: { id, schoolId: school.id },
      include: {
        pupil: {
          include: {
            class: true,
          },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
        feeSchedule: true,
      },
    });
  } catch (error) {
    console.error("Error fetching invoice detail:", error);
    throw new Error(
      error instanceof Error && error.message.includes("MASTER_KEY")
        ? "Encryption key not configured on server"
        : `Unable to load invoice: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!invoice) notFound();

  const balance = invoice.amountDue - invoice.amountPaid;

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-5 sm:py-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href="/admin/fees" className="text-sm font-medium text-brand hover:underline">
          ← Fees
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button href="/admin/fees" variant="secondary">
            Back to invoices
          </Button>
          <PrintButton label="Print invoice" />
        </div>
      </div>

      <article className="overflow-hidden rounded-[1.25rem] border border-brand/20 bg-white shadow-[0_14px_30px_rgba(10,102,194,0.08)] print:shadow-none print:border-black/10 print:bg-white">
        <div className="bg-brand/10 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-brand">Invoice</p>
              <h1 className="mt-2 text-2xl font-semibold text-brand">{school.name}</h1>
              {(school.address || school.city) && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                  {school.address ?? school.city}
                </p>
              )}
            </div>

            <div className="rounded-[1.25rem] border border-brand/20 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-brand/70">Invoice no.</p>
                <p className="mt-1 text-base font-semibold">{invoice.invoiceNo}</p>
              </div>
              <div className="mt-3">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-brand/70">Date</p>
                <p className="mt-1 text-sm font-semibold">{new Date(invoice.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>
              </div>
              <div className="mt-3">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-brand/70">Status</p>
                <span className="mt-2 inline-flex rounded-full bg-brand/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-brand">
                  {invoiceStatusLabel(invoice.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-brand/10 px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-3 md:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-[1.25rem] bg-brand/5 p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-brand/70">Bill to</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {pupilName(invoice.pupil.firstName, invoice.pupil.lastName)}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {invoice.pupil.class?.name}
                {invoice.pupil.class?.arm ? ` ${invoice.pupil.class.arm}` : ""}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-brand/5 p-5">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-brand/70">Fee schedule</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{invoice.feeSchedule?.name ?? "Term invoice"}</p>
              </div>
              <div className="mt-3">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-brand/70">Due date</p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "No due date"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="overflow-hidden rounded-[1.25rem] border border-brand/10">
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
                    <td className="px-4 py-3 align-top text-slate-900">{formatMoney(invoice.amountDue, school.currency)}</td>
                    <td className="px-4 py-3 align-top text-right font-semibold text-slate-900">{formatMoney(invoice.amountDue, school.currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-brand/5 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-2 lg:items-end lg:text-right">
                <div className="flex justify-between gap-3">
                  <span className="text-sm text-slate-700">Amount due</span>
                  <span className="text-sm font-semibold text-slate-900">{formatMoney(invoice.amountDue, school.currency)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-sm text-slate-700">Amount paid</span>
                  <span className="text-sm font-semibold text-slate-900">{formatMoney(invoice.amountPaid, school.currency)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-brand/10 pt-3">
                  <span className="text-sm font-semibold text-slate-900">Balance</span>
                  <span className="text-sm font-semibold text-brand">{formatMoney(balance, school.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-brand/10 bg-brand/5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Payment activity</h2>
              <p className="mt-1 text-sm text-slate-700">Recent payments for this invoice.</p>
            </div>
            <div className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-brand shadow-sm">
              {invoice.payments.length} payment{invoice.payments.length === 1 ? "" : "s"}
            </div>
          </div>

          {invoice.payments.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-brand/10 bg-white">
              <div className="divide-y divide-brand/10">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="px-4 py-3 sm:px-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{formatMoney(payment.amount, school.currency)}</p>
                        <p className="text-sm text-slate-700">{payment.method.replace("_", " ")}</p>
                      </div>
                      <p className="text-sm text-slate-700">
                        {new Date(payment.paidAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                      </p>
                    </div>
                    {(payment.reference || payment.note) && (
                      <div className="mt-2 rounded-2xl bg-brand/10 px-3 py-2 text-sm text-slate-700">
                        {payment.reference && <p>Ref: {payment.reference}</p>}
                        {payment.note && <p>Note: {payment.note}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[1.25rem] border border-dashed border-brand/30 bg-white px-5 py-5 text-center text-sm text-slate-600">
              No payments recorded for this invoice yet.
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
