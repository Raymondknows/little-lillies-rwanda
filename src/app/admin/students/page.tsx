"use client";

import { getBackendUrl } from "@/lib/backend-url";

import { useEffect, useState } from "react";
import StudentsPageClient from "./students-client";
import SubscriptionModal from "@/components/subscription-modal";

export default function StudentsPage() {
  const [pupils, setPupils] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string; schoolName?: string } | null>(null);
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        const [response, verifyResponse] = await Promise.all([
          fetch(`${backendUrl}/api/admin/students/data`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`${backendUrl}/api/admin/verify`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
        ]);

        let schoolNameToUse = "";
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json().catch(() => null);
          if (verifyData?.authenticated && verifyData.session?.schoolId) {
            try {
              const schoolResponse = await fetch(`${backendUrl}/api/admin/school/${verifyData.session.schoolId}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
              });
              if (schoolResponse.ok) {
                const schoolData = await schoolResponse.json().catch(() => null);
                schoolNameToUse = schoolData?.name || "";
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
        const data = await response.json();
        setSchoolName(schoolNameToUse);
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
    return <SubscriptionModal reason={subscriptionBlocked.reason} schoolName={subscriptionBlocked.schoolName || schoolName || 'Your School'} />;
  }

  return <StudentsPageClient pupils={pupils} classes={classes} />;
}
