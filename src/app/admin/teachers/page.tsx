"use client";

import { getBackendUrl } from "@/lib/backend-url";
import { useEffect, useState } from "react";
import TeachersPageClient from "./teachers-client";
import SubscriptionModal from "@/components/subscription-modal";

export default function AdminTeachersPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/teachers/data`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          // Check for subscription blocking
          if (response.status === 403) {
            const errorBody = await response.json().catch(() => null);
            if (errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
              setSubscriptionBlocked({ reason: errorBody.reason || 'Your school subscription is not active' });
              setLoading(false);
              return;
            }
          }
          throw new Error(`Failed to fetch teachers data: ${response.status}`);
        }
        const data = await response.json();
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
        setTeachers(data.teachers || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching teachers data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted">Loading teachers...</p>
      </div>
    );
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">Error: {error}</p>
      </div>
    );
  }

  return <TeachersPageClient classes={classes} subjects={subjects} teachers={teachers} />;
}
