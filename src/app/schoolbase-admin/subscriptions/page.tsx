"use client";

import { useEffect, useState } from "react";
import SubscriptionsClient from "./subscriptions-client";
import { getBackendUrl } from "@/lib/backend-url";

export default function SubscriptionsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/schoolbase-admin/api/schools?limit=500`, {
          credentials: "include",
        });
        const data = await res.json();
        setSchools(data.schools || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading schools:", err);
        setLoading(false);
      }
    };
    loadSchools();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="mt-1 text-muted">Manage school subscriptions and billing</p>
      </div>

      <SubscriptionsClient schools={schools} />
    </div>
  );
}
