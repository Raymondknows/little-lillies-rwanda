"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Trash2, Edit2 } from "lucide-react";
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
}: {
  initialVideos: Video[];
}) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "Getting Started",
    featured: false,
  });

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
    setShowForm(true);
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
      setShowForm(false);
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

  const handleDelete = async (videoId: string) => {
    if (!confirm("Delete this video? This cannot be undone.")) return;

    try {
      await deleteVideoAction(videoId);
      setVideos((prevVideos) => prevVideos.filter((v) => v.id !== videoId));
    } catch (err: any) {
      setError(err.message || "Failed to delete video");
    }
  };

  const copyShareLink = (videoId: string) => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/video-tutorials/${videoId}`;
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Add/Edit Form */}
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground break-words">
            {editingId ? "Edit Video" : "Add New Video"}
          </h2>
          {!showForm ? (
            <Button
              onClick={() => {
                handleReset();
                setShowForm(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Video
            </Button>
          ) : (
            <Button
              onClick={() => {
                handleReset();
                setShowForm(false);
              }}
              variant="outline"
            >
              Cancel
            </Button>
          )}
        </div>

        {showForm && (
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
              className="w-full"
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Video"
                  : "Create Video"}
            </Button>
          </form>
        )}
      </div>

      {/* Videos List */}
      <div className="space-y-3 w-full">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground break-words">
          Tutorials ({videos.length})
        </h2>

        {videos.length === 0 ? (
          <div className="text-center py-12 rounded-lg border border-dashed border-border">
            <p className="text-muted">No videos yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 w-full">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-lg border border-border bg-surface p-3 sm:p-4 hover:shadow-md transition w-full"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 w-full">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {video.title}
                      </h3>
                      {video.featured && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 flex-shrink-0 whitespace-nowrap">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted mb-2 line-clamp-2 break-words">
                      {video.description}
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted mb-2">
                      <span className="whitespace-nowrap">📁 {video.category}</span>
                      <span className="whitespace-nowrap">
                        📅 {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Share Link */}
                    <div className="p-2 bg-background rounded text-xs border border-border overflow-x-auto max-w-full">
                      <code className="text-primary break-all">
                        {typeof window !== 'undefined' ? `${window.location.origin}/video-tutorials/${video.id}` : `/video-tutorials/${video.id}`}
                      </code>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                    <Button
                      onClick={() => copyShareLink(video.id)}
                      variant="outline"
                      className="gap-2"
                      title="Copy shareable link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleEdit(video)}
                      variant="outline"
                      className="gap-2"
                      title="Edit video"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(video.id)}
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      title="Delete video"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
