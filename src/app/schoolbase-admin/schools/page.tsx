import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPlatformAdminSession } from "@/lib/auth";
import { getPlatformSchools } from "@/lib/platform-admin";
import SchoolsViewSwitcher from "./schools-view-switcher";

export default async function PlatformAdminSchoolsPage() {
  const session = await getPlatformAdminSession();
  if (!session) {
    redirect("/schoolbase-admin/login");
  }

  const schools = await getPlatformSchools();
  const schoolRows = schools.map((school) => ({
    id: school.id,
    name: school.name,
    logoUrl: school.logoUrl,
    country: school.country,
    email: school.email,
    phone: school.phone,
    plan: school.plan,
    status: school.status,
    isVerified: (school as any).isVerified ?? false,
    trialEndsAt: school.trialEndsAt?.toISOString() ?? null,
    createdAt: school.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schools</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            View every registered school on SchoolBase, including logos, contact information, plan details, and admin assignments.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/schoolbase-admin"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to overview
          </Link>
        </div>
      </div>

      <SchoolsViewSwitcher initialSchools={schoolRows} />
    </div>
  );
}
