import { notFound } from "next/navigation";
import VideoTutorialDetailsClient from "./video-tutorial-details-client";
import { getBackendUrl } from "@/lib/backend-url";
import { getEmbedUrl } from "@/lib/video-embed-url";
import { VideoBreadcrumb } from "@/components/video-tutorials/video-breadcrumb";
import { RelatedVideosCard } from "@/components/video-tutorials/related-videos-card";
import { Calendar, Tag } from "lucide-react";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<any> {
  const params = await props.params;
  const backendUrl = getBackendUrl();

  try {
    const endpoints = [
      `${backendUrl}/api/admin/videos/${params.id}`,
      `${backendUrl}/api/videos/${params.id}`,
      `${backendUrl}/schoolbase-admin/api/videos/${params.id}`,
    ];

    let video: any = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        video = data.video;
        if (video) {
          break;
        }
      } catch {
        // Try the next fallback endpoint.
      }
    }

    if (!video) {
      return {
        title: "Video Not Found | SchoolBase",
        description: "The video tutorial you're looking for doesn't exist.",
      };
    }

    return {
      title: `${video.title} | SchoolBase`,
      description: video.description || "Watch SchoolBase video tutorials",
    };
  } catch {
    return {
      title: "Video Tutorial | SchoolBase",
      description: "Watch SchoolBase video tutorials",
    };
  }
}

export default async function VideoTutorialPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const backendUrl = getBackendUrl();

  try {
    const videoEndpoints = [
      `${backendUrl}/api/admin/videos/${params.id}`,
      `${backendUrl}/api/videos/${params.id}`,
      `${backendUrl}/schoolbase-admin/api/videos/${params.id}`,
    ];

    let video: any = null;

    for (const endpoint of videoEndpoints) {
      try {
        const response = await fetch(endpoint, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        video = data.video;
        if (video) {
          break;
        }
      } catch {
        // Try the next fallback endpoint.
      }
    }

    if (!video) {
      notFound();
    }

    let relatedVideos = [];
    try {
      const relatedEndpoints = [
        `${backendUrl}/api/admin/videos`,
        `${backendUrl}/api/videos`,
        `${backendUrl}/schoolbase-admin/api/videos`,
      ];

      for (const endpoint of relatedEndpoints) {
        try {
          const allVideosResponse = await fetch(endpoint, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          });

          if (!allVideosResponse.ok) {
            continue;
          }

          const allData = await allVideosResponse.json();
          relatedVideos = (allData.videos || [])
            .filter((v: any) => v.category === video.category && v.id !== video.id)
            .slice(0, 5);
          break;
        } catch (err) {
          console.error('Error fetching related videos:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching related videos:', err);
    }

    const formattedDate = video.createdAt 
      ? new Date(video.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header Background */}
        <div className="bg-gradient-to-br from-blue-50 via-brand/5 to-slate-50 pt-8 pb-4">
          <div className="max-w-6xl mx-auto px-6">
            <VideoBreadcrumb
              items={[
                { label: "Video Tutorials", href: "/video-tutorials" },
                { label: video.category, href: `/video-tutorials?category=${video.category}` },
                { label: video.title },
              ]}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Video Player */}
              <div className="rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm border border-white/20">
                <div className="aspect-video bg-black flex items-center justify-center relative group">
                  {video.videoUrl ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={getEmbedUrl(video.videoUrl)}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="text-center text-slate-400 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-2xl">▶</span>
                      </div>
                      <p>Video player unavailable</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Info */}
              <div className="space-y-6">
                {/* Title and Category */}
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    {video.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-full font-semibold text-sm">
                      <Tag className="w-4 h-4" />
                      {video.category}
                    </span>
                    {formattedDate && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm">
                        <Calendar className="w-4 h-4" />
                        {formattedDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">About This Tutorial</h2>
                  <p className="text-slate-700 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                {/* Interaction Component */}
                <VideoTutorialDetailsClient video={video} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {relatedVideos.length > 0 && (
                <RelatedVideosCard 
                  videos={relatedVideos}
                  category={video.category}
                />
              )}

              {/* Call to Action Box */}
              <div className="rounded-xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 p-6 mt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Ready to use SchoolBase?
                </h3>
                <p className="text-sm text-slate-700 mb-4">
                  Start using SchoolBase now and give your school the controls it needs.
                </p>
                <a
                  href="/signup"
                  className="inline-block w-full text-center px-5 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand/90 transition-colors"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading video:', error);
    notFound();
  }
}
