import { redirect } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { ParentLoginForm } from "@/components/auth/parent-login-form";
import { getParentSession } from "@/lib/auth";

export default async function ParentLoginPage() {
  const session = await getParentSession();
  if (session) redirect("/parent");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface/80 backdrop-blur-sm p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" showSpinner />
        </div>
        <h1 className="text-center text-2xl font-bold">Parent sign in</h1>
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
