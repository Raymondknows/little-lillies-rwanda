"use client";

import { useState } from "react";
import Link from "next/link";
import AdminPageShell from "@/components/admin-page-shell";
import VideosClient from "./videos-client";

export default function VideoLibraryPage() {
  const [showUploadForm, setShowUploadForm] = useState(false);

  return (
    <AdminPageShell
      title="Video Library"
      subtitle="Training and educational videos for schools"
      actions={
        <>
          <Link href="/schoolbase-admin/support" className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface">
            Support help
          </Link>
          <button
            type="button"
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center justify-center rounded-xl bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0952a4]"
          >
            Upload video
          </button>
        </>
      }
    >
      <div className="px-2 py-3 sm:px-4 sm:py-5 lg:px-6 lg:py-6 space-y-4">
        <VideosClient
          initialVideos={[]}
          showForm={showUploadForm}
          onShowForm={() => setShowUploadForm(true)}
          onHideForm={() => setShowUploadForm(false)}
        />
      </div>
    </AdminPageShell>
  );
}
