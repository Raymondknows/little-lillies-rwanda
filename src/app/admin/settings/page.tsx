"use client";

import { useEffect, useState } from "react";
import { getBackendUrl } from "@/lib/backend-url";
import SettingsPageClient from "./settings-client";
import AdminSkeleton from "@/components/ui/skeleton";
import SubscriptionModal from "@/components/subscription-modal";

export default function SettingsPage() {
  const [school, setSchool] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/settings/data`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        let errorBody = null;
        if (!response.ok) {
          errorBody = await response.json().catch(() => null);
        }

        if (response.status === 403) {
          if (errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
            setSubscriptionBlocked({ reason: errorBody.reason || 'Your school subscription is not active' });
            setLoading(false);
            return;
          }
        }

        if (response.status === 401 || response.status === 400) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login?next=/admin/settings';
          }
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(errorBody?.message || 'Failed to load settings');
        }

        const data = await response.json();
        setSchool(data.config);
        setStaff(data.staff || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSkeleton />
      </div>
    );
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} />;
  }

  if (error || !school) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error || "Failed to load school settings"}
        </div>
      </div>
    );
  }

  return (
    <SettingsPageClient
      school={school}
      staff={staff}
      paystackConfigured={school.hasPaystackPublic && school.hasPaystackSecret}
      whatsappConfigured={false}
    />
  );
}
