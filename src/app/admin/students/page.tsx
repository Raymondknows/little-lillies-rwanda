"use client";

import { getBackendUrl } from "@/lib/backend-url";

import { useEffect, useState } from "react";
import StudentsPageClient from "./students-client";
import SubscriptionModal from "@/components/subscription-modal";

export default function StudentsPage() {
  const [pupils, setPupils] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/students/data`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          
          // Check if subscription is blocked
          if (response.status === 403 && errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
            setSubscriptionBlocked({ reason: errorBody.reason || 'Your school subscription is not active' });
          }
          return;
        }
        const data = await response.json();
        setPupils(data.pupils || []);
        setClasses(data.classes || []);
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} />;
  }

  return <StudentsPageClient pupils={pupils} classes={classes} />;
}
