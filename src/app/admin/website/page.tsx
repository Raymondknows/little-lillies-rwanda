"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackendUrl } from "@/lib/backend-url";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Loader } from "lucide-react";
import { UserGuide, type PageHelpGuide } from "@/components/ui/user-guide";
import SubscriptionModal from "@/components/subscription-modal";

interface Announcement {
  id: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: string;
  createdAt?: string;
}

const HELP_GUIDE: PageHelpGuide = {
  title: "Managing Website & Announcements",
  overview: "Publish announcements to your school website that parents and guardians can see. Keep your school community informed about important news and updates.",
  steps: [
    "Click 'Post news' to create a new announcement.",
    "Write your announcement title and message.",
    "Save as Draft to edit later, or Publish immediately.",
    "Published announcements appear on your school's public website.",
    "Delete announcements you no longer want to display.",
  ],
  commonTasks: [
    {
      title: "Create an Announcement",
      description: "Post news that will be visible on your school website.",
      tips: [
        "Click 'Post news' button at the top right",
        "Enter an engaging title (e.g., 'School Closed Tomorrow')",
        "Write your message in the body field",
        "Click 'Publish' to make it live immediately",
        "Or save as 'Draft' to edit and publish later",
      ],
    },
    {
      title: "View Published Announcements",
      description: "See which announcements are live on your website.",
      tips: [
        "Only 'Published' announcements appear on your public website",
        "Drafts are saved but remain hidden from parents",
        "Publication date shows when each announcement was published",
      ],
    },
    {
      title: "Delete an Announcement",
      description: "Remove announcements from your website.",
      tips: [
        "Click the trash icon on the right side of any announcement",
        "Both published and draft announcements can be deleted",
        "Deletion is permanent",
      ],
    },
  ],
  faqs: [
    {
      question: "Where do announcements appear?",
      answer: "Published announcements appear on your school's public website that parents can visit. They're organized by date with the newest first.",
    },
    {
      question: "Can I edit an announcement after publishing?",
      answer: "Currently, you need to delete and recreate an announcement to make changes. We're working on an edit feature for future releases.",
    },
    {
      question: "How many announcements can I post?",
      answer: "You can post unlimited announcements. We recommend keeping the 5-10 most recent visible for clarity.",
    },
  ],
};

export default function WebsitePage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<{
    reason?: string;
    schoolName?: string;
  } | null>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/website/data`, {
          credentials: "include",
        });

        if (response.status === 403) {
          const data = await response.json();
          if (data?.code === 'SUBSCRIPTION_INACTIVE') {
            setSubscriptionError({
              reason: data.reason || 'Your school subscription is not active.',
              schoolName: data.school?.name,
            });
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load announcements");
        }

        const data = await response.json();
        setAnnouncements(data.announcements || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load announcements");
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    setDeleting(id);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete announcement");
      }

      setAnnouncements(announcements.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete announcement");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Website & Announcements</h1>
            <p className="mt-1 text-muted">Manage your school's public announcements</p>
          </div>
          <Link href="/admin/website/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Post news
            </Button>
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-brand" />
            <span className="ml-2 text-muted">Loading announcements...</span>
          </div>
        )}

        {/* Announcements list */}
        {!loading && announcements.length === 0 && (
          <div className="rounded-lg border border-border bg-surface p-8 text-center">
            <p className="text-muted">No announcements yet.</p>
            <Link href="/admin/website/new" className="mt-3 inline-block text-sm text-brand hover:underline">
              Create your first announcement
            </Link>
          </div>
        )}

        {!loading && announcements.length > 0 && (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-lg border border-border bg-surface p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">{announcement.title}</h2>
                    <p className="mt-1 text-sm text-muted line-clamp-2">{announcement.body}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                          announcement.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {announcement.published ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs text-muted">
                        {announcement.publishedAt
                          ? new Date(announcement.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : new Date(announcement.createdAt || "").toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    disabled={deleting === announcement.id}
                    className="flex-shrink-0 rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help & Guide */}
      <UserGuide guide={HELP_GUIDE} />

      {subscriptionError && (
        <SubscriptionModal reason={subscriptionError.reason} schoolName={subscriptionError.schoolName} />
      )}
    </>
  );
}
