"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminPageShell from "@/components/admin-page-shell";
import AdminSkeleton from "@/components/ui/skeleton";
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
      <AdminPageShell
        title="Subscriptions"
        subtitle="Manage school subscriptions and billing"
        actions={
          <>
            <Link href="/schoolbase-admin/schools?status=TRIAL" className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface">
              Trial schools
            </Link>
            <Link href="/schoolbase-admin/support" className="inline-flex items-center justify-center rounded-xl bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0952a4]">
              Billing support
            </Link>
          </>
        }
      >
        <div className="px-3 py-6 sm:px-5">
          <AdminSkeleton />
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Subscriptions"
      subtitle="Manage school subscriptions and billing"
      actions={
        <>
          <Link href="/schoolbase-admin/schools?status=TRIAL" className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface">
            Trial schools
          </Link>
          <Link href="/schoolbase-admin/support" className="inline-flex items-center justify-center rounded-xl bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0952a4]">
            Billing support
          </Link>
        </>
      }
    >
      <div className="px-3 py-6 sm:px-5 space-y-6">
        <SubscriptionsClient schools={schools} payments={payments} />
      </div>
    </AdminPageShell>
  );
}
