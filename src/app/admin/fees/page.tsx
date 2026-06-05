import { issueTermInvoicesAction, sendFeeRemindersAction, recordPayment } from "@/app/admin/actions";
import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import FeesPageClient from "./fees-client";

export default async function FeesPage() {
  const school = await getCurrentSchool();

  const currentAcademicYear = await prisma.academicYear.findFirst({
    where: { schoolId: school.id, isCurrent: true },
    orderBy: { createdAt: "desc" },
  });

  const terms = currentAcademicYear
    ? await prisma.term.findMany({
        where: { academicYearId: currentAcademicYear.id },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  const invoices = await prisma.invoice.findMany({
    where: { schoolId: school.id },
    include: {
      pupil: {
        include: {
          class: true,
          guardians: { include: { guardian: true } },
        },
      },
      payments: { orderBy: { paidAt: "desc" }, take: 1 },
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
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  const outstanding = invoices.reduce(
    (s, i) => s + Math.max(0, i.amountDue - i.amountPaid),
    0,
  );

  // Map invoices to match client type expectations
  const mappedInvoices = invoices.map((inv) => ({
    ...inv,
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    academicYear: inv.feeSchedule?.term?.academicYear
      ? {
          id: inv.feeSchedule.term.academicYear.id,
          name: inv.feeSchedule.term.academicYear.name,
          isCurrent: inv.feeSchedule.term.academicYear.isCurrent,
        }
      : null,
  }));

  return (
    <FeesPageClient 
      invoices={mappedInvoices as any}
      outstanding={outstanding}
      currency={school.currency}
      terms={terms}
      issueTermInvoicesAction={issueTermInvoicesAction}
      sendFeeRemindersAction={sendFeeRemindersAction}
      recordPaymentAction={recordPayment as any}
    />
  );
}
