"use client";

import { AlertCircle, HelpCircle, X } from "lucide-react";
import { useState } from "react";

type HelpLevel = "basic" | "detailed";

export interface HelpGuideItem {
  title: string;
  description: string;
  example?: string;
  tips?: string[];
}

export interface PageHelpGuide {
  title: string;
  overview: string;
  steps?: string[];
  commonTasks?: HelpGuideItem[];
  faqs?: { question: string; answer: string }[];
  videoUrl?: string;
}

export function UserGuide({ guide }: { guide: PageHelpGuide }) {
  const [isOpen, setIsOpen] = useState(false);
  const [helpLevel, setHelpLevel] = useState<HelpLevel>("basic");

  return (
    <>
      {/* Help Button (Floating) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-colors print:hidden"
        title="Open User Guide"
        aria-label="User guide"
        style={{ backgroundColor: "#0A66C2" }}
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* Modal Overlay */}
      {isOpen && <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)} />}

      {/* Compact Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-[12px] border border-border bg-surface p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">{guide.title}</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-background">
                <X className="h-4 w-4 text-muted" />
              </button>
            </div>
            <p className="text-sm text-muted">{guide.overview}</p>
          </div>
        </div>
      )}
    </>
  );
}
