import { Play, BookOpen } from "lucide-react";

interface VideoHeroSectionProps {
  videoCount?: number;
  onSearchChange?: (query: string) => void;
}

export function VideoHeroSection({ videoCount = 0, onSearchChange }: VideoHeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-brand/5 to-slate-50 pt-16 pb-12">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-brand/10 rounded-lg">
            <Play className="w-6 h-6 text-brand fill-current" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Learn Little Lillies School Step-by-Step
            </h1>
            <p className="text-lg text-slate-600 mt-2 max-w-2xl">
              Master every feature with our comprehensive video tutorials. From setup to advanced configurations, we've got you covered.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tutorials..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full px-5 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </div>
          </div>
        </div>

        {/* Stats */}
        {videoCount > 0 && (
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-600">
            <BookOpen className="w-4 h-4" />
            <span>{videoCount} tutorials available</span>
          </div>
        )}
      </div>
    </div>
  );
}
