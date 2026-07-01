"use client";

import SupportRequestsClient from "./support-requests-client";

export default function SupportPage() {
  return (
    <div className="px-3 py-3 sm:px-2">
      <SupportRequestsClient initialRequests={[]} />
    </div>
  );
}
