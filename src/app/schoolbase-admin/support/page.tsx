import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlatformAdminSession } from "@/lib/auth";
import { getPlatformSupportRequests } from "@/lib/platform-admin";
import SupportRequestsClient from "./support-requests-client";

export default async function PlatformAdminSupportPage() {
  const session = await getPlatformAdminSession();
  if (!session) {
    redirect("/schoolbase-admin/login");
  }

  const supportRequests = await getPlatformSupportRequests();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support requests</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Track open tickets and school support requests across the platform. Select any ticket to send a reply and update its status.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/schoolbase-admin"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            Back to overview
          </Link>
        </div>
      </div>

      <SupportRequestsClient initialRequests={supportRequests} />
    </div>
  );
}
