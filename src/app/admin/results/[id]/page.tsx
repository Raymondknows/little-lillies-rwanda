"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table2, ChevronRight } from "lucide-react";
import { AssessmentScores } from "@/components/admin/assessment-scores";

interface Assessment {
  id: string;
  name: string;
  phase: string;
  status: string;
  publishedAt?: string;
  term: {
    name: string;
  };
  results: Array<{
    pupilId: string;
    caScore: number | null;
    testScore: number | null;
    examScore: number | null;
    totalScore: number | null;
    pupil: { id: string; name: string };
  }>;
  _count: { results: number };
}

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/results/${id}`);
        if (!response.ok) throw new Error("Failed to fetch assessment");
        const data = await response.json();
        setAssessment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleApprove = async () => {
    if (!assessment) return;
    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/assessments/${id}/approve`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to approve");
      const updated = await response.json();
      setAssessment(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!assessment) return;
    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/assessments/${id}/publish`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to publish");
      const updated = await response.json();
      setAssessment(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnDraft = async () => {
    if (!assessment) return;
    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/assessments/${id}/return-draft`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to return to draft");
      const updated = await response.json();
      setAssessment(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to return to draft");
    } finally {
      setActionLoading(false);
    }
  };

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
        <Link href="/admin/results" className="text-sm font-medium text-brand hover:underline">
          ← Results
        </Link>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-muted">{error || "Assessment not found"}</p>
        </div>
      </div>
    );
  }

  const pupils = Array.from(
    new Map(assessment.results.map((r) => [r.pupil.id, r.pupil])).values()
  );
  const existingResults = assessment.results.reduce(
    (acc, r) => {
      acc[r.pupilId] = r;
      return acc;
    },
    {} as Record<string, any>
  );

  return (
    <div className="mx-auto max-w-6xl px-3 py-4">
      <Link href="/admin/results" className="text-sm font-medium text-brand hover:underline">
        ← Results
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{assessment.name}</h1>
          <p className="text-muted">{assessment.term.name}</p>
        </div>
        <Badge
          variant={
            assessment.status === "PUBLISHED" ? "success" : assessment.status === "APPROVED" ? "brand" : "default"
          }
        >
          {assessment.status}
        </Badge>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {assessment.status === "DRAFT" && pupils.length > 0 && (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Enter Assessment Scores</h2>
            <p className="text-sm text-muted">CA (20%) + Test (30%) + Exam (50%) = Total</p>
          </div>
          <AssessmentScores
            assessmentId={id}
            pupils={pupils}
            existingResults={existingResults}
          />
        </div>
      )}

      {assessment.status === "PUBLISHED" && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700 font-medium">✓ Published to Parents</p>
          <p className="text-sm text-green-600 mt-1">
            Results were published on{" "}
            {new Date(assessment.publishedAt || "").toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Management Actions */}
      <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-4">
        {assessment.status === "DRAFT" && (
          <Button
            onClick={handleApprove}
            disabled={actionLoading || pupils.length === 0}
            variant="secondary"
          >
            {actionLoading ? "Approving..." : "Mark Ready to Publish"}
          </Button>
        )}

        {assessment.status === "APPROVED" && (
          <>
            <Button onClick={handlePublish} disabled={actionLoading}>
              {actionLoading ? "Publishing..." : "Publish to Parents"}
            </Button>
            <Button
              onClick={handleReturnDraft}
              disabled={actionLoading}
              variant="secondary"
            >
              {actionLoading ? "Returning..." : "Return to Draft"}
            </Button>
          </>
        )}

        <Link href={`/admin/results/${id}/broadsheet`}>
          <Button variant="secondary">
            <Table2 className="mr-2 h-4 w-4" />
            View Broadsheet
          </Button>
        </Link>
      </div>

      {/* Results Summary */}
      {pupils.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Scores Entered</h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium sm:px-4">Student</th>
                  <th className="px-3 py-2 font-medium text-center sm:px-4">CA</th>
                  <th className="px-3 py-2 font-medium text-center sm:px-4">Test</th>
                  <th className="px-3 py-2 font-medium text-center sm:px-4">Exam</th>
                  <th className="px-3 py-2 font-medium text-center sm:px-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {pupils.map((pupil) => {
                  const result = existingResults[pupil.id];
                  return (
                    <tr key={pupil.id} className="border-t border-border hover:bg-background/50">
                      <td className="px-3 py-2 font-medium sm:px-4">{pupil.name}</td>
                      <td className="px-3 py-2 text-center sm:px-4">{result?.caScore ?? "—"}</td>
                      <td className="px-3 py-2 text-center sm:px-4">{result?.testScore ?? "—"}</td>
                      <td className="px-3 py-2 text-center sm:px-4">{result?.examScore ?? "—"}</td>
                      <td className="px-3 py-2 text-center font-semibold sm:px-4">
                        {result?.totalScore ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
