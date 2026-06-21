"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ChevronRight, Filter, GraduationCap } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import { WaecReportCard } from "@/components/teacher/waec-report-card";

interface Result {
  id: string;
  subject: string;
  assessmentId: string;
  caScore?: number;
  testScore?: number;
  examScore?: number;
  totalScore?: number;
  grade?: string;
}

interface Term {
  id: string;
  name: string;
  sortOrder?: number;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
}

export default function ParentResultsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [reportCardData, setReportCardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/parent/children`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch children");

        const data = await response.json();
        setChildren(data.children || []);

        if (data.children?.length > 0) {
          setSelectedChildId(data.children[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/parent/terms`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch terms");

        const data = await response.json();
        setTerms(data.terms || []);
      } catch (err) {
        console.error("Error fetching terms:", err);
      }
    };

    fetchTerms();
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;

    const fetchResults = async () => {
      try {
        const backendUrl = getBackendUrl();
        const termParam = selectedTerm ? `&termId=${selectedTerm.id}` : "";
        const response = await fetch(
          `${backendUrl}/api/parent/results?childId=${selectedChildId}${termParam}`,
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch results");

        const data = await response.json();
        const nextResults: Result[] = data.results || [];
        setResults(nextResults);

        if (data.term && !selectedTerm) {
          setSelectedTerm(data.term);
        }

        const firstAssessmentId = nextResults[0]?.assessmentId ?? null;
        setSelectedAssessmentId((current) => {
          if (current && nextResults.some((result) => result.assessmentId === current)) {
            return current;
          }

          return firstAssessmentId;
        });
      } catch (err) {
        console.error("Error fetching results:", err);
      }
    };

    fetchResults();
  }, [selectedChildId, selectedTerm]);

  useEffect(() => {
    if (!selectedChildId || !selectedAssessmentId) {
      setReportCardData(null);
      return;
    }

    const loadReportCard = async () => {
      try {
        setReportLoading(true);
        const response = await fetch(
          `/api/report-cards/${selectedAssessmentId}/${selectedChildId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setReportCardData(data);
      } catch (err) {
        console.error("Error loading report card:", err);
        setReportCardData(null);
      } finally {
        setReportLoading(false);
      }
    };

    loadReportCard();
  }, [selectedChildId, selectedAssessmentId]);

  const selectedChild = children.find((child) => child.id === selectedChildId) || null;
  const selectedAssessment = results.find((result) => result.assessmentId === selectedAssessmentId) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
        <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600">No children linked to this account</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-bold text-slate-900">Academic Results</h1>
        <p className="mt-1 text-sm text-slate-600">View your child's grades and assessment performance</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <h2 className="font-semibold text-slate-900">Filter Results</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Select Child:</label>
            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => {
                    setSelectedChildId(child.id);
                    setSelectedTerm(null);
                    setResults([]);
                    setSelectedAssessmentId(null);
                    setReportCardData(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedChild?.id === child.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-900 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {child.firstName} {child.lastName}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Select Term:</label>
            <select
              value={selectedTerm?.id || ""}
              onChange={(event) => {
                const termId = event.target.value;
                if (termId === "") {
                  setSelectedTerm(null);
                } else {
                  const term = terms.find((item) => item.id === termId);
                  setSelectedTerm(term || null);
                }
                setSelectedAssessmentId(null);
                setReportCardData(null);
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Latest Term</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedChild && (
        <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <GraduationCap className="h-5 w-5 text-slate-600" />
            <div>
              <h2 className="font-semibold text-slate-900">
                Results for {selectedChild.firstName} {selectedChild.lastName}
              </h2>
              {selectedTerm && <p className="text-xs text-slate-600 mt-1">{selectedTerm.name}</p>}
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
              <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">
                {selectedTerm ? `No results available for ${selectedTerm.name}` : "No results available yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <button
                    key={result.assessmentId}
                    type="button"
                    onClick={() => setSelectedAssessmentId(result.assessmentId)}
                    className={`rounded-lg border p-4 text-left transition ${
                      selectedAssessmentId === result.assessmentId
                        ? "border-brand bg-brand/5 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{result.subject}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      CA {result.caScore ?? "—"} · Test {result.testScore ?? "—"} · Exam {result.examScore ?? "—"}
                    </p>
                    <p className="mt-2 text-xs font-medium text-brand">
                      Total: {result.totalScore ?? "—"} · Grade: {result.grade || "—"}
                    </p>
                  </button>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Selected report card</p>
                <p className="mt-1">
                  {selectedAssessment
                    ? `Showing ${selectedAssessment.subject} for ${selectedChild.firstName} ${selectedChild.lastName}`
                    : "Select an assessment to view the full report card."}
                </p>
              </div>

              {reportLoading ? (
                <div className="text-center py-12 text-slate-600">Loading report card...</div>
              ) : reportCardData && selectedAssessmentId ? (
                <WaecReportCard
                  assessmentId={selectedAssessmentId}
                  pupilId={selectedChildId || ""}
                  data={reportCardData}
                  onDownloadPDF={async (pupilId) => {
                    const response = await fetch(`/api/pdf-reports/${selectedAssessmentId}/${pupilId}`);
                    if (!response.ok) throw new Error("Failed to download PDF");

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `report-${selectedAssessmentId}-${pupilId}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  }}
                  onPrint={() => window.print()}
                />
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
                  <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">No report card available</p>
                </div>
              )}

              <div className="flex justify-end">
                <Link
                  href={selectedAssessmentId ? `/parent/results/${selectedAssessmentId}/${selectedChild.id}` : "/parent/results"}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand/80"
                >
                  Open full report card
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
