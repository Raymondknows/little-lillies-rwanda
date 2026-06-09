import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

interface RelatedVideo {
  id: string;
  title: string;
  category: string;
  duration?: string;
}

interface RelatedVideosCardProps {
  videos: RelatedVideo[];
  category?: string;
}

export function RelatedVideosCard({ videos, category }: RelatedVideosCardProps) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm sticky top-20">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {category ? `More ${category} Videos` : "Related Videos"}
      </h3>

      <div className="space-y-3">
        {videos.slice(0, 5).map((video) => (
          <Link
            key={video.id}
            href={`/video-tutorials/${video.id}`}
            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center group-hover:from-brand/30 group-hover:to-brand/20 transition-colors">
              <Play className="w-5 h-5 text-brand fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-brand transition-colors">
                {video.title}
              </p>
              {video.duration && (
                <p className="text-xs text-slate-500 mt-1">{video.duration}</p>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors flex-shrink-0 mt-1" />
          </Link>
        ))}
      </div>

      {videos.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-6">
          No related videos yet
        </p>
      )}
    </div>
  );
}
