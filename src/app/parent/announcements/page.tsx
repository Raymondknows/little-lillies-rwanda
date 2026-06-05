import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getParentSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Parent announcements | SchoolBase",
  description: "Read school announcements, news, and notices from your child's school.",
};

export default async function ParentAnnouncementsPage() {
  const session = await getParentSession();
  if (!session) redirect("/parent/login");

  const announcements = await prisma.announcement.findMany({
    where: { schoolId: session.schoolId, published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
        <p className="mt-1 text-muted">Latest published school announcements, circulars, and news for your child.</p>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">School announcements</p>
            <p className="mt-1 text-sm text-muted">{announcements.length} announcement{announcements.length === 1 ? '' : 's'} published.</p>
          </div>
          <Button href="/parent" variant="secondary" className="w-full sm:w-auto">
            Back to dashboard
          </Button>
        </div>

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-background p-6 text-sm text-muted">
              No announcements have been published yet.
            </div>
          ) : (
            announcements.map((announcement) => (
              <article key={announcement.id} className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
                  <p className="text-xs text-muted">
                    {announcement.publishedAt
                      ? new Date(announcement.publishedAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Draft'}
                  </p>
                </div>
                <p className="mt-4 text-sm text-muted whitespace-pre-line">{announcement.body}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
