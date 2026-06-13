"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { ErrorModal } from "@/components/ui/error-modal";

export default function SignupSuccessPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);

  const handleDone = () => {
    setShowModal(false);
    // Redirect to login after a brief delay
    setTimeout(() => {
      router.push("/login?signup=success");
    }, 300);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold">Setting up your account...</h1>
          <p className="mt-2 text-sm text-muted">
            Redirecting you to login...
          </p>
        </div>
      </div>

      <ErrorModal
        isOpen={showModal}
        onClose={handleDone}
        title="School Created Successfully!"
        message="Your school account has been created and is ready to use. You'll now be able to log in with your email and password."
        type="success"
      />
    </div>
  );
}
