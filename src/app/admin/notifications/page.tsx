"use client";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="mt-1 text-muted">
          Manage notifications sent to parents and staff.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-muted">Notification management interface loading...</p>
        <p className="mt-2 text-sm text-muted">Send and manage school notifications coming soon.</p>
      </div>
    </div>
  );
}
