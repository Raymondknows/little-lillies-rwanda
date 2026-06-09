"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBackendUrl } from "@/lib/backend-url";

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  category: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function VideoTutorialsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function loadVideos() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/videos`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to load videos');
        }

        const data = await response.json();
        setVideos(data.videos || []);
      } catch (err) {
        console.error('Error loading videos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load videos');
        // Set empty videos on error - videos will be fetched from database
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  const categories = ['all', ...new Set(videos.map(v => v.category))];
  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-slate-200 rounded-lg w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Play className="w-6 h-6 text-brand fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Video Tutorials</h1>
              <p className="text-sm text-slate-600 mt-1">Learn SchoolBase features with step-by-step guides</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === category
                    ? 'bg-brand text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-brand hover:text-brand'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No videos found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <Link
                key={video.id}
                href={`/video-tutorials/${video.id}`}
                className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-brand to-brand/50 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white fill-current" />
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Play className="w-12 h-12 text-white fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs font-semibold text-brand bg-brand/10 px-2 py-1 rounded">
                      {video.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-brand transition">
                    {video.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Need More Help?</h2>
          <p className="text-slate-600 mb-4">
            Can't find what you're looking for? Contact our support team or visit the documentation.
          </p>
          <div className="flex gap-4">
            <a href="mailto:support@schoolbase.live" className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition">
              Contact Support
            </a>
            <a href="/help" target="_blank" className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:border-brand hover:text-brand transition">
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
