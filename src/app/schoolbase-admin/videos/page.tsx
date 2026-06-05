import { redirect } from "next/navigation";
import { getPlatformAdminSession } from "@/lib/auth";
import { getVideos } from "@/lib/video-tutorials";
import VideosClient from "./videos-client";

function formatDate(date?: string | Date | null) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function VideosPage() {
  const session = await getPlatformAdminSession();
  if (!session) {
    redirect("/schoolbase-admin/login");
  }

  const videos = await getVideos();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Video Library</h1>
        <p className="text-muted mt-2 max-w-2xl text-sm sm:text-base">
          Manage SchoolBase tutorial videos. Create shareable links to use in sales outreach and Help & Guide sections.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 w-full">
          <div className="rounded-lg border border-border bg-surface p-4 sm:p-6 w-full">
            <VideosClient initialVideos={videos} />
          </div>
        </div>

        <aside className="w-full space-y-4">
          <div className="rounded-3xl border border-border bg-surface p-4 sm:p-6 shadow-sm w-full">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Existing tutorials</h2>
            <p className="text-xs sm:text-sm text-muted mt-1">Quick view of published videos.</p>

            <div className="mt-4 space-y-3">
              {videos.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted">No videos yet.</p>
              ) : (
                videos.map((v: any) => (
                  <div key={v.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{v.title}</h3>
                        {v.featured && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 whitespace-nowrap">Featured</span>
                        )}
                      </div>
                      <div className="text-xs text-muted mt-1">{v.category} • {formatDate(v.createdAt)}</div>
                    </div>
                    <div className="text-xs text-muted truncate">#{v.id.slice(0,6)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-4 sm:p-6 shadow-sm w-full">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Tips</h2>
            <p className="text-xs sm:text-sm text-muted mt-2">Use Loom/YouTube links in the Video URL field. Copy the share link to paste into Help & Guide pages.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
