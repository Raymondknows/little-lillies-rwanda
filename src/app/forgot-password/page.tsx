import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { requestPasswordResetAction } from "@/app/auth/actions";

interface ForgotPasswordPageProps {
  searchParams?: Promise<{ sent?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const resolved = searchParams ? await searchParams : undefined;
  const sent = resolved?.sent === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>
        <h1 className="text-center text-xl font-bold">Forgot your password?</h1>
        {sent ? (
          <div className="mt-4 rounded-lg bg-success/10 p-4 text-success text-sm">
            <p className="font-semibold">Check your email</p>
            <p className="mt-1">We sent a password reset link. It expires in 1 hour.</p>
          </div>
        ) : (
          <p className="mt-2 text-center text-sm text-muted">Enter the email for your SchoolBase account and we'll send a secure reset link.</p>
        )}

        {!sent && (
          <form action={requestPasswordResetAction} className="mt-8 space-y-4">
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required placeholder="you@example.com" className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm" />
            </label>

            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        )}
      </div>
    </div>
  );
}
