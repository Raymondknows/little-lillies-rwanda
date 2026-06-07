"use client";

export default function PaymentWebhooksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment Webhooks</h1>
        <p className="mt-1 text-muted">
          Monitor payment events and webhook status.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-muted">Payment webhook interface loading...</p>
        <p className="mt-2 text-sm text-muted">View recent payment events and webhook logs coming soon.</p>
      </div>
    </div>
  );
}
