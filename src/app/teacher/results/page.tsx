"use client";

import { useEffect, useState } from "react";
import TeacherResultsEnhancedClient from "./results-client";
import { useAssessmentData } from "@/lib/hooks/useAssessmentData";

export default function ResultsPage() {
  const { data, loading, error } = useAssessmentData({
    endpoint: "/api/teacher/assessments",
  });

  const assessments = data?.assessments || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">Error: {error}</p>
      </div>
    );
  }

  return <TeacherResultsEnhancedClient assessments={assessments} />;
}
