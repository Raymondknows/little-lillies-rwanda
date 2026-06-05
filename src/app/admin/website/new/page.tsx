import Link from "next/link";
import { createAnnouncement } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export default function NewAnnouncementPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/website" className="text-sm text-brand hover:underline">
        ← Website
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Post news</h1>
      <p className="mt-1 text-muted">Shows on your school website and parent app.</p>

      <form
        action={createAnnouncement}
        className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6"
      >
        <label className="block text-sm font-medium">
          Title *
          <input
            name="title"
            required
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Message *
          <textarea
            name="body"
            required
            rows={5}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publish" defaultChecked />
          Publish immediately
        </label>
        <Button type="submit" className="w-full">
          Post news
        </Button>
      </form>
    </div>
  );
}
