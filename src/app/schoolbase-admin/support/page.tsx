"use client";

import SupportRequestsClient from "./support-requests-client";

export default function SupportPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support & Help</h1>
        <p className="mt-1 text-muted">Manage support requests and help tickets</p>
      </div>

      <SupportRequestsClient initialRequests={[]} />
    </div>
  );
}
