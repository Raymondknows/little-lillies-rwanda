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
        className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-colors"
        title="Open User Guide"
        aria-label="User guide"
        style={{ backgroundColor: "#0A66C2" }}
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      {/* Guide Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto border-l border-border bg-surface shadow-2xl">
          <div className="sticky top-0 border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Help & Guide</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-background rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Help Level Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setHelpLevel("basic")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  helpLevel === "basic"
                    ? "bg-primary text-white"
                    : "bg-background text-muted hover:bg-border"
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setHelpLevel("detailed")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  helpLevel === "detailed"
                    ? "bg-primary text-white"
                    : "bg-background text-muted hover:bg-border"
                }`}
              >
                Detailed
              </button>
            </div>

            {/* Overview */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{guide.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{guide.overview}</p>
            </div>

            {/* Steps */}
            {guide.steps && helpLevel === "detailed" && (
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Quick Steps
                </h4>
                <ol className="space-y-2">
                  {guide.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <p className="text-sm text-muted leading-relaxed pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Common Tasks */}
            {guide.commonTasks && helpLevel === "detailed" && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">Common Tasks</h4>
                <div className="space-y-3">
                  {guide.commonTasks.map((task, index) => (
                    <div key={index} className="rounded-lg border border-border bg-background p-3">
                      <h5 className="font-semibold text-sm text-foreground">{task.title}</h5>
                      <p className="mt-1 text-xs text-muted">{task.description}</p>
                      {task.tips && (
                        <ul className="mt-2 space-y-1">
                          {task.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-xs text-muted flex gap-1">
                              <span>•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {task.example && (
                        <p className="mt-2 rounded bg-foreground/5 px-2 py-1 text-xs font-mono text-muted">
                          {task.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {guide.faqs && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">FAQs</h4>
                <div className="space-y-3">
                  {guide.faqs.map((faq, index) => (
                    <details key={index} className="group rounded-lg border border-border p-3">
                      <summary className="cursor-pointer font-semibold text-sm text-foreground hover:text-primary transition-colors">
                        {faq.question}
                      </summary>
                      <p className="mt-2 text-xs text-muted leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Video Link */}
            {guide.videoUrl && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                <p className="text-xs text-muted">📹 Watch tutorial:</p>
                <a
                  href={guide.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm text-primary hover:underline"
                >
                  View Tutorial →
                </a>
              </div>
            )}

            {/* Video Library Link */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs text-muted mb-2">🎬 Browse all tutorials:</p>
              <a
                href="/video-tutorials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-sm text-primary hover:underline"
              >
                Video Library →
              </a>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted">
                💡 <strong>Pro Tip:</strong> Click the help button on any page to see guide specific to that section.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
