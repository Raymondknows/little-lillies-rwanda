"use client";

import { Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface VideoTutorialDetailsClientProps {
  video: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    category: string;
  };
}

export default function VideoTutorialDetailsClient({ video }: VideoTutorialDetailsClientProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setShareUrl(window.location.href);
    setCanShare(typeof navigator.share === "function");
  }, []);

  const handleCopy = () => {
    if (typeof window === "undefined") return;

    const urlToCopy = shareUrl || window.location.href;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof window === "undefined" || !canShare) return;

    try {
      await navigator.share({
        title: video.title,
        text: video.description,
        url: shareUrl || window.location.href,
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Share Section */}
      <div className="rounded-xl bg-gradient-to-br from-brand/5 to-transparent border border-brand/10 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-brand" />
          Share This Tutorial
        </h3>
        
        <div className="space-y-3">
          {/* Share Link */}
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 truncate font-mono text-xs">
              {shareUrl || "Loading link..."}
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 flex-shrink-0 ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {canShare && (
            <button
              onClick={handleShare}
              className="w-full px-4 py-3 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Tutorial
            </button>
          )}
        </div>
      </div>

      {/* Meta Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
            Category
          </p>
          <p className="text-base font-semibold text-slate-900">
            {video.category}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
            Type
          </p>
          <p className="text-base font-semibold text-slate-900">
            Video Tutorial
          </p>
        </div>
      </div>
    </div>
  );
}
