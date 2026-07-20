"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    const normalizedStatus = (schoolStatus || "").toUpperCase();
    if (normalizedStatus === "PENDING" || normalizedStatus === "TRIAL") {
      const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));
      if (!isAllowed) {
        setIsOpen(true);
      }
    }
  }, [schoolStatus, pathname]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <h2 className="text-xl font-bold text-foreground">Complete Setup & Payment Required</h2>
        <p className="mt-3 text-sm text-muted">
          {schoolName || "Your school"} account is pending setup and payment. You need to:
        </p>

        <ol className="mt-4 space-y-2 text-sm text-muted">
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

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleGoToSetup}
            className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
          >
            Go to Setup
          </button>
          <button
            onClick={handleGoToSubscribe}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface"
          >
            Go to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
