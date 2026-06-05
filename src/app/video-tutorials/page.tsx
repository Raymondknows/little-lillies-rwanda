import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { Metadata } from "next";
import { getVideos } from "@/lib/video-tutorials";

export const metadata: Metadata = {
  title:
    "SchoolBase Video Tutorials | School Management Training, Fee & Result Workflows",
  description:
    "Explore SchoolBase video tutorials for admissions, fee collection, results publishing, parent communication, attendance tracking, and school software onboarding.",
  keywords: [
    "SchoolBase video tutorials",
    "school software training",
    "school management videos",
    "fee collection tutorial",
    "student results tutorial",
    "parent communication video",
    "school admin training",
    "attendance tracking guide",
    "education software video",
  ],
  openGraph: {
    title:
      "SchoolBase Video Tutorials | Learn School Management with Practical Videos",
    description:
      "Explore SchoolBase video tutorials for admissions, fee collection, results publishing, parent communication, and school operations training.",
    url: "https://schoolbase.live/video-tutorials",
    siteName: "SchoolBase",
    images: [
      {
        url: "https://schoolbase.live/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SchoolBase Video Tutorials",
    description:
      "Watch SchoolBase video tutorials covering school admissions, fees, results, parent communication, and school admin workflows.",
    images: ["https://schoolbase.live/og-image.png"],
  },
};

function getVideoThumbnail(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname;

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      const videoId = getYoutubeId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    }

    if (hostname.includes("vimeo.com")) {
      const videoId = pathname.split("/").filter(Boolean).pop() ?? "";
      return videoId ? `https://vumbnail.com/${videoId}.jpg` : null;
    }

    if (hostname.includes("loom.com")) {
      const rawId = pathname.includes("/share/")
        ? pathname.split("/share/").pop()?.split("?")[0]
        : pathname.includes("/embed/")
        ? pathname.split("/embed/").pop()?.split("?")[0]
        : pathname.split("/").filter(Boolean).pop();
      const videoId = rawId?.split("?")[0].split("/")[0] ?? "";
      return videoId ? `https://cdn.loom.com/sessions/${videoId}/thumbnail.jpg` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function getYoutubeId(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes("youtu.be")) {
      return parsedUrl.pathname.slice(1).split(/[?&#]/)[0];
    }

    const params = parsedUrl.searchParams;
    if (params.get("v")) {
      return params.get("v") ?? "";
    }

    const pathname = parsedUrl.pathname;
    const match = pathname.match(/(?:embed\/|v\/|shorts\/)([A-Za-z0-9_-]{11})/);
    if (match) {
      return match[1];
    }

    const fallbackMatch = pathname.match(/([A-Za-z0-9_-]{11})/);
    return fallbackMatch ? fallbackMatch[1] : "";
  } catch {
    return "";
  }
}

function getEmbedUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname;

    if (hostname.includes("loom.com")) {
      let videoId = "";
      if (pathname.includes("/share/")) {
        videoId = pathname.split("/share/").pop() ?? "";
      } else if (pathname.includes("/embed/")) {
        videoId = pathname.split("/embed/").pop() ?? "";
      } else {
        videoId = pathname.split("/").filter(Boolean).pop() ?? "";
      }
      videoId = videoId.split("?")[0].split("/")[0];
      return videoId ? `https://www.loom.com/embed/${videoId}` : url;
    }

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      const videoId = getYoutubeId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
    }

    if (hostname.includes("vimeo.com")) {
      const videoId = pathname.split("/").filter(Boolean).pop() ?? "";
      return videoId && /^\d+$/.test(videoId)
        ? `https://player.vimeo.com/video/${videoId}`
        : url;
    }
  } catch {
    return url;
  }

  return url;
}

function isEmbeddableVideoUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return (
      hostname.includes("youtube.com") ||
      hostname.includes("youtu.be") ||
      hostname.includes("vimeo.com") ||
      hostname.includes("loom.com")
    );
  } catch {
    return false;
  }
}

