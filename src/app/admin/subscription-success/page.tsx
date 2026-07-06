import { Suspense } from "react";
import { Button } from "@/components/ui/button";

async function ActivateSchoolServer({ reference }: { reference: string }) {
  try {
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3006";
    const response = await fetch(`${backendUrl}/api/paystack/verify-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });

    const data = await response.json();
    if (!data.success) {
      return (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-red-900">Verification Failed</h2>
          <p className="mt-3 text-sm text-red-800">{data.error || "Could not verify payment."}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button href="/admin" className="w-full">
              Go to Dashboard
            </Button>
            <Button href="/admin/subscribe" variant="secondary" className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
              <span className="text-xl">✓</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-900">Subscription Activated</h2>
              <p className="mt-2 text-sm text-green-800">
                Your payment has been confirmed and your school can now access SchoolBase.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">School</p>
            <p className="mt-2 font-medium text-foreground">{data.school?.name || "—"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Plan</p>
            <p className="mt-2 font-medium text-foreground">{data.school?.plan || "—"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Status</p>
            <p className="mt-2 font-medium text-foreground">{data.school?.status || "—"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Reference</p>
            <p className="mt-2 font-medium text-foreground break-all">{data.reference || reference}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button href="/admin" className="w-full">
            Go to Dashboard
          </Button>
          <Button href="/admin/subscription" variant="secondary" className="w-full">
            Manage Subscription
          </Button>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-red-900">Error</h2>
        <p className="mt-3 text-sm text-red-800">
          {err instanceof Error ? err.message : "An error occurred while verifying your payment."}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button href="/admin" className="w-full">
            Go to Dashboard
          </Button>
          <Button href="/admin/subscribe" variant="secondary" className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
}

export default function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: {
    reference?: string;
    tx_ref?: string;
    flw_ref?: string;
    transaction_id?: string;
    status?: string;
  };
}) {
  const reference =
    searchParams.reference ||
    searchParams.tx_ref ||
    searchParams.flw_ref ||
    searchParams.transaction_id;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10">
      <div className="rounded-3xl border border-border bg-surface p-10 shadow-sm">
        {reference ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-border border-t-brand"></div>
                  <p className="mt-4 text-sm text-muted">Verifying your payment...</p>
                </div>
              </div>
            }
          >
            <ActivateSchoolServer reference={reference} />
          </Suspense>
        ) : (
          <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-8">
            <h2 className="text-xl font-semibold text-yellow-900">Missing Payment Reference</h2>
            <p className="mt-3 text-sm text-yellow-800">
              We could not detect a valid payment reference in the URL. Please return to the subscription page and try again, or contact support if this persists.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button href="/admin/subscribe" className="w-full">
                Return to Subscription
              </Button>
              <Button href="/admin" variant="secondary" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
