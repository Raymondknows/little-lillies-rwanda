import { Suspense } from "react";
import SupportRequestsClient from "./support-requests-client";

async function fetchSupportRequests() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
    const response = await fetch(`${backendUrl}/api/schoolbase-admin/support`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch support requests:', response.status);
      return [];
    }

    const data = await response.json();
    return data.supportRequests || [];
  } catch (error) {
    console.error('Error fetching support requests:', error);
    return [];
  }
}

export default async function SupportPage() {
  const initialRequests = await fetchSupportRequests();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support & Help</h1>
        <p className="mt-1 text-muted">Manage support requests and help tickets</p>
      </div>

      <Suspense fallback={<div className="text-center py-8 text-muted">Loading support requests...</div>}>
        <SupportRequestsClient initialRequests={initialRequests} />
      </Suspense>
    </div>
  );
}