export default async function VideoTutorialsPage() {
  const allVideos = await getVideos();
  const featuredVideos = allVideos.filter((v) => v.featured);

  const previewVideo = featuredVideos[0] ?? allVideos[0];
  const previewEmbedUrl = previewVideo ? getEmbedUrl(previewVideo.videoUrl) : "";
  const featuredVideosWithoutPreview = featuredVideos.filter(
    (video) => video.id !== previewVideo?.id
  );

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-border bg-background p-5 shadow-sm sm:p-6">
            <div className="space-y-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
                SchoolBase tutorials
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Learn SchoolBase the easy way with short, branded videos.
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-7 text-muted">
                Watch step-by-step guides for admission, fees, results, parent communication, and more. Each video is built for busy school leaders.
              </p>
              <p className="mx-auto max-w-2xl text-base leading-7 text-muted">
                Learn SchoolBase with easy-to-follow tutorials for school administrators, bursars, principals, and teachers. These videos show how to run admissions, collect fees, publish results, communicate with parents, and manage attendance.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button href="/signup">Get started</Button>
                <Button variant="secondary" href="/contact">
                  Talk to support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {previewVideo && (
        <section className="border-b border-border py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl overflow-hidden border border-border bg-black shadow-lg">
              <div className="aspect-video bg-black">
                {isEmbeddableVideoUrl(previewVideo.videoUrl) ? (
                  <iframe
                    src={previewEmbedUrl}
                    title={previewVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-black/80 text-white">
                    <div className="text-center">
                      <p className="text-lg font-semibold">Video preview unavailable</p>
                      <p className="mt-2 text-sm text-muted">Open the tutorial page to watch.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                {previewVideo.category}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-foreground">
                {previewVideo.title}
              </h2>
              <p className="mt-3 text-sm text-muted leading-6">
                {previewVideo.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href={`/video-tutorials/${previewVideo.id}`}>
                  Watch full tutorial
                </Button>
                <Button variant="secondary" href="/video-tutorials">
                  Browse all tutorials
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Videos Grid */}
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {featuredVideosWithoutPreview.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Featured Tutorials
              </h2>

              <div className="grid gap-6 md:grid-cols-2 mb-8">
                {featuredVideosWithoutPreview.map((video) => {
                  const thumbnail = getVideoThumbnail(video.videoUrl);
                  const embedUrl = getEmbedUrl(video.videoUrl);
                  const isEmbeddable = isEmbeddableVideoUrl(video.videoUrl);
                  return (
                    <a
                      key={video.id}
                      href={`/video-tutorials/${video.id}`}
                      className="group rounded-3xl overflow-hidden border border-border bg-surface shadow-sm transition hover:shadow-lg"
                    >
                      <div className="relative overflow-hidden bg-black">
                        {isEmbeddable ? (
                          <iframe
                            src={embedUrl}
                            title={`Preview of ${video.title}`}
                            className="h-44 w-full border-0"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                          />
                        ) : thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={`Preview of ${video.title}`}
                            className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center bg-black/80 text-white">
                            <div className="text-4xl">🎬</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition group-hover:scale-105">
                            <Play className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary mb-3">
                          {video.category}
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition">
                          {video.title}
                        </h3>
                        <p className="text-sm text-muted mt-2 line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          )}

          {/* All Videos */}
          {allVideos.length > featuredVideos.length && (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-8">
                All Tutorials
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {allVideos
                  .filter((v) => !v.featured)
                  .map((video) => {
                    const thumbnail = getVideoThumbnail(video.videoUrl);
                    const embedUrl = getEmbedUrl(video.videoUrl);
                    const isEmbeddable = isEmbeddableVideoUrl(video.videoUrl);
                    return (
                      <a
                        key={video.id}
                        href={`/video-tutorials/${video.id}`}
                        className="group rounded-3xl overflow-hidden border border-border bg-surface shadow-sm transition hover:shadow-lg"
                      >
                        <div className="relative overflow-hidden bg-black">
                          {isEmbeddable ? (
                            <iframe
                              src={embedUrl}
                              title={`Preview of ${video.title}`}
                              className="h-44 w-full border-0"
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                            />
                          ) : thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={`Preview of ${video.title}`}
                              className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-44 items-center justify-center bg-black/80 text-white">
                              <div className="text-4xl">🎬</div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition group-hover:scale-105">
                              <Play className="h-6 w-6" />
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary mb-3">
                            {video.category}
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition">
                            {video.title}
                          </h3>
                          <p className="text-sm text-muted mt-2 line-clamp-2">
                            {video.description}
                          </p>
                        </div>
                      </a>
                    );
                  })}
              </div>
            </>
          )}

          {allVideos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted mb-4">No tutorials yet</p>
              <a
                href="/"
                className="inline-flex items-center text-primary hover:text-primary/80"
              >
                ← Back to home
              </a>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-8 rounded-lg border border-border bg-primary/5 p-6 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Ready to get started?
            </h3>
            <p className="text-muted mb-4 max-w-2xl mx-auto">
              SchoolBase brings admission, attendance, fees, results, and parent
              communication together in one platform. Start using SchoolBase now.
            </p>
            <Button href="/signup" className="px-8 py-3">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
