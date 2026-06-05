"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { staffLoginAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-4"
      action={(fd) => {
        startTransition(async () => {
          setError(null);
          setNotice(null);
          const res = await staffLoginAction(fd);
          if (res.error) {
            setError(res.error);
            return;
          }
          if (res.verifyEmail) {
            setNotice(res.verifyMessage ?? "Redirecting to verification...");
            router.push(`/signup/verify?email=${encodeURIComponent(res.verifyEmail)}`);
            return;
          }
          router.push(redirectTo);
          router.refresh();
        });
      }}
    >
      {error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {notice}
        </p>
      )}
      <label className="block text-sm font-medium text-foreground">
        Email
        <input
          name="email"
          type="email"
          required
          placeholder="you@schoolbase.live"
          className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-foreground">
        Password
        <div className="relative mt-1">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Enter your password"
            className="w-full rounded-lg border border-border px-3 py-2.5 pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>
      <div className="text-right text-sm">
        <a href="/forgot-password" className="text-brand hover:underline">Forgot password?</a>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
