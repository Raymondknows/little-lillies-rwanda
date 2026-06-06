"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      const schoolSlug = formData.get("schoolSlug") as string;

      const res = await fetch("/api/auth/parent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, admissionNo, schoolSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setPending(false);
        return;
      }

      router.push("/parent");
      router.refresh();
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
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      <label className="block text-sm font-medium">
        School slug (optional)
        <input
          name="schoolSlug"
          type="text"
          placeholder="greenfield"
          className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
        />
      </label>
      <label className="block text-sm font-medium">
        Phone (WhatsApp)
        <input
          name="phone"
          type="tel"
          required
          placeholder="+2348098765432"
          className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
        />
      </label>
      <label className="block text-sm font-medium">
        Child admission no.
        <input
          name="admissionNo"
          required
          placeholder="GFA-2041"
          className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
        />
      </label>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "View my child"}
      </Button>
    </form>
  );
}
