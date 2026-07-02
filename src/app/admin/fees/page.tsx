"use client";

import { getBackendUrl } from "@/lib/backend-url";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/icons";
import FeesPageClient from "./fees-client";
import AdminSkeleton from "@/components/ui/skeleton";
import SubscriptionModal from "@/components/subscription-modal";

export default function FeesPage() {
  const router = useRouter();
  const [data, setData] = useState<{ invoices: any[]; outstanding: number; terms: any[]; currency: string } | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string; schoolName?: string } | null>(null);
  const [schoolName, setSchoolName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [whatsAppConnected, setWhatsAppConnected] = useState<boolean | null>(null);
  const [whatsAppStatusMessage, setWhatsAppStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const backendUrl = getBackendUrl();
        const [response, verifyResponse] = await Promise.all([
          fetch(`${backendUrl}/api/admin/fees/data`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${backendUrl}/api/admin/verify`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        let schoolNameToUse = '';
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json().catch(() => null);
          if (verifyData?.authenticated && verifyData.session?.schoolId) {
            try {
              const schoolRes = await fetch(`${backendUrl}/api/admin/school/${verifyData.session.schoolId}`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              });
              if (schoolRes.ok) {
                const schoolData = await schoolRes.json().catch(() => null);
                schoolNameToUse = schoolData?.name || '';
              }
            } catch (err) {
              console.error("Error fetching school name:", err);
            }
          }
        }

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);

          if (response.status === 403 && errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
            setSubscriptionBlocked({
              reason: errorBody.reason || 'Your school subscription is not active',
              schoolName: schoolNameToUse || undefined,
            });
            setSchoolName(schoolNameToUse);
          }
          return;
        }

        const feesData = await response.json();
        setSchoolName(schoolNameToUse);
        setData({
          invoices: feesData.invoices || [],
          outstanding: feesData.outstanding || 0,
          terms: feesData.terms || [],
          currency: feesData.currency || "NGN",
        });

        try {
            const whatsappRes = await fetch(`/api/admin/whatsapp/status`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          if (whatsappRes.ok) {
            const whatsappData = await whatsappRes.json();
            setWhatsAppConnected(whatsappData?.session?.status === 'connected');
            setWhatsAppStatusMessage(whatsappData?.session?.statusMessage || whatsappData?.session?.status || null);
          } else {
            setWhatsAppConnected(false);
            setWhatsAppStatusMessage('Unable to retrieve WhatsApp status.');
          }
        } catch (err) {
          console.error("Error loading WhatsApp status:", err);
          setWhatsAppConnected(false);
          setWhatsAppStatusMessage('Unable to retrieve WhatsApp status.');
        }
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
      <div className="min-h-screen bg-background">
        <AdminSkeleton />
      </div>
    );
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} schoolName={subscriptionBlocked.schoolName || schoolName || 'Your School'} />;
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
      whatsAppConnected={whatsAppConnected}
      whatsAppStatusMessage={whatsAppStatusMessage}
    />
  );
}