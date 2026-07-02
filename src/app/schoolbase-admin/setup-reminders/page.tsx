"use client";

import Link from "next/link";
import AdminPageShell from "@/components/admin-page-shell";
import SetupRemindersClient from "./setup-reminders-client";

export default function SetupRemindersPage() {
  return (
    <AdminPageShell
      title="Setup Reminders"
      subtitle="Schools that haven't completed their setup process"
      actions={
        <>
          <Link href="/schoolbase-admin/email-center" className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface">
            Send reminder
          </Link>
          <Link href="/schoolbase-admin/schools?status=TRIAL" className="inline-flex items-center justify-center rounded-xl bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0952a4]">
            View trial schools
          </Link>
        </>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        <SetupRemindersClient initialSchools={[]} initialEmailLogs={[]} />
      </div>
    </AdminPageShell>
  );
}
