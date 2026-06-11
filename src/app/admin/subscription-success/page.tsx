import { Suspense } from "react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";

async function ActivateSchoolServer({ reference }: { reference: string }) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (process.env.NODE_ENV === 'production' ? 'https://www.schoolbase.live' : 'http://localhost:3000');
    const response = await fetch(`${appUrl}/api/paystack/verify-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });

    const data = await response.json();
    if (!data.success) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">Verification Failed</h2>
          <p className="mt-2 text-sm text-red-800">{data.error || "Could not verify payment"}</p>
          <Button href="/login" className="mt-4">
            Return to Login
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-900">Payment Confirmed!</h2>
              <p className="mt-1 text-sm text-green-800">
                Your subscription is now active. {data.school?.name} is ready to use.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-foreground">Plan Details</p>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">School:</span>
              <span className="font-medium">{data.school?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Plan:</span>
              <span className="font-medium">{data.school?.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status:</span>
              <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                {data.school?.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/admin" className="flex-1">
            Go to Dashboard
          </Button>
          <Button href="/" variant="secondary" className="flex-1">
            Back to Home
          </Button>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">Error</h2>
        <p className="mt-2 text-sm text-red-800">
          {err instanceof Error ? err.message : "An error occurred while verifying your payment"}
        </p>
        <Button href="/login" className="mt-4">
          Return to Login
        </Button>
      </div>
    );
  }
}

export default function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: { reference?: string };
}) {
  const reference = searchParams.reference;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <AppLogo />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Subscription Activation</h1>
            <p className="mt-2 text-sm text-muted">Processing your payment and activating your school...</p>
          </div>

          {reference ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand"></div>
                    <p className="mt-4 text-sm text-muted">Verifying your payment...</p>
                  </div>
                </div>
              }
            >
              <ActivateSchoolServer reference={reference} />
            </Suspense>
          ) : (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
              <h2 className="text-lg font-semibold text-yellow-900">Missing Payment Reference</h2>
              <p className="mt-2 text-sm text-yellow-800">
                Unable to verify payment. Please contact support if you believe this is an error.
              </p>
              <Button href="/login" className="mt-4">
                Return to Login
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
