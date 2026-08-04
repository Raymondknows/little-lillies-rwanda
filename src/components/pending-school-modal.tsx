"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { playCloseTone, playOpenTone } from "@/lib/sounds";

interface PendingSchoolModalProps {
  schoolStatus?: string;
  schoolName?: string;
}

export default function PendingSchoolModal({ schoolStatus, schoolName }: PendingSchoolModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // List of allowed paths for onboarding schools
  const allowedPaths = ["/admin/getting-started", "/admin/settings", "/admin/subscribe", "/auth/logout"];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wasDismissed = sessionStorage.getItem("pendingSchoolModalDismissed") === "true";
    if (wasDismissed) return;

    const normalizedStatus = (schoolStatus || "").toUpperCase();
    if (normalizedStatus === "PENDING" || normalizedStatus === "TRIAL") {
      const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));
      if (!isAllowed) {
        setIsOpen(true);
      }
    }
  }, [schoolStatus, pathname]);

  useEffect(() => {
    if (isOpen) {
      playOpenTone();
    }
  }, [isOpen]);

  const dismissModal = () => {
    playCloseTone();
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingSchoolModalDismissed", "true");
    }
  };

  if (!isOpen || !schoolStatus || !["PENDING", "TRIAL"].includes(schoolStatus.toUpperCase())) return null;

  const handleGoToSetup = () => {
    setIsOpen(false);
    router.push("/admin/getting-started");
  };

  const handleGoToSubscribe = () => {
    setIsOpen(false);
    router.push("/admin/subscribe");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <style>{`
        @keyframes pending_school_modal_enter { from { transform: translateY(24px) scale(.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
      `}</style>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(10,102,194,0.16)]" style={{ animation: `pending_school_modal_enter 320ms cubic-bezier(.2,.9,.2,1)` }}>
        <div className="border-b border-slate-100 px-6 py-5" style={{ background: "linear-gradient(90deg, rgba(10,102,194,0.12), rgba(10,102,194,0.04))" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Complete Setup & Payment Required</h2>
              <p className="mt-1 text-sm text-muted">
                {schoolName || "Your school"} account is pending setup and payment. You need to:
              </p>
            </div>
            <button
              type="button"
              onClick={dismissModal}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-background transition-colors"
              aria-label="Close setup notice"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <ol className="mt-2 space-y-2 text-sm text-muted">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                1
              </span>
              <span>Set your school location and currency in <strong>Settings</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                2
              </span>
              <span>Select a plan and complete payment in <strong>Subscription</strong></span>
            </li>
          </ol>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleGoToSetup}
              className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 transition-colors"
            >
              Go to Setup
            </button>
            <button
              onClick={handleGoToSubscribe}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
            >
              Go to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
