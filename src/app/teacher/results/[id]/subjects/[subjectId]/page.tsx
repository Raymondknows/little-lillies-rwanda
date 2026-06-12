"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, AlertCircle, CheckCircle } from "lucide-react";

interface ScoreEntry {
  pupilId: string;
  caScore: number | null;
  testScore: number | null;
  examScore: number | null;
}

interface AssessmentResult {
  pupilId: string;
  pupilName: string;
  admissionNo: string;
  caScore: number | null;
  testScore: number | null;
  examScore: number | null;
  totalScore: number | null;
}

interface Assessment {
  id: string;
  name: string;
  phase: string;
  status: string;
  results: AssessmentResult[];
}

export default function TeacherSubjectScoresPage({
  params,
}: {
  params: Promise<{ id: string; subjectId: string }>;
}) {
  const { id, subjectId } = use(params);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [subjectName] = useState<string>(
    typeof subjectId === "string" ? decodeURIComponent(subjectId) : ""
  );

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        // Fetch assessment with subject filter (use subject name)
        const response = await fetch(
          `/api/teacher/assessments/${id}?subject=${encodeURIComponent(subjectName)}`
        );
        if (!response.ok) throw new Error("Failed to fetch assessment");
        const data = await response.json();
        setAssessment(data.assessment);

        // Deduplicate results by pupilId (keep first occurrence)
        const seenPupils = new Set<string>();
        const uniqueResults: AssessmentResult[] = [];
        
        data.assessment.results.forEach((result: AssessmentResult) => {
          if (!seenPupils.has(result.pupilId)) {
            seenPupils.add(result.pupilId);
            uniqueResults.push(result);
          }
        });

        // Extract results and initialize scores
        const initialScores: Record<string, ScoreEntry> = {};
        uniqueResults.forEach((result: AssessmentResult) => {
          initialScores[result.pupilId] = {
            pupilId: result.pupilId,
            caScore: result.caScore,
            testScore: result.testScore,
            examScore: result.examScore,
          };
        });

        setResults(uniqueResults);
        setScores(initialScores);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (subjectName) {
      fetchAssessment();
    }
  }, [id, subjectName]);

  const handleScoreChange = (
    pupilId: string,
    field: "caScore" | "testScore" | "examScore",
    value: string
  ) => {
    setScores((prev) => ({
      ...prev,
      [pupilId]: {
        ...prev[pupilId],
        [field]: value ? parseFloat(value) : null,
      },
    }));
  };

  const calculateTotal = (
    caScore: number | null,
    testScore: number | null,
    examScore: number | null
  ) => {
    if (caScore === null || testScore === null || examScore === null)
      return null;
    return (caScore * 0.2 + testScore * 0.3 + examScore * 0.5).toFixed(1);
  };

  const handleSave = async () => {
    if (!assessment) return;
    setSaving(true);
    setMessage(null);

    try {
      // Prepare entries
      const entries = Object.entries(scores)
        .map(([pupilId, entry]) => ({
          pupilId,
          caScore: entry.caScore,
          testScore: entry.testScore,
          examScore: entry.examScore,
        }))
        .filter(
          (e) =>
            e.caScore !== null || e.testScore !== null || e.examScore !== null
        );

      if (entries.length === 0) {
        setMessage({
          type: "error",
          text: "Please enter at least one score before saving",
        });
        setSaving(false);
        return;
      }

      // Save scores - use teacher results endpoint with subject support
      const res = await fetch("/api/teacher/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: id,
          subject: subjectName,
          scores: entries,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save scores");
      }

      setMessage({ type: "success", text: "Scores saved successfully!" });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save scores",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <div className="text-center text-muted">Loading assessment...</div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <Link
          href={`/teacher/results/${id}/subjects`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error || "Assessment not found"}</p>
        </div>
      </div>
    );
  }

  const isPublished = assessment.status === "PUBLISHED";

  return (
    <div className="mx-auto max-w-6xl px-3 py-4">
      <Link
        href={`/teacher/results/${id}/subjects`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Subjects
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {assessment.name}
          </h1>
          <p className="text-sm text-muted mt-1">Subject: {subjectName}</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg border flex items-start gap-3 ${
            message.type === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <p
            className={`text-sm ${
              message.type === "success"
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {isPublished && (
        <div className="mb-4 p-4 rounded-lg border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700">
            ⚠️ This assessment is published and cannot be edited.
          </p>
        </div>
      )}

      {results.length === 0 ? (
        <div className="py-12 text-center rounded-lg border border-border bg-surface">
          <p className="text-muted">
            No students found for this subject
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Admission No
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      CA (20%)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      Test (30%)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      Exam (50%)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => {
                    const entry = scores[result.pupilId];
                    const total = calculateTotal(
                      entry?.caScore ?? null,
                      entry?.testScore ?? null,
                      entry?.examScore ?? null
                    );

                    return (
                      <tr
                        key={result.pupilId}
                        className="border-b border-border hover:bg-surface/50"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {result.pupilName}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">
                          {result.admissionNo}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            value={entry?.caScore ?? ""}
                            onChange={(e) =>
                              handleScoreChange(
                                result.pupilId,
                                "caScore",
                                e.target.value
                              )
                            }
                            disabled={isPublished}
                            className="w-16 px-2 py-1 rounded border border-border text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.1"
                            value={entry?.testScore ?? ""}
                            onChange={(e) =>
                              handleScoreChange(
                                result.pupilId,
                                "testScore",
                                e.target.value
                              )
                            }
                            disabled={isPublished}
                            className="w-16 px-2 py-1 rounded border border-border text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            step="0.1"
                            value={entry?.examScore ?? ""}
                            onChange={(e) =>
                              handleScoreChange(
                                result.pupilId,
                                "examScore",
                                e.target.value
                              )
                            }
                            disabled={isPublished}
                            className="w-16 px-2 py-1 rounded border border-border text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-foreground">
                          {total || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <Link href={`/teacher/results/${id}/subjects`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving || isPublished}
              className="bg-brand hover:bg-brand/90 text-white"
            >
              {saving ? "Saving..." : <Save className="w-4 h-4 mr-2" />}
              Save Scores
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
