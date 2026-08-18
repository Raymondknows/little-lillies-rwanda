"use client";

import { useEffect, useState } from "react";
import ResultsPageClient from "./results-client";
import AdminSkeleton from "@/components/ui/skeleton";
import { useAssessmentData } from "@/lib/hooks/useAssessmentData";
import SubscriptionModal from "@/components/subscription-modal";
import { getBackendUrl } from "@/lib/backend-url";

export default function ResultsPage() {
  const backendUrl = getBackendUrl();
  const { data, loading, error, subscriptionBlocked } = useAssessmentData({
    endpoint: `${backendUrl}/api/admin/results/data`,
  });

  const assessments = data?.assessments || [];
  const sessions = data?.sessions || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSkeleton />
      </div>
    );
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} schoolName={subscriptionBlocked.schoolName || 'Your School'} />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">Error: {error}</p>
      </div>
    );
  }

  return <ResultsPageClient assessments={assessments} sessions={sessions} />;
}
