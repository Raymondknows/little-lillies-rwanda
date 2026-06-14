"use client";

import { useEffect, useState } from "react";
import { Bell, AlertCircle } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        
        const res = await fetch(`${backendUrl}/api/parent/announcements`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Failed to load announcements');
        }

        const data = await res.json();
        setAnnouncements(data.announcements || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading announcements:", err);
        setError(err instanceof Error ? err.message : 'Failed to load announcements');
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
          <p className="mt-4 text-muted">Loading announcements...</p>
        </div>
      </div>
    );
  }

  const categories = ["all", ...new Set(announcements.map(a => a.category || "General"))];
  const filtered = filter === "all" 
    ? announcements 
    : announcements.filter(a => (a.category || "General") === filter);

  const categoryColors: Record<string, string> = {
    "Academic": "border-brand bg-brand/10 text-brand",
    "Fees": "border-error bg-error/10 text-error",
    "Holiday": "border-success bg-success/10 text-success",
    "Event": "border-brand bg-brand/10 text-brand",
    "General": "border-border bg-background text-muted",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">School Announcements</h1>
        <p className="mt-1 text-muted">Latest updates from your school</p>
      </div>

      {error && (
        <div className="rounded-lg border border-error bg-error/10 p-4 flex gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error</h3>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="mb-8">
          <p className="text-sm font-semibold text-foreground mb-3">Filter by Category:</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === cat
                    ? "bg-brand text-white shadow-sm"
                    : "bg-background text-foreground border border-border hover:border-brand/50"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <Bell className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-lg border border-border bg-surface p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{announcement.title}</h3>
                  <p className="text-xs text-muted/70 mt-1">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {announcement.category && (
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium whitespace-nowrap ml-2 ${categoryColors[announcement.category] || categoryColors["General"]}`}>
                    {announcement.category}
                  </span>
                )}
              </div>
              <p className="text-foreground leading-relaxed text-sm">
                {announcement.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
