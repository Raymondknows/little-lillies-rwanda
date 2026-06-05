"use client";

import { Button } from "@/components/ui/button";

interface VideoTutorialDetailsClientProps {
  video: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    category: string;
  };
}

import { useEffect, useState } from "react";

export default function VideoTutorialDetailsClient({ video }: VideoTutorialDetailsClientProps) {
  const [shareLink, setShareLink] = useState(`/video-tutorials/${video.id}`);

  useEffect(() => {
    setShareLink(window.location.href);
  }, []);

  const handleCopy = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-surface p-6 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Share This Tutorial
        </h2>
        <div className="p-4 bg-background rounded-lg border border-border mb-4">
          <p className="text-sm text-muted mb-2">Link:</p>
          <code className="text-sm text-primary break-all">{shareLink}</code>
        </div>
        <Button onClick={handleCopy} className="inline-flex items-center justify-center rounded-lg bg-primary text-white px-4 py-2 font-medium hover:bg-primary/90 transition">
          📋 Copy Link
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          About This Tutorial
        </h2>
        <p className="text-foreground leading-relaxed">{video.description}</p>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-2">
            Ready to use SchoolBase?
          </p>
          <p className="text-sm text-muted mb-3">
            Start using SchoolBase now and give your school the controls it needs.
          </p>
          <Button href="/signup" className="px-5 py-3">
            Get started
          </Button>
        </div>
      </div>
    </>
  );
}
