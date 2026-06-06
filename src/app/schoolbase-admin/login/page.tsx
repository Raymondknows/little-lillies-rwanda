"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";

export default function PlatformAdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setPending(false);
        return;
      }

      router.push("/schoolbase-admin");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-lg shadow-slate-200/50">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <AppLogo href="/" size="lg" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">SchoolBase Admin sign in</h1>
            <p className="mt-2 text-sm text-muted">
              Secure platform owner access to manage schools, subscriptions, and onboarding.
            </p>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          {error ? (
            <p className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </p>
          ) : null}

          <label className="block text-sm font-medium text-foreground">
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="admin@schoolbase.com"
              className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Password
            <input
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <div className="text-right text-sm">
            <a href="/forgot-password" className="text-brand hover:underline">Forgot password?</a>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 rounded-3xl bg-brand/5 p-4 text-sm text-foreground">
          <p className="font-semibold">Platform owner access</p>
        </div>
      </div>
    </div>
  );
}
