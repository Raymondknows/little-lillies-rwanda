import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, MapPin, Phone, ShieldCheck, CalendarDays, BadgeInfo } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import { resolveSchoolAssetUrl } from "@/lib/asset-urls";

type SchoolDetail = {
  id: string;
  name: string;
  logoUrl: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  tagline: string | null;
  address: string | null;
  plan: string;
  status: string;
  isVerified?: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  principalName?: string | null;
  principalComment?: string | null;
  stampUrl?: string | null;
  principalSignatureUrl?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "n/a";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "n/a"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default async function Page({ params }: { params?: Record<string, string> }) {
  const resolvedParams = await Promise.resolve(params);
  const schoolId = resolvedParams?.id;
  if (!schoolId) {
    notFound();
  }

  const cookieHeader = (await headers()).get("cookie") || "";
  const response = await fetch(`http://localhost:3000/schoolbase-admin/api/schools/${schoolId}`, {
    headers: {
      Cookie: cookieHeader,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const school = await response.json();
  if (!school?.id) {
    notFound();
  }

  let logoUrl = resolveSchoolAssetUrl(school.logoUrl);

  // If the stored value maps to the session-protected admin route, prefer the public school-logo route with id
  if (logoUrl === "/api/admin/school-logo") {
    logoUrl = `/api/school-logo/${encodeURIComponent(school.id)}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted">School profile</p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">{school.name}</h1>
          <p className="mt-1 text-sm text-muted">Platform admin view for school details, branding, and contact information.</p>
        </div>
        <Link
          href="/schoolbase-admin/schools"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-brand hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to schools
        </Link>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-brand/10 text-2xl font-semibold text-brand shadow-sm">
              {logoUrl ? (
                <img src={logoUrl} alt={`${school.name} logo`} className="h-full w-full object-cover" />
              ) : (
                <span>{getInitials(school.name)}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-semibold text-foreground">{school.name}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{school.plan}</span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  {school.isVerified ? "✓ Verified" : "Unverified"}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{school.status}</span>
              </div>
              {school.tagline ? <p className="mt-2 text-sm text-muted">{school.tagline}</p> : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Trial ends</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{formatDate(school.trialEndsAt)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Registered</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{formatDate(school.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted">
              <Mail className="h-4 w-4" /> Email
            </div>
            <p className="mt-2 break-words text-sm font-medium text-foreground">{school.email || "Not set"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted">
              <Phone className="h-4 w-4" /> Phone
            </div>
            <p className="mt-2 break-words text-sm font-medium text-foreground">{school.phone || "Not set"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted">
              <MapPin className="h-4 w-4" /> Location
            </div>
            <p className="mt-2 break-words text-sm font-medium text-foreground">
              {[school.address, school.country].filter(Boolean).join(" • ") || "Not set"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted">
              <ShieldCheck className="h-4 w-4" /> Verification
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{school.isVerified ? "Verified school" : "Not verified"}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 className="h-4 w-4 text-brand" /> School profile
            </div>
            <div className="mt-4 space-y-3 text-sm text-foreground">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Principal</p>
                <p className="mt-1">{school.principalName || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Principal comment</p>
                <p className="mt-1 text-muted">{school.principalComment || "Not set"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BadgeInfo className="h-4 w-4 text-brand" /> Branding assets
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Stamp</p>
                <p className="mt-2 text-sm text-foreground">{school.stampUrl ? "Available" : "Not set"}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Signature</p>
                <p className="mt-2 text-sm text-foreground">{school.principalSignatureUrl ? "Available" : "Not set"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-background p-5 text-sm text-muted">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays className="h-4 w-4 text-brand" /> Notes
          </div>
          <p className="mt-2">This page is now connected to live school data instead of a stub, so card clicks open a usable admin profile.</p>
        </div>
      </div>
    </div>
  );
}
