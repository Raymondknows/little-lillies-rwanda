import { redirect } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { ParentLoginForm } from "@/components/auth/parent-login-form";
import { getParentSession } from "@/lib/auth";

export default async function ParentLoginPage() {
  const session = await getParentSession();
  if (session) redirect("/parent");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>
        <h1 className="text-center text-xl font-bold">Parent sign in</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Use the phone number and child&apos;s admission number from the
          school. Add the school slug if you are using a specific campus.
        </p>
        <ParentLoginForm />
        <p className="mt-2 text-center text-sm">
          <a href="/login" className="text-brand hover:underline">
            Staff sign in →
          </a>
        </p>
      </div>
    </div>
  );
}
