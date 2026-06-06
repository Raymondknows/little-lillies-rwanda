import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPlatformAdminSession } from "@/lib/auth";
import { getPlatformSchoolById } from "@/lib/platform-admin";

function formatDate(date?: string | Date | null) {
  if (!date) return "—";
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getStatusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";
    case "TRIAL":
      return "bg-sky-100 text-sky-700";
    case "SUSPENDED":
      return "bg-amber-100 text-amber-800";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function SchoolDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getPlatformAdminSession();
  if (!session) {
    redirect("/schoolbase-admin/login");
  }

  const school = await getPlatformSchoolById(id);
  if (!school) {
    notFound();
  }

  const schoolAdmin = school.users[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{school.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Manage the school profile, logo, contact details, admin assignments, subscription, and onboarding status.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/schoolbase-admin/schools">Back to schools</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-brand/10 text-4xl font-bold text-brand shadow-sm">
              {school.logoUrl ? (
                <img
                  src={school.logoUrl}
                  alt={`${school.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{school.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(school.status)}`}>
                  {school.status}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {school.plan}
                </span>
              </div>
              <p className="text-sm leading-7 text-muted">{school.tagline || "No tagline available."}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Location</h2>
              <p className="mt-3 text-sm text-foreground">{school.address || "Address not provided"}</p>
              <p className="mt-2 text-sm text-muted">{[school.city, school.country].filter(Boolean).join(", ") || "—"}</p>
            </div>

            <div className="rounded-3xl border border-border bg-background p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Contact</h2>
              <p className="mt-3 text-sm text-foreground">{school.email || "No email"}</p>
              <p className="mt-2 text-sm text-foreground">{school.phone || "No phone"}</p>
              <p className="mt-2 text-sm text-muted">Website enabled: {school.websiteEnabled ? "Yes" : "No"}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">School principal</h2>
              <p className="mt-3 text-sm text-foreground">{school.principalName || "Not set"}</p>
              {school.principalComment ? <p className="mt-2 text-sm text-muted line-clamp-3">{school.principalComment}</p> : null}
            </div>
            <div className="rounded-3xl border border-border bg-background p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">School timeline</h2>
              <p className="mt-3 text-sm text-foreground">Created {formatDate(school.createdAt)}</p>
              <p className="mt-2 text-sm text-foreground">Trial ends {formatDate(school.trialEndsAt)}</p>
              <p className="mt-2 text-sm text-foreground">Subscription expires {formatDate(school.subscriptionExpiresAt)}</p>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">School admin</h2>
                <p className="mt-1 text-sm text-muted">Primary admin user for this school.</p>
              </div>
              {schoolAdmin ? (
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {schoolAdmin.role}
                </span>
              ) : null}
            </div>

            {schoolAdmin ? (
              <div className="mt-6 space-y-4 rounded-3xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{schoolAdmin.name}</p>
                <p className="text-sm text-muted">{schoolAdmin.email}</p>
                <p className="text-xs text-muted uppercase tracking-[0.18em]">Admin user</p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted">No school admin user has been assigned yet.</p>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">More details</h2>
            <dl className="mt-6 grid gap-4">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted">School slug</dt>
                <dd className="mt-2 text-sm text-foreground">{school.slug}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted">Onboarding status</dt>
                <dd className="mt-2 text-sm text-foreground">{school.onboardingStatus || "Pending"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted">Onboarding progress</dt>
                <dd className="mt-2 text-sm text-foreground">{school.onboardingProgress ?? 0}%</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
