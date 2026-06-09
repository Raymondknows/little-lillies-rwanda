"use client";

import { useState } from "react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { getBackendUrl } from "@/lib/backend-url";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const backendUrl = getBackendUrl();

      const response = await fetch(
        `${backendUrl}/api/admin/request-password-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Failed to send reset link");
        return;
      }

      setSent(true);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>

        <h1 className="text-center text-xl font-bold">
          Forgot your password?
        </h1>

        {sent ? (
          <div className="mt-4 rounded-lg bg-success/10 p-4 text-sm text-success">
            <p className="font-semibold">Check your email</p>
            <p className="mt-1">
              We sent a password reset link. It expires in 1 hour.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-center text-sm text-muted">
            Enter the email for your SchoolBase account and we'll send a secure
            reset link.
          </p>
        )}

        {!sent && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
                {error}
              </div>
            )}

            <label className="block text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
              />
            </label>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </Button>

            <p className="text-center text-sm text-muted">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-brand hover:underline"
              >
                Sign in
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}