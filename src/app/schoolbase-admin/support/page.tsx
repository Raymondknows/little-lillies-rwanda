"use client";

import Link from "next/link";
import AdminPageShell from "@/components/admin-page-shell";
import SupportRequestsClient from "./support-requests-client";

export default function SupportPage() {
  return (
    <AdminPageShell
      title="Support Requests"
      subtitle="Track and resolve school support tickets from one place"
      actions={
        <>
          <Link href="/schoolbase-admin/email-center" className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface">
            Email center
          </Link>
          <button type="button" className="inline-flex items-center justify-center rounded-xl bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0952a4]">
            New ticket
          </button>
        </>
      }
    >
      <div className="px-3 py-3 sm:px-2">
        <SupportRequestsClient initialRequests={[]} />
      </div>
    </AdminPageShell>
  );
}
