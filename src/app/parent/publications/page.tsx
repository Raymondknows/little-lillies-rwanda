"use client";

import { useEffect, useState } from "react";
import { BookOpen, AlertCircle, X } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import ParentPageShell from "@/components/parent-page-shell";
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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <ParentPageShell onRefresh={loadData}>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-64 bg-slate-100 rounded animate-pulse"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border border-border bg-surface p-4 space-y-3 animate-pulse">
              <div className="h-5 w-32 bg-slate-200 rounded"></div>
              <div className="h-4 w-48 bg-slate-100 rounded"></div>
              <div className="h-20 w-full bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </ParentPageShell>
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
    <ParentPageShell onRefresh={loadData}>
      {/* Header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-4xl font-bold text-foreground">School Publications</h1>
          <p className="mt-2 text-muted">Latest news and updates from your school</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted">
            <BookOpen className="h-4 w-4 text-brand" />
            Publications
          </div>
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
        <div className="rounded-3xl border border-border bg-surface p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted/40 mx-auto mb-4" />
          <p className="text-lg text-muted">No publications yet</p>
          <p className="text-sm text-muted/70 mt-2">Check back soon for school updates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((publication) => (
            <button
              key={publication.id}
              onClick={() => setSelectedAnnouncement(publication)}
              className="w-full text-left rounded-3xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md hover:border-brand/50"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                      News
                    </span>
                    <span className="text-xs text-muted">
                      {getReadingTime(publication.body)} min read
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground truncate">{publication.title}</h2>
                  <p className="text-sm text-muted mt-2 line-clamp-3">{getExcerpt(publication.body, 180)}</p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold text-foreground">{new Date(publication.publishedAt || publication.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}</p>
                  <span className="mt-2 inline-flex items-center rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted">
                    Read
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
            {/* Modal Header */}
            <div className="sticky top-0 flex flex-col gap-4 p-5 border-b border-border bg-surface/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand">
                  News
                </span>
                <span className="text-xs text-muted">
                  {getReadingTime(selectedAnnouncement.body)} min read
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-bold text-foreground">{selectedAnnouncement.title}</h2>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-background transition-colors text-muted hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Publication Date */}
              <div className="flex flex-col gap-2 text-sm text-muted/70 pb-4 border-b border-border/50">
                <span className="font-semibold text-slate-900">Published on</span>
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
              <div className="h-64 rounded-3xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center overflow-hidden">
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
            <div className="sticky bottom-0 flex flex-col gap-3 p-5 border-t border-border bg-surface/95 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted">
                {announcements.findIndex(a => a.id === selectedAnnouncement.id) + 1} of {announcements.length}
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="w-full rounded-3xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand/90 transition-colors sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ParentPageShell>
  );
}
