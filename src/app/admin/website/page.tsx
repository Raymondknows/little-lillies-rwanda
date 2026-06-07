"use client";

export default function WebsitePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Website & Announcements</h1>
        <p className="mt-1 text-muted">
          Manage your school's public website and announcements.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-muted">Website management interface loading...</p>
        <p className="mt-2 text-sm text-muted">Create and manage announcements, manage website settings coming soon.</p>
      </div>
    </div>
  );
}
