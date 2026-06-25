"use client";

import { useState, useEffect } from "react";
import { getBackendUrl } from "@/lib/backend-url";
import { VideoHeroSection } from "@/components/video-tutorials/video-hero-section";
import { CategoryFilterBar } from "@/components/video-tutorials/category-filter-bar";
import { VideoCard } from "@/components/video-tutorials/video-card";
import { LoadingSkeletonGrid } from "@/components/video-tutorials/loading-skeleton-grid";
import { EmptyState } from "@/components/video-tutorials/empty-state";

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  category: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  duration?: string;
}

export default function VideoTutorialsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadVideos() {
      try {
        const backendUrl = getBackendUrl();
        const endpoints = [
          `${backendUrl}/api/videos`,
          `${backendUrl}/schoolbase-admin/api/videos`,
          `${backendUrl}/api/admin/videos`,
        ];

        let loadedVideos: Video[] = [];

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
              continue;
            }

            const data = await response.json();
            loadedVideos = Array.isArray(data?.videos) ? data.videos : [];
            break;
          } catch (err) {
            console.warn(`Unable to load videos from ${endpoint}:`, err);
          }
        }

        setVideos(loadedVideos);
      } catch (err) {
        console.error('Error loading videos:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  // Get unique categories
  const categories = ['all', ...new Set(videos.map(v => v.category))];
  
  // Filter videos by category and search
  const filteredVideos = videos.filter(v => {
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Separate featured videos
  const featuredVideos = filteredVideos.filter(v => v.featured);
  const regularVideos = filteredVideos.filter(v => !v.featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <VideoHeroSection 
        videoCount={videos.length}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Filter */}
        <div className="mb-10">
          <CategoryFilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {loading ? (
          <LoadingSkeletonGrid itemCount={6} />
        ) : filteredVideos.length === 0 ? (
          <EmptyState 
            category={selectedCategory}
            onReset={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="space-y-12">
            {/* Featured Section */}
            {featuredVideos.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Tutorials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredVideos.map(video => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      description={video.description}
                      category={video.category}
                      featured={true}
                      duration={video.duration}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Videos Grid */}
            {regularVideos.length > 0 && (
              <div>
                {featuredVideos.length > 0 && (
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">All Tutorials</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularVideos.map(video => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      description={video.description}
                      category={video.category}
                      duration={video.duration}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
