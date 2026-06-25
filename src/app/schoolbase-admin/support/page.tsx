"use client";

import SupportRequestsClient from "./support-requests-client";

export default function SupportPage() {
  return (
    <div className="px-3 py-6 sm:px-5">
      <SupportRequestsClient initialRequests={[]} />
    </div>
  );
}
