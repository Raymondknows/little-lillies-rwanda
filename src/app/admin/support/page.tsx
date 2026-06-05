import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import { redirect } from "next/navigation";
import SupportClient from "./support-client";
import Link from "next/link";

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminSupportPage() {
  const school = await getCurrentSchool().catch(() => null);
  if (!school) {
    redirect("/admin");
  }

  const supportRequests = (await prisma.supportRequest.findMany({
    where: { schoolId: school.id },
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } } as any,
  })) as any;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support requests</h1>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Send a ticket to SchoolBase support and review your school’s requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      <SupportClient
        initialRequests={supportRequests.map((request: any) => ({
          id: request.id,
          subject: request.subject,
          message: request.message,
          response: request.response,
          status: request.status,
          priority: request.priority,
          createdAt: request.createdAt.toISOString(),
          updatedAt: request.updatedAt.toISOString(),
          messages: request.messages.map((message: any) => ({
            id: message.id,
            senderRole: message.senderRole,
            senderName: message.senderName,
            senderEmail: message.senderEmail,
            body: message.body,
            createdAt: message.createdAt.toISOString(),
          })),
          school: {
            id: request.schoolId,
            name: school.name,
            country: school.country,
          },
        }))}
      />
    </div>
  );
}
