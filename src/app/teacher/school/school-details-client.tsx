"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

type TeacherSchoolDetailsProps = {
  school: any;
};

export function TeacherSchoolDetailsContent({ school }: TeacherSchoolDetailsProps) {
  const [effectiveCurrency, setEffectiveCurrency] = useState<string>(school?.currency || "NGN");

  useEffect(() => {
    let active = true;

    async function loadCurrency() {
      try {
        const countryRes = await fetch("/api/country/config");
        if (!countryRes.ok) {
          throw new Error("Country config request failed");
        }

        const countryConfig = await countryRes.json();
        if (active) {
          setEffectiveCurrency(countryConfig?.data?.currency || school?.currency || "NGN");
        }
      } catch (err) {
        console.error("[TeacherSchoolPage] Country config fetch error:", err);
        if (active) {
          setEffectiveCurrency(school?.currency || "NGN");
        }
      }
    }

    loadCurrency();
    return () => {
      active = false;
    };
  }, [school?.currency]);

  const paymentDetailsAvailable =
    Boolean(school.manualPaymentAccountName) ||
    Boolean(school.manualPaymentAccountNumber) ||
    Boolean(school.manualPaymentBankName);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">School details</h1>
          <p className="mt-1 text-sm text-muted">Key school information for your teaching work</p>
        </div>
        <Link
          href="/teacher"
          aria-label="Back to teacher dashboard"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand text-white shadow-sm transition hover:bg-brand-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <div className="p-4 space-y-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted overflow-hidden">
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
              <p className="mt-2 font-semibold">{effectiveCurrency}</p>
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
