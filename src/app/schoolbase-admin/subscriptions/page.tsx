"use client";

import { useCallback, useEffect, useState } from "react";
import SubscriptionsClient from "./subscriptions-client";

export default function SubscriptionsPage() {
  const [schools, setSchools] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [schoolsRes, paymentsRes] = await Promise.all([
        fetch(`/schoolbase-admin/api/schools?limit=500`, {
          credentials: "include",
        }),
        fetch(`/schoolbase-admin/api/subscription-payments?limit=100`, {
          credentials: "include",
        }),
      ]);

      const schoolsData = await schoolsRes.json();
      const paymentsData = await paymentsRes.json();

      setSchools(schoolsData.schools || []);
      setPayments(paymentsData.payments || []);
    } catch (err) {
      console.error("Error loading subscriptions data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleFocus = () => {
      loadData();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [loadData]);

  if (loading) {
    return (
      <div className="px-3 py-6 sm:px-5 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-6 sm:px-5 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="mt-1 text-muted">Manage school subscriptions and billing</p>
      </div>

      <SubscriptionsClient schools={schools} payments={payments} />
    </div>
  );
}
