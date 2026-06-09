import { Suspense } from "react";
import SubscriptionsClient from "./subscriptions-client";

export default function SubscriptionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="mt-1 text-muted">Manage school subscriptions and billing</p>
      </div>

      <Suspense fallback={<div className="text-center py-8 text-muted">Loading subscriptions...</div>}>
        <SubscriptionsClient schools={[]} />
      </Suspense>
    </div>
  );
}
