"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginPlatformAdminAction } from "@/app/schoolbase-admin/actions";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";

export default function PlatformAdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
          action={(formData: FormData) => {
            startTransition(async () => {
              setError(null);
              const result = await loginPlatformAdminAction(formData);
              if (result.error) {
                setError(result.error);
                return;
              }
              router.push("/schoolbase-admin");
              router.refresh();
            });
          }}
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
