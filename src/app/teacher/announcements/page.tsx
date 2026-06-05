import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { getStaffSession } from "@/lib/auth";
import { Bell, ArrowLeft } from "lucide-react";

export default async function TeacherAnnouncementsPage() {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const schoolId = await getCurrentSchoolId();
  const announcements = await prisma.announcement.findMany({
    where: { schoolId, published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Announcements</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            School announcements, deadlines, and staff notices for your day.
          </p>
        </div>
        <Link
          href="/teacher"
          aria-label="Back to teacher dashboard"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand text-white shadow-sm transition hover:bg-brand-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 text-sm text-muted">
          <Bell className="h-5 w-5 text-brand" />
          <span>Published announcements for your school.</span>
        </div>

        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <article key={announcement.id} className="rounded-3xl border border-border bg-background p-5">
                <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
                <p className="mt-2 text-sm text-muted">{announcement.body}</p>
                <p className="mt-3 text-xs text-muted">
                  {announcement.publishedAt?.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted">No announcements published yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
