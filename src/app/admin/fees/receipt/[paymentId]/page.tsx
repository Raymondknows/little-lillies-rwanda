import Link from "next/link";
import { notFound } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { PrintButton } from "@/components/admin/print-button";
import { prisma } from "@/lib/db";
import { formatMoney, pupilName } from "@/lib/format";
import { getCurrentSchool } from "@/lib/school";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const school = await getCurrentSchool();

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, invoice: { schoolId: school.id } },
    include: {
      invoice: {
        include: { pupil: { include: { class: true } } },
      },
    },
  });

  if (!payment) notFound();

  const inv = payment.invoice;
  if (!inv) notFound();
  const balance = inv.amountDue - inv.amountPaid;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/fees" className="text-sm text-brand hover:underline">
          ← Fees
        </Link>
        <div className="flex flex-wrap gap-3">
          <PrintButton />
          <PrintButton label="Print / save as PDF" />
          <Link
            href={`/admin/fees/receipt/${payment.id}/download`}
            className="rounded-md bg-brand px-3 py-2 text-sm text-white"
          >
            Download PDF
          </Link>
        </div>
      </div>

      <article className="rounded-xl border border-border bg-surface p-8 shadow-sm print:shadow-none">
        <div className="flex justify-center">
          <AppLogo href="/" size="md" showText />
        </div>
        <p className="mt-6 text-center text-sm text-muted">Official fee receipt</p>
        <h1 className="mt-2 text-center text-xl font-bold">{school.name}</h1>
        <p className="text-center text-sm text-muted">{school.address ?? school.city}</p>

        <dl className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Receipt no.</dt>
            <dd className="font-medium">{payment.id.slice(-8).toUpperCase()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Invoice</dt>
            <dd>{inv.invoiceNo}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Student</dt>
            <dd>
              {pupilName(inv.pupil.firstName, inv.pupil.lastName)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Class</dt>
            <dd>
              {inv.pupil.class?.name}
              {inv.pupil.class?.arm ? ` ${inv.pupil.class.arm}` : ""}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <dt className="text-muted">Amount paid</dt>
            <dd className="text-lg font-bold text-success">
              {formatMoney(payment.amount, school.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Balance remaining</dt>
            <dd className="font-medium">
              {formatMoney(balance, school.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Method</dt>
            <dd>{payment.method.replace("_", " ")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Date</dt>
            <dd>
              {payment.paidAt.toLocaleDateString("en-NG", {
                dateStyle: "medium",
              })}
            </dd>
          </div>
        </dl>

        <p className="mt-8 text-center text-xs text-muted">
          Thank you for your payment.
        </p>
      </article>

    </div>
  );
}
