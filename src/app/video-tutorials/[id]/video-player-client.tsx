"use client";

import { useRef } from "react";
import { Maximize2 } from "lucide-react";

interface VideoPlayerClientProps {
  videoUrl: string;
  title: string;
  embedUrl: string;
}

export default function VideoPlayerClient({ videoUrl, title, embedUrl }: VideoPlayerClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleFullscreen = async () => {
    try {
      const el = containerRef.current;
      if (!el) return;
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      // Some browsers require prefix, but modern browsers support requestFullscreen
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen failed', err);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full bg-transparent flex items-center justify-center" style={{ height: 'min(56vh, 600px)' }}>
      {videoUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <div className="text-center text-slate-400 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-2xl">▶</span>
          </div>
          <p>Video player unavailable</p>
        </div>
      )}

      <button
        onClick={handleFullscreen}
        aria-label="Toggle fullscreen"
        className="absolute right-3 bottom-3 z-20 inline-flex items-center gap-2 rounded-md bg-white/90 text-slate-900 px-3 py-2 text-sm shadow-sm hover:bg-white"
      >
        <Maximize2 className="w-4 h-4" />
        Fullscreen
      </button>
    </div>
  );
}
