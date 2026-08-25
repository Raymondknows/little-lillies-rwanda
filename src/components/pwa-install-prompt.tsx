"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const updateInstalledState = () => setInstalled(isStandalone());
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setShowInstructions(false);
    };

    updateInstalledState();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.matchMedia("(display-mode: standalone)").addEventListener("change", updateInstalledState);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("PWA service worker registration failed:", error);
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.matchMedia("(display-mode: standalone)").removeEventListener("change", updateInstalledState);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (!installEvent) {
      setShowInstructions(true);
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={install}
        className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/40 print:hidden"
        aria-label="Install SchoolBase app"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Install app
      </button>

      {showInstructions ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/30 p-4 sm:items-center print:hidden">
          <div className="relative w-full max-w-sm rounded-xl bg-surface p-5 shadow-2xl ring-1 ring-border">
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-muted hover:bg-background hover:text-foreground"
              aria-label="Close install instructions"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <h2 className="pr-8 text-base font-semibold text-foreground">Install SchoolBase</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use your browser&apos;s menu and choose <strong className="text-foreground">Add to Home Screen</strong> or <strong className="text-foreground">Install app</strong>.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
