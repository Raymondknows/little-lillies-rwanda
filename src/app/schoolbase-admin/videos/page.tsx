import { Suspense } from "react";
import VideosClient from "./videos-client";

export default function VideoLibraryPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Library</h1>
        <p className="mt-1 text-muted">Training and educational videos for schools</p>
      </div>

      <Suspense fallback={<div className="text-center py-8 text-muted">Loading video library...</div>}>
        <VideosClient initialVideos={[]} />
      </Suspense>
    </div>
  );
}
