import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";

export default async function WebsitePage() {
  const school = await getCurrentSchool();

  const announcements = await prisma.announcement.findMany({
    where: { schoolId: school.id },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Website</h1>
          <p className="mt-1 text-muted">
            News and announcements on your public school site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/admin/website/new">Post news</Button>
          <Button variant="secondary" href="/demo">
            View site
          </Button>
        </div>
      </div>

      <p className="mt-6 rounded-lg bg-brand-light px-4 py-3 text-sm text-brand">
        Post news once — it appears on your website and in the parent app.
      </p>

      <div className="mt-8 space-y-4">
        {announcements.map((a) => (
          <article
            key={a.id}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center gap-2">
              <Badge variant={a.published ? "success" : "default"}>
                {a.published ? "Published" : "Draft"}
              </Badge>
              {a.publishedAt && (
                <span className="text-xs text-muted">
                  {a.publishedAt.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            <h2 className="mt-2 font-semibold text-foreground">{a.title}</h2>
            <p className="mt-2 text-sm text-muted">{a.body}</p>
          </article>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted">
        Public URL:{" "}
        <Link href="/demo" className="text-brand hover:underline">
          /demo
        </Link>{" "}
        (subdomain per school in production)
      </p>
    </div>
  );
}
