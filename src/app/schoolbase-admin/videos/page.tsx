"use client";

import VideosClient from "./videos-client";

export default function VideoLibraryPage() {
  return (
    <div className="px-2 py-3 sm:px-4 sm:py-5 lg:px-6 lg:py-6 space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Video Library</h1>
        <p className="text-muted">Training and educational videos for schools</p>
      </div>

      <VideosClient initialVideos={[]} />
    </div>
  );
}
