import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { LoginForm } from "@/components/auth/login-form";
import { getStaffSession, getPlatformAdminSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; signup?: string; reset?: string }>;
}) {
  // Check both staff and platform admin sessions
  const staffSession = await getStaffSession();
  const platformSession = await getPlatformAdminSession();

  // Redirect if already logged in
  if (staffSession) redirect("/admin");
  if (platformSession) redirect("/schoolbase-admin");

  const { next, signup, reset } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>

        <h1 className="text-center text-xl font-bold text-foreground">
          Sign in to SchoolBase
        </h1>

        {reset === "success" ? (
          <div className="mt-4 rounded-3xl border border-green-200 bg-green-50 p-5 text-green-900 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-700" />
              <div>
                <p className="font-semibold">Password reset successful</p>
                <p className="mt-1 text-sm text-green-900/90">
                  Your password has been updated. Sign in with your new password.
                </p>
              </div>
            </div>
          </div>
        ) : signup === "success" ? (
          <div className="mt-4 rounded-3xl border border-green-200 bg-green-50 p-5 text-green-900 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-700" />
              <div>
                <p className="font-semibold">Welcome to SchoolBase!</p>
                <p className="mt-1 text-sm text-green-900/90">
                  Your school has been registered successfully. Sign in with your admin credentials to continue.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <p className="mt-2 text-center text-sm text-muted">
          Sign in to manage your school or platform.
        </p>

        {/* Form automatically routes based on user role */}
        <LoginForm redirectTo="/admin" />

        <div className="mt-4 space-y-2 text-center text-sm">
          <p>
            <a href="/parent/login" className="text-brand hover:underline">
              Parent sign in →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}