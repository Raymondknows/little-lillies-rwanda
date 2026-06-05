"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { parentLoginAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function ParentLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-4"
      action={(fd) => {
        startTransition(async () => {
          setError(null);
          const res = await parentLoginAction(fd);
          if (res.error) {
            setError(res.error);
            return;
          }
          router.push("/parent");
          router.refresh();
        });
      }}
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
