import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { PaystackButton } from '@/components/admin/paystack-button'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import { formatMoney, invoiceStatusLabel, pupilName } from '@/lib/format'
import { getParentSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Parent payments | SchoolBase',
  description:
    'Manage school fees, view invoices, and track payment history from the parent portal.',
}

export default async function ParentPaymentsPage() {
  const session = await getParentSession()
  if (!session) redirect('/parent/login')

  const school = await prisma.school.findUnique({
    where: { id: session.schoolId },
  })

  const guardian = await prisma.guardian.findUnique({
    where: { id: session.guardianId },
    include: {
      pupils: {
        include: {
          pupil: {
            include: {
              class: true,
              invoices: {
                orderBy: { createdAt: 'desc' },
                include: {
                  payments: { orderBy: { paidAt: 'desc' } },
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
              },
            },
          },
        },
      },
    },
  })

  if (!guardian) redirect('/parent/login')

  const invoiceRows = guardian.pupils
    .flatMap(({ pupil }) =>
      pupil.invoices.map((invoice) => ({ pupil, invoice })),
    )
    .sort((a, b) => b.invoice.createdAt.getTime() - a.invoice.createdAt.getTime())

  const outstandingBalance = invoiceRows.reduce(
    (sum, { invoice }) => sum + Math.max(0, invoice.amountDue - invoice.amountPaid),
    0,
  )
  const dueInvoicesCount = invoiceRows.filter(({ invoice }) => invoice.amountDue - invoice.amountPaid > 0).length

  const recentPayments = invoiceRows
    .flatMap(({ pupil, invoice }) =>
      invoice.payments.map((payment) => ({ pupil, invoice, payment })),
    )
    .sort((a, b) => b.payment.paidAt.getTime() - a.payment.paidAt.getTime())

  const paymentStats: Array<{
    label: string
    value: string
    sub: string
    href: string
    iconName: 'creditcard' | 'graduationcap' | 'users' | 'layers'
  }> = [
    {
      label: 'Outstanding fees',
      value: formatMoney(outstandingBalance, school?.currency ?? 'NGN'),
      sub: `${dueInvoicesCount} invoices due`,
      href: '/parent/payments',
      iconName: 'creditcard',
    },
    {
      label: 'Children',
      value: String(guardian.pupils.length),
      sub: 'Linked students',
      href: '/parent/results',
      iconName: 'users',
    },
    {
      label: 'Recent payments',
      value: String(recentPayments.length),
      sub: 'Payment history items',
      href: '/parent/payments',
      iconName: 'layers',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Payments & invoices</h1>
        <p className="mt-1 text-muted">Review current school invoices, pay outstanding balances, and inspect recent payment activity.</p>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Current invoices</h2>
            <p className="text-sm text-muted">Pay or review invoices for your children in one table.</p>
          </div>
          <Button href="/parent/results" variant="secondary" className="w-full sm:w-auto">View results</Button>
        </div>

        {invoiceRows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-6 text-sm text-muted">
            No invoices are available yet. Your school will publish fee schedules and invoices here.
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-white">
              <table className="min-w-full text-xs">
                <thead className="border-b border-border bg-background text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Invoice</th>
                    <th className="px-3 py-2 text-right">Amount due</th>
                    <th className="px-3 py-2 text-right">Paid</th>
                    <th className="px-3 py-2 text-right">Balance</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceRows.map(({ pupil, invoice }) => {
                    const balance = invoice.amountDue - invoice.amountPaid
                    const guardianEmail = guardian.email ?? ''
                    const canPayOnline = Boolean(
                      guardianEmail && balance > 0 && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                    )
                    const classLabel = pupil.class
                      ? `${pupil.class.name}${pupil.class.arm ? ` ${pupil.class.arm}` : ''}`
                      : 'Unassigned'

                    return (
                      <tr key={invoice.id} className="border-b border-border hover:bg-background/70 transition-colors">
                        <td className="px-3 py-2">
                          <div className="font-medium text-foreground">{pupilName(pupil.firstName, pupil.lastName)}</div>
                          <div className="text-[11px] text-muted">{classLabel}</div>
                          {invoice.feeSchedule?.term?.name || invoice.feeSchedule?.term?.academicYear?.name ? (
                            <div className="text-[11px] text-muted">
                              {invoice.feeSchedule?.term?.name ? `Term ${invoice.feeSchedule.term.name}` : ''}
                              {invoice.feeSchedule?.term?.name && invoice.feeSchedule?.term?.academicYear?.name ? ' • ' : ''}
                              {invoice.feeSchedule?.term?.academicYear?.name ? `Session ${invoice.feeSchedule.term.academicYear.name}` : ''}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-muted">{invoice.invoiceNo}</td>
                        <td className="px-3 py-2 text-right text-foreground">{formatMoney(invoice.amountDue, school?.currency ?? 'NGN')}</td>
                        <td className="px-3 py-2 text-right text-foreground">{formatMoney(invoice.amountPaid, school?.currency ?? 'NGN')}</td>
                        <td className="px-3 py-2 text-right font-semibold text-foreground">{formatMoney(balance, school?.currency ?? 'NGN')}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="px-2 py-0.5 text-[10px]">{invoiceStatusLabel(invoice.status)}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link
                            href={`/parent/invoices/${invoice.id}`}
                            className="inline-flex rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-foreground hover:bg-slate-50"
                          >
                            Details
                          </Link>
                          {canPayOnline ? (
                            <PaystackButton
                              invoiceId={invoice.id}
                              amountMinor={balance}
                              currency={school?.currency ?? 'NGN'}
                              invoiceNo={invoice.invoiceNo}
                              email={guardianEmail}
                              name={`${guardian.firstName} ${guardian.lastName}`}
                            />
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent payments</h2>
          <p className="text-sm text-muted">Track your payment history across all children.</p>
        </div>

        {recentPayments.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-4 text-xs text-muted">
            No past payments have been recorded yet.
          </div>
        ) : (
          <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-white">
            <table className="min-w-full text-xs">
                <thead className="border-b border-border bg-background text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Invoice</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map(({ pupil, invoice, payment }) => (
                    <tr key={payment.id} className="border-b border-border hover:bg-background/70 transition-colors">
                      <td className="px-3 py-2">
                        <div className="font-medium text-foreground">{pupilName(pupil.firstName, pupil.lastName)}</div>
                        <div className="text-[11px] text-muted">{invoice.invoiceNo}</div>
                      </td>
                      <td className="px-3 py-2 text-muted">{invoice.invoiceNo}</td>
                      <td className="px-3 py-2 text-muted">{payment.method.replace('_', ' ')}</td>
                      <td className="px-3 py-2 text-right text-foreground">{formatMoney(payment.amount, school?.currency ?? 'NGN')}</td>
                      <td className="px-3 py-2 text-muted">{new Date(payment.paidAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</td>
                      <td className="px-3 py-2 text-muted">{payment.reference ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            <div className="sm:hidden space-y-3 p-4">
              {recentPayments.map(({ pupil, invoice, payment }) => (
                <div key={payment.id} className="rounded-3xl border border-border/70 bg-surface p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{pupilName(pupil.firstName, pupil.lastName)}</p>
                      <p className="text-xs text-muted truncate">{payment.method.replace('_', ' ')} • {invoice.invoiceNo}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatMoney(payment.amount, school?.currency ?? 'NGN')}</p>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-muted">
                    <div className="flex justify-between"><span>Date</span><span>{new Date(payment.paidAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</span></div>
                    <div className="flex justify-between"><span>Reference</span><span>{payment.reference ?? '—'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
