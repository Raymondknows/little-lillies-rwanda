import Link from "next/link";
import { createAnnouncement } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewAnnouncementPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back link */}
      <Link
        href="/admin/website"
        className="flex items-center gap-2 text-sm text-brand hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to announcements
      </Link>

      {/* Form */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Post news</h1>
        <p className="mt-1 text-muted">
          Share announcements with parents, teachers, and the public website.
        </p>
      </div>

      <form
        action={createAnnouncement}
        className="space-y-4 rounded-xl border border-border bg-surface p-6"
      >
        <label className="block text-sm font-medium">
          Title *
          <input
            name="title"
            required
            placeholder="e.g., Holiday Schedule for December"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </label>

        <label className="block text-sm font-medium">
          Message *
          <textarea
            name="body"
            required
            rows={8}
            placeholder="Write your announcement here. This will be visible to parents, teachers, and students."
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="publish"
            defaultChecked
            className="h-4 w-4 rounded border-border"
          />
          Publish immediately
          <span className="text-xs text-muted">(uncheck to save as draft)</span>
        </label>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            Post announcement
          </Button>
          <Link href="/admin/website" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {/* Info section */}
      <div className="rounded-lg border border-border bg-surface/50 p-4 text-sm text-muted">
        <p className="font-medium text-foreground">Tips:</p>
        <ul className="mt-2 space-y-1 list-inside list-disc">
          <li>Published announcements appear on parents and teachers' dashboards</li>
          <li>Draft announcements can be edited before publishing</li>
          <li>Keep announcements clear and concise for better readability</li>
        </ul>
      </div>
    </div>
  );
}
