"use client";

import { useEffect, useState } from "react";
import { getBackendUrl } from "@/lib/backend-url";
import FeeSchedulesPageClient from "./schedules-client";

interface FeeScheduleItem {
  id: string;
  name: string;
  amount: number;
  createdAt: string | Date;
  term: { id: string; name: string; academicYear: { name: string } };
  class?: { id: string; name: string; arm?: string | null } | null;
}

interface TermItem {
  id: string;
  name: string;
  academicYear: { name: string };
}

interface ClassItem {
  id: string;
  name: string;
  arm?: string | null;
}

export default function FeeSchedulesPage() {
  const [data, setData] = useState<{
    feeSchedules: FeeScheduleItem[];
    currency: string;
    terms: TermItem[];
    classes: ClassItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/fees/schedules`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch fee schedules");
        }

        const result = await response.json();
        setData(result);

        // Check for success redirect
        if (new URLSearchParams(window.location.search).get("success") === "1") {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
      } catch (err) {
        console.error("Error fetching fee schedules:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fee Schedules</h1>
          <p className="mt-1 text-gray-600">Manage fee schedules for your school</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <FeeSchedulesPageClient
      feeSchedules={data.feeSchedules}
      currency={data.currency}
      terms={data.terms}
      classes={data.classes}
      success={success}
    />
  );
}
