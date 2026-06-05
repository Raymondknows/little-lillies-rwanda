import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/app/auth/actions";

interface ResetPageProps {
  searchParams?: Promise<{ token?: string; email?: string; error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPageProps) {
  const resolved = searchParams ? await searchParams : undefined;
  const token = String(resolved?.token ?? "");
  const email = String(resolved?.email ?? "");
  const error = String(resolved?.error ?? "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>
        <h1 className="text-center text-xl font-bold">Reset your password</h1>
        <p className="mt-2 text-center text-sm text-muted">Choose a new password for your account.</p>

        {error && (
          <div className="mt-4 rounded-lg bg-error/10 p-4 text-error text-sm">
            <p className="font-semibold">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <form action={resetPasswordAction} className="mt-8 space-y-4">
          <input name="token" type="hidden" value={token} />
          <input name="email" type="hidden" value={email} />

          <label className="block text-sm font-medium">
            New password
            <input name="password" type="password" required minLength={8} placeholder="Choose a secure password" className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm" />
          </label>

          <Button type="submit" className="w-full">Set new password</Button>
        </form>
      </div>
    </div>
  );
}
