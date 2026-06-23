"use client";

import { getBackendUrl } from "@/lib/backend-url";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FeesPageClient from "./fees-client";
import SubscriptionModal from "@/components/subscription-modal";

export default function FeesPage() {
  const router = useRouter();
  const [data, setData] = useState<{ invoices: any[]; outstanding: number; terms: any[]; currency: string } | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/fees/data`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          
          // Check if subscription is blocked
          if (response.status === 403 && errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
            setSubscriptionBlocked({ reason: errorBody.reason || 'Your school subscription is not active' });
          } else {
            // For other errors, show as before (though we'll hide them soon)
          }
          return;
        }

        const feesData = await response.json();
        setData({
          invoices: feesData.invoices || [],
          outstanding: feesData.outstanding || 0,
          terms: feesData.terms || [],
          currency: feesData.currency || "NGN",
        });
      } catch (err) {
        console.error("Error loading fees:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleIssueBills = async (termId: string) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/fees/invoices/issue-bills`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to issue bills");
      }

      const result = await response.json();
      console.log("Bills issued:", result);
      router.push(`/admin/fees?success=1&created=${result.created}`);
    } catch (err) {
      console.error("Error issuing bills:", err);
      router.push(`/admin/fees?error=1&errorMessage=${encodeURIComponent(err instanceof Error ? err.message : 'Failed to issue bills')}`);
    }
  };

  const handleSendReminders = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/fees/invoices/send-reminders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reminders");
      }

      const result = await response.json();
      console.log("Reminders sent:", result);
      router.push(`/admin/fees?reminders=1&sent=${result.sent}`);
    } catch (err) {
      console.error("Error sending reminders:", err);
      router.push(`/admin/fees?error=1&errorMessage=${encodeURIComponent(err instanceof Error ? err.message : 'Failed to send reminders')}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-muted">Loading fees data...</div>
      </div>
    );
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} />;
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-muted">No data available</div>
      </div>
    );
  }

  return (
    <FeesPageClient
      invoices={data.invoices}
      outstanding={data.outstanding}
      currency={data.currency}
      terms={data.terms}
      onIssueBills={handleIssueBills}
      onSendReminders={handleSendReminders}
    />
  );
}