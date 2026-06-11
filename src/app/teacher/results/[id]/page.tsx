"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { resultStatusLabel } from "@/lib/format";

interface AssessmentResult {
  pupilId: string;
  pupilName: string;
  admissionNo: string;
  caScore: number | null;
  testScore: number | null;
  examScore: number | null;
  totalScore: number | null;
  grade: string | null;
}

interface Assessment {
  id: string;
  name: string;
  phase: string;
  status: string;
  results: AssessmentResult[];
}

export default function TeacherAssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teacher/assessments/${id}`);
        if (!response.ok) throw new Error("Failed to fetch assessment");
        const data = await response.json();
        setAssessment(data.assessment);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <div className="text-center text-muted">Loading assessment details...</div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <Link href="/teacher/results" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          <ChevronLeft className="w-4 h-4" />
          Results
        </Link>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-muted">{error || "Assessment not found"}</p>
        </div>
      </div>
    );
  }

  const isPublished = assessment.status === "PUBLISHED";
  const hasResults = assessment.results && assessment.results.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-3 py-4">
      <Link href="/teacher/results" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline mb-4">
        <ChevronLeft className="w-4 h-4" />
        Results
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{assessment.name}</h1>
          <p className="text-sm text-muted mt-1">Phase: {assessment.phase}</p>
        </div>
        <Badge
          variant={
            isPublished ? "success" : assessment.status === "APPROVED" ? "brand" : "default"
          }
        >
          {resultStatusLabel(assessment.status as any)}
        </Badge>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isPublished && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-6">
          <p className="text-sm text-green-700 font-medium">✓ Published to Parents</p>
          <p className="text-sm text-green-600 mt-1">
            Results have been published and are visible to parents.
          </p>
        </div>
      )}

      {/* Results Table */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium text-center">CA</th>
                <th className="px-4 py-3 font-medium text-center">Test</th>
                <th className="px-4 py-3 font-medium text-center">Exam</th>
                <th className="px-4 py-3 font-medium text-center">Total</th>
                <th className="px-4 py-3 font-medium text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {hasResults ? (
                assessment.results.map((result, index) => (
                  <tr key={`${result.pupilId}-${index}`} className="border-t border-border hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{result.pupilName}</p>
                      <p className="text-xs text-muted">{result.admissionNo}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {result.caScore !== null ? result.caScore : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {result.testScore !== null ? result.testScore : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {result.examScore !== null ? result.examScore : "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-foreground">
                      {result.totalScore !== null ? result.totalScore : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {result.grade || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No results entered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      {hasResults && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs text-muted font-medium">Total Students</p>
            <p className="text-2xl font-bold text-foreground mt-1">{assessment.results.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs text-muted font-medium">Results Entered</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {assessment.results.filter((r) => r.totalScore !== null).length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs text-muted font-medium">Avg. Score</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {assessment.results.length > 0
                ? (
                    assessment.results.reduce((sum, r) => sum + (r.totalScore || 0), 0) /
                    assessment.results.length
                  ).toFixed(1)
                : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs text-muted font-medium">High Score</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {assessment.results.length > 0
                ? Math.max(...assessment.results.map((r) => r.totalScore || 0))
                : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
