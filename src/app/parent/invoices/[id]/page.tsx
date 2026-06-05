import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { PaystackButton } from '@/components/admin/paystack-button'
import { prisma } from '@/lib/db'
import { formatMoney, invoiceStatusLabel, pupilName } from '@/lib/format'
import { getParentSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Parent invoice | SchoolBase',
  description: 'View detailed fee invoice information and payment activity for your child.',
}

export default async function ParentInvoicePage({ params }: { params: { id: string } }) {
  const session = await getParentSession()
  if (!session) redirect('/parent/login')

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: params.id,
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
          school: {
            select: {
              currency: true,
              manualPaymentAccountName: true,
              manualPaymentAccountNumber: true,
              manualPaymentBankName: true,
            },
          },
        },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
      },
      feeSchedule: {
        include: {
          term: {
            include: {
              academicYear: true,
            },
          },
        },
      },
    },
  })

  if (!invoice) notFound()

  const balance = invoice.amountDue - invoice.amountPaid
  const guardian = await prisma.guardian.findUnique({
    where: { id: session.guardianId },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/parent/payments" className="text-sm font-medium text-brand hover:underline">
          ← Back to payments
        </Link>
        <div className="flex gap-2">
          <Button href="/parent/payments" variant="secondary">
            All invoices
          </Button>
          <Button href="#payment-activity" variant="outline">
            Payment activity
          </Button>
        </div>
      </div>

      <article className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Invoice</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">{invoice.invoiceNo}</h1>
            <p className="mt-2 text-sm text-muted">
              {pupilName(invoice.pupil.firstName, invoice.pupil.lastName)} — {invoice.pupil.class?.name}
              {invoice.pupil.class?.arm ? ` ${invoice.pupil.class.arm}` : ''}
            </p>
            {(invoice.feeSchedule?.term?.name || invoice.feeSchedule?.term?.academicYear?.name) ? (
              <p className="text-sm text-muted">
                {invoice.feeSchedule?.term?.name ? `Term ${invoice.feeSchedule.term.name}` : ''}
                {invoice.feeSchedule?.term?.name && invoice.feeSchedule?.term?.academicYear?.name ? ' • ' : ''}
                {invoice.feeSchedule?.term?.academicYear?.name ? `Session ${invoice.feeSchedule.term.academicYear.name}` : ''}
              </p>
            ) : null}
          </div>
          <div className="rounded-3xl border border-border bg-slate-50 p-4 text-sm">
            <p className="text-muted">Status</p>
            <p className="mt-2 font-semibold text-foreground">{invoiceStatusLabel(invoice.status)}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] pt-5">
          <div className="rounded-3xl border border-border bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-20 w-20 overflow-hidden rounded-3xl border border-border bg-background flex-shrink-0">
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
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Student</p>
                <p className="mt-2 text-xl font-semibold text-foreground truncate">{pupilName(invoice.pupil.firstName, invoice.pupil.lastName)}</p>
                <p className="mt-1 text-sm text-muted">{invoice.pupil.class?.name}{invoice.pupil.class?.arm ? ` ${invoice.pupil.class.arm}` : ''}</p>
                <p className="text-sm text-muted">Admission No. {invoice.pupil.admissionNo}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-white p-5">
            <div className="grid gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Invoice #</p>
                <p className="mt-2 font-semibold text-foreground">{invoice.invoiceNo}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Issue date</p>
                <p className="mt-2 font-semibold text-foreground">{new Date(invoice.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Status</p>
                <p className="mt-2 inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">{invoiceStatusLabel(invoice.status)}</p>
              </div>
              <div className="grid gap-2 rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>Amount due</span>
                  <span className="font-semibold text-foreground">{formatMoney(invoice.amountDue, invoice.pupil.school.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>Amount paid</span>
                  <span className="font-semibold text-foreground">{formatMoney(invoice.amountPaid, invoice.pupil.school.currency)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-foreground">
                  <span>Balance</span>
                  <span className="text-brand">{formatMoney(balance, invoice.pupil.school.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border bg-slate-50">
          <div className="border-b border-border px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Invoice details</p>
                <p className="mt-1 text-sm text-muted">Complete breakdown for this fee invoice.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {balance > 0 && guardian?.email ? (
                  <PaystackButton
                    invoiceId={invoice.id}
                    amountMinor={balance}
                    currency={invoice.pupil.school.currency}
                    invoiceNo={invoice.invoiceNo}
                    email={guardian.email}
                    name={`${guardian.firstName} ${guardian.lastName}`}
                  />
                ) : null}
              </div>

              {balance > 0 ? (
                <div className="mt-4 rounded-3xl border border-border bg-slate-50 p-4 text-sm text-slate-800">
                  {invoice.parentMarkedPaid ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">Payment acknowledgement sent.</p>
                      <p className="text-sm text-muted">
                        You told the school that this invoice has been paid. The school will verify and update the invoice status soon.
                      </p>
                      {invoice.parentMarkedPaidAt ? (
                        <p className="text-sm text-muted">Marked as paid on {new Date(invoice.parentMarkedPaidAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}.</p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="font-semibold text-foreground">Paid manually? Let the school know.</p>
                      <p className="text-sm text-muted">
                        If you have paid into the school account already, tap the button below to notify the school and speed up reconciliation.
                      </p>
                      <form action={`/api/parent/invoices/${invoice.id}/confirm-paid`} method="post">
                        <Button type="submit">Mark as paid</Button>
                      </form>
                      {invoice.pupil.school.manualPaymentAccountName || invoice.pupil.school.manualPaymentAccountNumber || invoice.pupil.school.manualPaymentBankName ? (
                        <div className="rounded-3xl border border-border bg-white p-4 text-sm">
                          <p className="text-sm font-semibold text-foreground">School payment account</p>
                          {invoice.pupil.school.manualPaymentAccountName ? (
                            <p className="mt-2 text-sm text-muted">Account name: {invoice.pupil.school.manualPaymentAccountName}</p>
                          ) : null}
                          {invoice.pupil.school.manualPaymentBankName ? (
                            <p className="text-sm text-muted">Bank: {invoice.pupil.school.manualPaymentBankName}</p>
                          ) : null}
                          {invoice.pupil.school.manualPaymentAccountNumber ? (
                            <p className="text-sm text-muted">Account number: {invoice.pupil.school.manualPaymentAccountNumber}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden bg-white">
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-foreground">{invoice.feeSchedule?.name ?? 'School fees'}</div>
                      <p className="mt-1 text-sm text-muted">Billed for the current term and class fees.</p>
                    </td>
                    <td className="px-4 py-4 text-foreground">1</td>
                    <td className="px-4 py-4 text-foreground">{formatMoney(invoice.amountDue, invoice.pupil.school.currency)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-foreground">{formatMoney(invoice.amountDue, invoice.pupil.school.currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="sm:hidden p-4 space-y-3">
              <div className="rounded-lg border border-border bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">{invoice.feeSchedule?.name ?? 'School fees'}</div>
                    <p className="mt-1 text-sm text-muted truncate">Billed for the current term and class fees.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">{formatMoney(invoice.amountDue, invoice.pupil.school.currency)}</div>
                    <div className="text-xs text-muted">Qty: 1</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-slate-50 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 lg:items-end lg:text-right">
                <div className="flex justify-between gap-3">
                  <span className="text-sm text-muted">Amount due</span>
                  <span className="text-sm font-semibold text-foreground">{formatMoney(invoice.amountDue, invoice.pupil.school.currency)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-sm text-muted">Amount paid</span>
                  <span className="text-sm font-semibold text-foreground">{formatMoney(invoice.amountPaid, invoice.pupil.school.currency)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-border pt-3">
                  <span className="text-sm font-semibold text-foreground">Balance</span>
                  <span className="text-sm font-semibold text-brand">{formatMoney(balance, invoice.pupil.school.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="payment-activity" className="mt-6 overflow-hidden rounded-[1.5rem] border border-border bg-white">
          <div className="border-b border-border px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Payment activity</p>
                <p className="mt-1 text-sm text-muted">Recent payments applied to this invoice.</p>
              </div>
              <div className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
                {invoice.payments.length} payment{invoice.payments.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {invoice.payments.length > 0 ? (
            <div>
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-muted">
                    <tr>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-semibold text-foreground">{formatMoney(payment.amount, invoice.pupil.school.currency)}</td>
                        <td className="px-4 py-4 text-muted">{payment.method.replace('_', ' ')}</td>
                        <td className="px-4 py-4 text-muted">{new Date(payment.paidAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</td>
                        <td className="px-4 py-4 text-muted">{payment.reference ?? '—'}</td>
                        <td className="px-4 py-4 text-muted">{payment.note ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden p-4 space-y-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="rounded-lg border border-border bg-white p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{formatMoney(payment.amount, invoice.pupil.school.currency)}</div>
                        <div className="text-xs text-muted mt-1">{payment.method.replace('_', ' ')}</div>
                      </div>
                      <div className="text-right text-xs text-muted">
                        <div>{new Date(payment.paidAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</div>
                        <div className="mt-1">{payment.reference ?? '—'}</div>
                      </div>
                    </div>
                    {payment.note ? <p className="mt-3 text-sm text-muted">{payment.note}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 text-sm text-muted">
              No payments have been recorded for this invoice yet.
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
