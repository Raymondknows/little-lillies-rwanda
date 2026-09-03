"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBackendUrl } from "@/lib/backend-url";

export function ParentLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const phone = formData.get("phone") as string;
      const admissionNo = formData.get("admissionNo") as string;

      const res = await fetch(`${getBackendUrl()}/api/parent/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ CRITICAL: Allow cookies to be set
        body: JSON.stringify({ phone, admissionNo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setPending(false);
        return;
      }

      // Wait for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // ✅ CRITICAL: Use window.location instead of router.push()
      // This ensures the cookie is sent with the request to the server
      // Client-side routing won't send httpOnly cookies to middleware!
      window.location.href = "/parent";
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={handleSubmit}
    >
      {error && (
        <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error border border-error/20">
          {error}
        </p>
      )}
      <label className="block text-sm font-medium text-foreground">
        Phone (WhatsApp)
        <input
          name="phone"
          type="tel"
          required
          placeholder="+250781464730"
          className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </label>
      <label className="block text-sm font-medium text-foreground">
        Child admission no.
        <input
          name="admissionNo"
          required
          placeholder="GFA-2041"
          className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </label>
      <Button type="submit" className="w-full mt-6" disabled={pending}>
        {pending ? "Signing in…" : "View my child"}
      </Button>
    </form>
  );
}
