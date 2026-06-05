import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getParentSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "School details | SchoolBase",
  description: "View your school’s contact information, payment account details, and logo in the parent portal.",
};

export default async function ParentSchoolDetailsPage() {
  const session = await getParentSession();

  if (!session) redirect("/parent/login");

  const school = await prisma.school.findUnique({
    where: { id: session.schoolId },
    select: {
      name: true,
      tagline: true,
      initials: true,
      address: true,
      city: true,
      country: true,
      phone: true,
      email: true,
      currency: true,
      timezone: true,
      websiteEnabled: true,
      logoUrl: true,
      manualPaymentAccountName: true,
      manualPaymentAccountNumber: true,
      manualPaymentBankName: true,
      primaryColor: true,
    },
  });

  if (!school) redirect("/parent/login");

  const paymentDetailsAvailable =
    Boolean(school.manualPaymentAccountName) ||
    Boolean(school.manualPaymentAccountNumber) ||
    Boolean(school.manualPaymentBankName);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">School details</h1>
          <p className="mt-1 text-sm text-muted">Key school information for your child, presented in a clean mobile-first layout.</p>
        </div>
        <Button href="/parent" variant="secondary" className="w-full sm:w-auto">
          Back to dashboard
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        <div className="p-4 space-y-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 overflow-hidden">
                {school.logoUrl ? (
                  <img
                    src={school.logoUrl}
                    alt={`${school.name} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted">No logo</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.28em] text-muted">School</p>
                <p className="mt-1 text-lg font-semibold text-foreground truncate">{school.name}</p>
                {school.tagline ? <p className="mt-1 text-sm text-muted truncate">{school.tagline}</p> : null}
              </div>
            </div>

            {school.initials ? (
              <div className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase text-foreground">
                {school.initials}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Contact</p>
              <div className="mt-2 space-y-2 text-sm text-foreground">
                <div>Phone: {school.phone || "Not set"}</div>
                <div>Email: {school.email || "Not set"}</div>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Location</p>
              <div className="mt-2 space-y-2 text-sm text-foreground">
                <div>Address: {school.address || "Not set"}</div>
                <div>City / Country: {[school.city, school.country].filter(Boolean).join(" • ") || "Not set"}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">School account</p>
            {paymentDetailsAvailable ? (
              <div className="mt-3 space-y-2 text-sm text-foreground">
                {school.manualPaymentAccountName ? <div>Account name: {school.manualPaymentAccountName}</div> : null}
                {school.manualPaymentAccountNumber ? <div>Account number: {school.manualPaymentAccountNumber}</div> : null}
                {school.manualPaymentBankName ? <div>Bank: {school.manualPaymentBankName}</div> : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">Account details have not been published yet.</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 border-t border-border pt-4 text-sm text-foreground">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Currency</p>
              <p className="mt-2 font-semibold">{school.currency}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Timezone</p>
              <p className="mt-2 font-semibold">{school.timezone}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4 text-sm text-muted">
            Website status: {school.websiteEnabled ? "Enabled" : "Disabled"}
          </div>
        </div>
      </div>

      <div className="text-sm text-muted">
        <p>Note: If any of these details look incorrect, please contact your school administrator to update the school profile.</p>
      </div>
    </div>
  );
}
