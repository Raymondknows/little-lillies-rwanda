"use client";

import SettingsPageClient from "./settings-client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch school data from the API
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3006";
        const schoolRes = await fetch(`${backendUrl}/api/admin/school`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!schoolRes.ok) {
          throw new Error(`Failed to fetch school: ${schoolRes.status}`);
        }
        const schoolData = await schoolRes.json();
        setSchool(schoolData.school || schoolData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading settings:", err);
        setError(err instanceof Error ? err.message : "Failed to load settings");
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!school) {
    return <div className="p-6 text-red-600">No school data available</div>;
  }

  return (
    <SettingsPageClient
      school={school}
      staff={[]}
      paystackConfigured={Boolean(
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      )}
      whatsappConfigured={false}
      isOnboarding={false}
    />
  );
}
