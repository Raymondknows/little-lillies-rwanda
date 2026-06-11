import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { verifySignupOtpAction } from "@/app/signup/actions";
import Link from "next/link";

interface VerifySignupPageProps {
  searchParams?: Promise<{ 
    email?: string;
    schoolName?: string;
    slug?: string;
    country?: string;
    adminName?: string;
    password?: string;
  }>;
}

export default async function VerifySignupPage({ searchParams }: VerifySignupPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const adminEmail = String(resolvedSearchParams?.email ?? "");
  const schoolName = String(resolvedSearchParams?.schoolName ?? "");
  const slug = String(resolvedSearchParams?.slug ?? "");
  const country = String(resolvedSearchParams?.country ?? "");
  const adminName = String(resolvedSearchParams?.adminName ?? "");
  const password = String(resolvedSearchParams?.password ?? "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>
        <h1 className="text-center text-xl font-bold">Verify your signup</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Enter the 6-digit code we sent to <strong>{adminEmail || "your email address"}</strong>.
        </p>

        <form action={verifySignupOtpAction} className="mt-8 space-y-4">
          {adminEmail ? (
            <>
              <input name="schoolName" type="hidden" value={schoolName} />
              <input name="slug" type="hidden" value={slug} />
              <input name="country" type="hidden" value={country} />
              <input name="adminName" type="hidden" value={adminName} />
              <input name="adminEmail" type="hidden" value={adminEmail} />
              <input name="password" type="hidden" value={password} />
            </>
          ) : (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
              No signup email was provided in the verification link. Please go back to the <Link href="/signup" className="font-medium text-brand hover:underline">signup page</Link> and try again.
            </div>
          )}

          <label className="block text-sm font-medium">
            Verification code
            <input
              name="otp"
              type="text"
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              autoComplete="one-time-code"
              required
              placeholder="123456"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
            />
          </label>

          <Button type="submit" className="w-full">
            Confirm and create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          If you did not receive a code, return to the <Link href="/signup" className="font-medium text-brand hover:underline">signup page</Link> and try again.
        </p>
      </div>
    </div>
  );
}
