"use client";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-muted">
          Performance insights across your school.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-muted">Analytics data loading from backend API...</p>
        <p className="mt-2 text-sm text-muted">School performance metrics and analysis coming soon.</p>
      </div>
    </div>
  );
}
