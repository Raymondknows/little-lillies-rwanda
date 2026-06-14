"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { ErrorModal } from "@/components/ui/error-modal";
import { CheckCircle2 } from "lucide-react";

export default function SignupSuccessPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Small delay to ensure page is mounted before showing modal
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginNow = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/20">
              <CheckCircle2 className="h-8 w-8 text-brand" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-foreground">Account Created!</h1>
          <p className="mt-2 text-sm text-muted">
            Your school account is ready. Click the button below to log in.
          </p>
        </div>
      </div>

      <ErrorModal
        isOpen={showModal}
        onClose={() => {}} // Don't close on backdrop click
        title="School Created Successfully!"
        message="Your school account has been created and is ready to use. Please log in with your email and password to get started."
        type="success"
        onSuccessAction={handleLoginNow}
        action={{
          label: "Back to Signup",
          onClick: () => router.push("/signup"),
        }}
      />
    </div>
  );
}
