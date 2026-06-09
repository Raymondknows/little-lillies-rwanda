import Link from "next/link";
import { PlayCircle } from "lucide-react";

interface EmptyStateProps {
  category?: string;
  onReset?: () => void;
}

export function EmptyState({ category, onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <PlayCircle className="w-12 h-12 text-slate-400" />
      </div>

      <h3 className="text-2xl font-bold text-slate-900 mb-2">
        {category && category !== "all"
          ? `No tutorials in ${category}`
          : "No tutorials available"}
      </h3>

      <p className="text-slate-600 text-center max-w-sm mb-8">
        {category && category !== "all"
          ? "Check back later for new content in this category."
          : "We're working on creating comprehensive video tutorials for you."}
      </p>

      <div className="flex gap-3">
        {category && category !== "all" && (
          <button
            onClick={onReset}
            className="px-6 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium hover:bg-slate-200 transition-colors"
          >
            Browse All Categories
          </button>
        )}
        <Link
          href="/"
          className="px-6 py-2 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
