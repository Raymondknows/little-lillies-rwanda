"use client";

import { useEffect, useState } from "react";
import { getBackendUrl } from "@/lib/backend-url";
import SupportRequestsClient from "./support-client";
import SubscriptionModal from "@/components/subscription-modal";

export type AdminSupportRequestRow = {
  id: string;
  subject: string;
  message: string;
  response?: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderRole: string;
    senderName: string;
    senderEmail?: string | null;
    body: string;
    createdAt: string;
  }>;
  school: {
    id: string;
    name: string;
    country: string;
  } | null;
};

export default function SupportPage() {
  const [requests, setRequests] = useState<AdminSupportRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<{
    reason?: string;
    schoolName?: string;
  } | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/support/data`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 403) {
          const data = await response.json();
          if (data?.code === 'SUBSCRIPTION_INACTIVE') {
            setSubscriptionError({
              reason: data.reason || 'Your school subscription is not active.',
              schoolName: data.school?.name,
            });
          }
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setRequests(data.supportRequests || []);
        }
      } catch (error) {
        console.error('Failed to fetch support requests:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Requests</h1>
          <p className="mt-1 text-muted">Manage support tickets from parents and staff.</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted">Loading support requests...</p>
        </div>
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support Requests</h1>
            <p className="mt-1 text-muted">Manage support tickets from parents and staff.</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-8 text-center">
            <p className="text-muted">Support requests are not available.</p>
          </div>
        </div>
        <SubscriptionModal reason={subscriptionError.reason} schoolName={subscriptionError.schoolName} />
      </>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support Requests</h1>
        <p className="mt-1 text-muted">Manage support tickets from parents and staff.</p>
      </div>
      {requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted">No support requests yet. Support tickets from parents and staff will appear here.</p>
        </div>
      ) : (
        <SupportRequestsClient initialRequests={requests} />
      )}
    </div>
  );
}
