"use client";

import { useEffect, useState } from "react";
import ResultsPageClient from "./results-client";

export default function ResultsPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/results/data");
        if (!response.ok) {
          throw new Error(`Failed to fetch results data: ${response.status}`);
        }
        const data = await response.json();
        setAssessments(data.assessments || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching results data:", err);
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

  return <ResultsPageClient assessments={assessments} />;
}
