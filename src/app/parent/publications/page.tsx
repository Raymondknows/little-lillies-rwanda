"use client";

import { useEffect, useState } from "react";
import { BookOpen, AlertCircle, Grid3x3, List, X } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";

interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt?: string;
  createdAt: string;
}

type ViewMode = "grid" | "list";

export default function PublicationsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        
        const res = await fetch(`${backendUrl}/api/parent/announcements`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Failed to load publications');
        }

        const data = await res.json();
        setAnnouncements(data.announcements || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading publications:", err);
        setError(err instanceof Error ? err.message : 'Failed to load publications');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading publications...</p>
        </div>
      </div>
    );
  }

  const getExcerpt = (body: string | undefined, length: number = 150) => {
    if (!body) return "";
    return body.length > length ? body.substring(0, length) + "..." : body;
  };

  const getReadingTime = (body: string | undefined) => {
    if (!body) return 1;
    const wordsPerMinute = 200;
    const wordCount = body.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">School Publications</h1>
          <p className="mt-2 text-muted">Latest news and updates from your school</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-brand text-white"
                : "text-muted hover:text-foreground"
            }`}
            title="Grid view"
          >
            <Grid3x3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition-colors ${
              viewMode === "list"
                ? "bg-brand text-white"
                : "text-muted hover:text-foreground"
            }`}
            title="List view"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error bg-error/10 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error</h3>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Publications List */}
      {announcements.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-16 text-center">
          <BookOpen className="h-16 w-16 text-muted/40 mx-auto mb-4" />
          <p className="text-lg text-muted">No publications yet</p>
          <p className="text-sm text-muted/70 mt-2">Check back soon for school updates</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((publication, index) => (
            <button
              key={publication.id}
              onClick={() => setSelectedAnnouncement(publication)}
              className="text-left rounded-xl border border-border bg-surface overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group hover:border-brand/50"
            >
              {/* Featured Image / Header */}
              <div className="h-48 bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center overflow-hidden relative group-hover:from-brand/30 group-hover:to-brand/10 transition-all">
                <div className="text-center px-4">
                  <div className="text-5xl mb-2">📰</div>
                  <p className="text-sm text-muted/70 line-clamp-2">{publication.title}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                {/* Category/Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-wider">
                    News
                  </span>
                  <span className="text-xs text-muted">
                    {getReadingTime(publication.body)} min read
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-brand transition-colors">
                  {publication.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-muted leading-relaxed mb-4 flex-1 line-clamp-3">
                  {getExcerpt(publication.body)}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <time className="text-xs text-muted/70">
                    {new Date(publication.publishedAt || publication.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <span className="text-xs font-semibold text-brand">
                    Read More →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {announcements.map((publication) => (
            <button
              key={publication.id}
              onClick={() => setSelectedAnnouncement(publication)}
              className="text-left rounded-xl border border-border bg-surface overflow-hidden hover:shadow-md transition-all duration-300 group hover:border-brand/50 w-full"
            >
              <div className="flex gap-6 p-6">
                {/* Featured Visual */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center overflow-hidden group-hover:from-brand/30 group-hover:to-brand/10 transition-all">
                  <div className="text-4xl">📰</div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-wider">
                        News
                      </span>
                      <span className="text-xs text-muted">
                        {getReadingTime(publication.body)} min read
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-brand transition-colors">
                      {publication.title}
                    </h2>

                    <p className="text-muted leading-relaxed mb-4">
                      {getExcerpt(publication.body, 250)}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <time className="text-sm text-muted/70">
                      {new Date(publication.publishedAt || publication.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <span className="text-sm font-semibold text-brand">
                      Read Full Article →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-surface/95 backdrop-blur">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-wider">
                    News
                  </span>
                  <span className="text-xs text-muted">
                    {getReadingTime(selectedAnnouncement.body)} min read
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedAnnouncement.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-background transition-colors text-muted hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Publication Date */}
              <div className="flex items-center gap-2 text-sm text-muted/70 pb-4 border-b border-border/50">
                <span>Published on</span>
                <time>
                  {new Date(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>

              {/* Featured Visual */}
              <div className="h-64 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center overflow-hidden">
                <div className="text-7xl">📰</div>
              </div>

              {/* Full Content */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                  {selectedAnnouncement.body}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-between p-6 border-t border-border bg-surface/95 backdrop-blur gap-3">
              <div className="text-sm text-muted">
                {announcements.findIndex(a => a.id === selectedAnnouncement.id) + 1} of {announcements.length}
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-lg bg-brand text-white font-semibold hover:bg-brand/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
