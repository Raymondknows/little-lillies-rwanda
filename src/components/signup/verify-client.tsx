"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { ErrorModal } from "@/components/ui/error-modal";
import { verifySignupOtpAction } from "@/app/signup/actions";
import Link from "next/link";

export function VerifySignupClient() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [otp, setOtp] = useState("");

  const adminEmail = searchParams.get("email") || "";
  const schoolName = searchParams.get("schoolName") || "";
  const slug = searchParams.get("slug") || "";
  const country = searchParams.get("country") || "";
  const adminName = searchParams.get("adminName") || "";
  const password = searchParams.get("password") || "";

  useEffect(() => {
    // Auto-focus the OTP input
    const input = document.querySelector('input[name="otp"]') as HTMLInputElement;
    if (input) input.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append("schoolName", schoolName);
      formDataObj.append("slug", slug);
      formDataObj.append("country", country);
      formDataObj.append("adminName", adminName);
      formDataObj.append("adminEmail", adminEmail);
      formDataObj.append("password", password);
      formDataObj.append("otp", otp);

      await verifySignupOtpAction(formDataObj);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError({
        message: errorMessage,
        details: errorMessage.includes("invalid")
          ? "Please check the verification code and try again."
          : errorMessage.includes("expired")
          ? "Your verification code has expired. Please go back and request a new one."
          : errorMessage,
      });
      setIsLoading(false);
    }
  }

  if (!adminEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-8 shadow-sm">
          <div className="mb-6 flex justify-center">
            <AppLogo href="/" size="lg" />
          </div>
          <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
            No signup email was provided in the verification link. Please go back to the{" "}
            <Link href="/signup" className="font-medium text-brand hover:underline">
              signup page
            </Link>{" "}
            and try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>
        <h1 className="text-center text-xl font-bold">Verify your signup</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Enter the 6-digit code we sent to <strong>{adminEmail}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input name="schoolName" type="hidden" value={schoolName} />
          <input name="slug" type="hidden" value={slug} />
          <input name="country" type="hidden" value={country} />
          <input name="adminName" type="hidden" value={adminName} />
          <input name="adminEmail" type="hidden" value={adminEmail} />
          <input name="password" type="hidden" value={password} />

          <label className="block text-sm font-medium">
            Verification code
            <input
              name="otp"
              type="text"
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              autoComplete="one-time-code"
              required
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={isLoading}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm font-mono text-center text-lg letter-spacing-wider disabled:bg-background disabled:text-muted"
            />
          </label>

          <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
            {isLoading ? "Verifying..." : "Confirm and create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          If you did not receive a code, return to the{" "}
          <Link href="/signup" className="font-medium text-brand hover:underline">
            signup page
          </Link>{" "}
          and try again.
        </p>
      </div>

      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Verification Error"
        message={error?.message || ""}
        details={error?.details}
        type="error"
      />
    </div>
  );
}
