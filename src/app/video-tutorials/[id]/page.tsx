import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getVideoById, getVideos } from "@/lib/video-tutorials";
import VideoTutorialDetailsClient from "./video-tutorial-details-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideoById(id);

  if (!video) {
    return {
      title: "Video Tutorial | SchoolBase",
      description:
        "Watch SchoolBase video tutorials for admissions, fee collection, results publishing, parent communication, attendance, and school administration.",
      keywords: [
        "SchoolBase video tutorials",
        "school software video guide",
        "school management training",
      ],
      openGraph: {
        title: "SchoolBase Video Tutorial",
        description:
          "Watch a SchoolBase video tutorial covering key school software workflows, admissions, fees, results, and parent communication.",
        url: `https://schoolbase.live/video-tutorials/${id}`,
        siteName: "SchoolBase",
        images: [
          {
            url: "https://schoolbase.live/og-image.png",
            width: 1200,
            height: 630,
          },
        ],
        locale: "en_NG",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "SchoolBase Video Tutorial",
        description:
          "Watch a SchoolBase video tutorial covering key school software workflows, admissions, fees, results, and parent communication.",
        images: ["https://schoolbase.live/og-image.png"],
      },
    };
  }

  const keywordPhrases = [
    "SchoolBase video tutorial",
    video.title,
    video.category,
    "school admissions tutorial",
    "school fees tutorial",
    "student results guide",
    "parent communication video",
    "school admin workflow",
  ];

  return {
    title: `${video.title} | SchoolBase Video Tutorial`,
    description: `${video.description} Learn how to use SchoolBase for ${video.category.toLowerCase()} with practical step-by-step video training.`,
    keywords: keywordPhrases,
    openGraph: {
      title: `${video.title} | SchoolBase Video Tutorial`,
      description: `${video.description} Learn how to use SchoolBase for ${video.category.toLowerCase()} with practical step-by-step video training.`,
      url: `https://schoolbase.live/video-tutorials/${video.id}`,
      siteName: "SchoolBase",
      images: [
        {
          url: "https://schoolbase.live/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_NG",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${video.title} | SchoolBase Video Tutorial`,
      description: `${video.description} Learn how to use SchoolBase for ${video.category.toLowerCase()} with practical step-by-step video training.`,
      images: ["https://schoolbase.live/og-image.png"],
    },
  };
}

export default async function VideoTutorialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideoById(id);
  const allVideos = await getVideos();

  if (!video) {
    notFound();
  }

  const otherVideos = allVideos.filter((item) => item.id !== video.id);

  return (
    <div className="bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="space-y-5 sm:max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
              {video.category}
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {video.title}
              </h1>
              <p className="text-base leading-7 text-muted">
                {video.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/signup">Get started</Button>
              <Button variant="secondary" href="/video-tutorials">
                Browse all tutorials
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="rounded-3xl overflow-hidden border border-border shadow-lg bg-black">
              <div className="aspect-video bg-black">
                {video.videoUrl ? (
                  <iframe
                    src={getEmbedUrl(video.videoUrl)}
                    title={video.title}
                    className="w-full h-full border-0"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <p>No video available</p>
                  </div>
                )}
              </div>
            </div>

            <VideoTutorialDetailsClient video={video} />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                More SchoolBase tutorials
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Watch other videos while you explore the full SchoolBase workflow.
              </p>
              <div className="mt-6 space-y-3">
                {otherVideos.map((item) => (
                  <a
                    key={item.id}
                    href={`/video-tutorials/${item.id}`}
                    className="block rounded-3xl border border-border bg-background p-4 transition hover:border-brand hover:bg-brand/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-muted line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      {item.featured && (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                Need help?
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Contact support on WhatsApp or email for setup help, custom onboarding, and SchoolBase premium support.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button href="/contact" variant="secondary">
                  Contact support
                </Button>
                <Button href="/signup">Start using SchoolBase</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert URLs to embed URLs
function getEmbedUrl(url: string): string {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname;

    // Loom links
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

    // YouTube links
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      const videoId = extractYoutubeId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
    }

    // Vimeo links
    if (hostname.includes("vimeo.com")) {
      const videoId = pathname.split("/").filter(Boolean).pop() ?? "";
      return videoId && /^\d+$/.test(videoId)
        ? `https://player.vimeo.com/video/${videoId}`
        : url;
    }
  } catch (error) {
    // If URL parsing fails, fall back to original URL
    return url;
  }

  // Return as-is if no conversion needed
  return url;
}

function extractYoutubeId(url: string): string {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : "";
}
