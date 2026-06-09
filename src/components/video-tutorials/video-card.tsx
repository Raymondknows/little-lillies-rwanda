import Link from "next/link";
import { Play } from "lucide-react";

interface VideoCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  featured?: boolean;
  createdAt?: string;
  duration?: string;
}

export function VideoCard({
  id,
  title,
  description,
  category,
  featured = false,
  duration,
}: VideoCardProps) {
  const cardClasses = featured
    ? "md:col-span-2 md:row-span-2"
    : "";

  return (
    <Link href={`/video-tutorials/${id}`}>
      <div
        className={`group relative h-64 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${cardClasses}`}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

        {/* Category Badge - Top Left */}
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-block px-3 py-1 bg-brand/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
            {category}
          </span>
        </div>

        {/* Duration Badge - Top Right (if available) */}
        {duration && (
          <div className="absolute top-3 right-3 z-20">
            <span className="inline-block px-3 py-1 bg-black/50 text-white text-xs font-medium rounded-full backdrop-blur-sm">
              {duration}
            </span>
          </div>
        )}

        {/* Play Button - Center */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-base font-semibold text-white line-clamp-2 mb-1">
            {title}
          </h3>
          <p className="text-xs text-slate-200 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
