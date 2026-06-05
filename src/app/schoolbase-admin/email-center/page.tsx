import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getEmailLogs, getPlatformSchools } from "@/lib/platform-admin";
import { requirePlatformAdminSession } from "@/lib/auth";
import EmailCenterClient from "./email-center-client";

export const metadata = {
  title: "Email Center - SchoolBase Admin",
};

export default async function EmailCenterPage() {
  await requirePlatformAdminSession();

  const schools = await getPlatformSchools();
  let emailLogs: any[] = [];
  try {
    emailLogs = await getEmailLogs({ limit: 50 });
  } catch (err) {
    console.error("Failed to load email logs:", err);
    emailLogs = [];
  }

  const transformedSchools = schools.map((school) => ({
    id: school.id,
    name: school.name,
    email: school.email || undefined,
    createdAt: school.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Center</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Send platform communication emails to schools, announce product updates, support case alerts, onboarding guidance, and custom operations messages.
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

      <EmailCenterClient
        initialSchools={transformedSchools}
        initialEmailLogs={emailLogs}
      />
    </div>
  );
}
