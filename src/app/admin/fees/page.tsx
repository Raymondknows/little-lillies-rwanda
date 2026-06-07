"use client";

import { useEffect, useState } from "react";
import FeesPageClient from "./fees-client";

export default function FeesPage() {
  const [data, setData] = useState<{ invoices: any[]; outstanding: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/fees/data", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch fees data");
        }

        const feesData = await response.json();
        setData({
          invoices: feesData.invoices || [],
          outstanding: feesData.outstanding || 0,
        });
      } catch (err) {
        console.error("Error loading fees:", err);
        setError("Failed to load fees data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-muted">Loading fees data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-muted">No data available</div>
      </div>
    );
  }

  return <FeesPageClient invoices={data.invoices} outstanding={data.outstanding} />;
}
