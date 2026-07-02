import React from "react";

export default function AdminSkeleton() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 w-1/3 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
        <div className="mt-2 h-4 w-1/4 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-3/4 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
          <div className="mt-2 h-3 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-3/4 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
                <div className="mt-2 h-3 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-6">
            <div className="h-4 w-1/3 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-full rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 w-5/6 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 w-2/3 rounded-md bg-slate-200/60 dark:bg-slate-700 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
