"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Trash2, Edit2 } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import {
  createVideoAction,
  updateVideoAction,
  deleteVideoAction,
} from "../actions";

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  category: string;
  featured: boolean;
  createdAt: Date;
}

export default function VideosClient({
  initialVideos,
  showForm,
  onShowForm,
  onHideForm,
}: {
  initialVideos: Video[];
  showForm: boolean;
  onShowForm: () => void;
  onHideForm: () => void;
}) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeleteVideoId, setConfirmDeleteVideoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "Getting Started",
    featured: false,
  });

  useEffect(() => {
    async function loadVideos() {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/schoolbase-admin/api/videos`, {
          credentials: "include",
        });
        const data = await res.json();
        setVideos(data.videos || []);
        setPageLoading(false);
      } catch (err) {
        console.error("Error loading videos:", err);
        setPageLoading(false);
      }
    }
    loadVideos();
  }, []);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="mt-3 text-muted">Loading video library...</p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      category: "Getting Started",
      featured: false,
    });
    setEditingId(null);
    setError(null);
  };

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      category: video.category,
      featured: video.featured,
    });
    setEditingId(video.id);
    onShowForm();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Trim and validate inputs
    const trimmedTitle = formData.title.trim();
    const trimmedUrl = formData.videoUrl.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedTitle || !trimmedUrl) {
      setError("Title and Video URL are required");
      setLoading(false);
      return;
    }

    // Validate URL format
    if (!isValidVideoUrl(trimmedUrl)) {
      setError("Please enter a valid video URL (YouTube, Vimeo, or Loom)");
      setLoading(false);
      return;
    }

    try {
      const dataToSubmit = {
        title: trimmedTitle,
        description: trimmedDescription,
        videoUrl: trimmedUrl,
        category: formData.category,
        featured: formData.featured,
      };

      if (editingId) {
        await updateVideoAction(editingId, dataToSubmit);
        setVideos((prevVideos) =>
          prevVideos.map((v) =>
            v.id === editingId
              ? { ...v, ...dataToSubmit, updatedAt: new Date() }
              : v
          )
        );
      } else {
        const result = await createVideoAction(dataToSubmit);
        const newVideo: Video = {
          id: result.videoId,
          ...dataToSubmit,
          createdAt: new Date(),
        };
        setVideos([newVideo, ...videos]);
      }

      handleReset();
      onHideForm();
    } catch (err: any) {
      setError(err.message || "Failed to save video");
    } finally {
      setLoading(false);
    }
  };

  const isValidVideoUrl = (url: string): boolean => {
    try {
      // Check if URL is valid and from supported platforms
      return (
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("vimeo.com") ||
        url.includes("loom.com") ||
        (url.startsWith("http://") || url.startsWith("https://"))
      );
    } catch {
      return false;
    }
  };

  const handleDelete = (videoId: string) => {
    setConfirmDeleteVideoId(videoId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteVideoId) return;

    try {
      await deleteVideoAction(confirmDeleteVideoId);
      setVideos((prevVideos) =>
        prevVideos.filter((v) => v.id !== confirmDeleteVideoId)
      );
      setToastMessage("Video deleted successfully.");
      window.setTimeout(() => setToastMessage(null), 1800);
    } catch (err: any) {
      setError(err.message || "Failed to delete video");
    } finally {
      setConfirmDeleteVideoId(null);
    }
  };

  const copyShareLink = (videoId: string) => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/video-tutorials/${videoId}`;
      navigator.clipboard.writeText(shareUrl);
      setToastMessage("Link copied to clipboard!");
      window.setTimeout(() => setToastMessage(null), 1800);
    }
  };

  const totalVideos = videos.length;
  const featuredVideos = videos.filter((video) => video.featured).length;
  const deleteVideo = confirmDeleteVideoId
    ? videos.find((video) => video.id === confirmDeleteVideoId)
    : null;

  return (
    <div className="relative w-full space-y-2 px-0 sm:px-0 sm:space-y-4">
      {showForm && (
        <div className="w-full rounded-2xl border border-border/70 bg-surface p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2 text-foreground">
              <Plus className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold sm:text-xl">
                {editingId ? "Edit Video" : "Add New Video"}
              </h2>
            </div>
            <Button
              onClick={() => {
                handleReset();
                onHideForm();
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 w-full">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                Video Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                placeholder="e.g., How to Issue Fee Invoices"
                disabled={loading}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted h-20 resize-none"
                placeholder="Brief description of what this tutorial teaches"
                disabled={loading}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                Video URL (Loom/YouTube/Vimeo) *
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted truncate"
                placeholder="https://loom.com/share/... or https://youtu.be/..."
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground"
                  disabled={loading}
                >
                  <option>Getting Started</option>
                  <option>Admission</option>
                  <option>Attendance</option>
                  <option>Classes</option>
                  <option>Subjects</option>
                  <option>Teachers</option>
                  <option>Fees</option>
                  <option>Results</option>
                  <option>Support</option>
                  <option>Settings</option>
                  <option>Parent Communication</option>
                  <option>WhatsApp</option>
                  <option>Reports</option>
                </select>
              </div>

              <div className="flex items-center sm:items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="rounded border-border"
                    disabled={loading}
                  />
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    Featured ⭐
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Video"
                  : "Create Video"}
            </Button>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="w-full rounded-2xl border border-border/70 bg-surface p-3 shadow-sm sm:p-4">
        <div className="mb-4 grid gap-4 md:mb-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Video Library
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              A polished collection of tutorials for your team and schools, with quick actions for editing, sharing, and managing each item.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-3 text-sm sm:p-4">
              <p className="text-muted uppercase tracking-[0.2em] text-[10px]">Total videos</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{totalVideos}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4 text-sm">
              <p className="text-muted uppercase tracking-[0.2em] text-[10px]">Featured</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{featuredVideos}</p>
            </div>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-10 text-center sm:py-12">
            <p className="text-muted">No videos yet. Add a tutorial to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:shadow-md sm:p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">
                        {video.title}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {video.category}
                      </span>
                      {video.featured && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-sm text-muted line-clamp-3">
                      {video.description || "No description provided."}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted">
                      <span>Created {new Date(video.createdAt).toLocaleDateString()}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="break-all">{typeof window !== 'undefined' ? `${window.location.origin}/video-tutorials/${video.id}` : `/video-tutorials/${video.id}`}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => copyShareLink(video.id)}
                      aria-label="Copy link"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(video)}
                      aria-label="Edit video"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand border border-brand/20 transition hover:bg-brand/20"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(video.id)}
                      aria-label="Delete video"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-error/10 text-error border border-error/20 transition hover:bg-error/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="max-w-sm rounded-3xl bg-white p-5 text-center shadow-xl shadow-slate-900/20">
            <p className="text-sm font-semibold text-foreground">{toastMessage}</p>
          </div>
        </div>
      )}

      {confirmDeleteVideoId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-xl shadow-slate-900/20">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">Delete video</h3>
              <p className="mt-2 text-sm text-muted">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-foreground">
                  {deleteVideo?.title || "this video"}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmDeleteVideoId(null)}
                className="inline-flex w-full justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-slate-100 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex w-full justify-center rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 sm:w-auto"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
