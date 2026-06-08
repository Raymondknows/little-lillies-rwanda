"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);

    try {
      // ✅ FIX: Reliable value extraction
      const form = e.currentTarget;
      const email = (form.elements.namedItem("email") as HTMLInputElement).value;
      const password = (form.elements.namedItem("password") as HTMLInputElement).value;

      console.log('=== LOGIN FORM SUBMIT ===');
      console.log('Email:', email);
      console.log('Password length:', password.length);

      // ✅ Call local proxy route (sets cookie server-side)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ CRITICAL: Allow cookies to be set
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log('=== LOGIN RESPONSE ===');
      console.log('Status:', res.status);
      console.log('Data:', data);

      // ✅ FIX: Correct backend response handling
      if (!res.ok) {
        setError(data.error || "Login failed");
        setPending(false);
        return;
      }

      setNotice("Login successful. Redirecting...");

      // ✅ Token is set in cookie by /api/auth/login (httpOnly cookie can't be accessed from JS)
      // Wait a moment to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Performing full page redirect to:', redirectTo);
      
      // ✅ CRITICAL: Use window.location instead of router.push()
      // This ensures the cookie is sent with the request to the server
      // Client-side routing won't send httpOnly cookies to middleware!
      window.location.href = redirectTo;
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </label>

      <div className="text-right text-sm">
        <a href="/forgot-password" className="text-brand hover:underline">
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}