"use client";

import VideosClient from "./videos-client";

export default function VideoLibraryPage() {
  return (
    <div className="px-3 py-6 sm:px-5 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Library</h1>
        <p className="mt-1 text-muted">Training and educational videos for schools</p>
      </div>

      <VideosClient initialVideos={[]} />
    </div>
  );
}
