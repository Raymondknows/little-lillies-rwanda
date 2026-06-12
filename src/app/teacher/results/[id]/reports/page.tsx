"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FileText } from "lucide-react";
import { WaecReportCard } from "@/components/teacher/waec-report-card";

interface Assessment {
  id: string;
  name: string;
  phase: string;
  status: string;
  term?: { name: string; };
  results: Array<{
    pupilId: string;
    pupilName: string;
    admissionNo: string;
    caScore: number | null;
    testScore: number | null;
    examScore: number | null;
    totalScore: number | null;
    grade: string | null;
  }>;
}

export default function TeacherReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [reportCardData, setReportCardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teacher/assessments/${id}`);
        if (!response.ok) throw new Error("Failed to fetch assessment");
        const data = await response.json();
        setAssessment(data.assessment);

        // Auto-select first student if available
        if (data.assessment.results && data.assessment.results.length > 0) {
          setSelectedStudent(data.assessment.results[0].pupilId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  // Load report card data when student is selected
  useEffect(() => {
    if (!selectedStudent) return;

    const loadReportCard = async () => {
      try {
        setReportLoading(true);
        const response = await fetch(
          `/api/report-cards/${id}/${selectedStudent}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
          console.error("Backend error:", errorMsg);
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log("Report card data loaded:", data);
        
        // Validate data structure
        if (data && typeof data === 'object') {
          setReportCardData(data);
        } else {
          console.error("Invalid report card data structure:", data);
          setReportCardData(null);
        }
      } catch (err) {
        console.error("Error loading report card:", err);
        setReportCardData(null);
      } finally {
        setReportLoading(false);
      }
    };

    loadReportCard();
  }, [id, selectedStudent]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-4">
        <div className="text-center text-muted">Loading assessment...</div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-4">
        <Link
          href={`/teacher/results/${id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Assessment
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error || "Assessment not found"}</p>
        </div>
      </div>
    );
  }

  const isPublished = assessment.status === "PUBLISHED";
  
  // Deduplicate students (results may contain one entry per subject)
  const uniqueStudents = Array.from(
    new Map(assessment.results.map((r) => [r.pupilId, r])).values()
  );

  const handleDownloadPDF = async (pupilId: string) => {
    try {
      const response = await fetch(`/api/pdf-reports/${id}/${pupilId}`);
      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${assessment.name}-${pupilId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4">
      <Link
        href={`/teacher/results/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Assessment
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{assessment.name}</h1>
          <p className="text-sm text-muted mt-1">Professional student report cards</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={isPublished ? "success" : "secondary"}>
            {isPublished ? "Published" : assessment.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student List Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-surface p-4 sticky top-4">
            <h2 className="text-sm font-semibold mb-3">Students ({uniqueStudents.length})</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {uniqueStudents.map((result) => (
                <button
                  key={result.pupilId}
                  onClick={() => setSelectedStudent(result.pupilId)}
                  className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    selectedStudent === result.pupilId
                      ? "bg-brand text-white"
                      : "hover:bg-background text-foreground"
                  }`}
                >
                  <p className="font-medium truncate text-xs">{result.pupilName}</p>
                  <p className="text-xs opacity-75">{result.admissionNo}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Card Viewer */}
        <div className="lg:col-span-3">
          {reportLoading ? (
            <div className="text-center py-12 text-muted">Loading report card...</div>
          ) : reportCardData && selectedStudent ? (
            <WaecReportCard
              assessmentId={id}
              pupilId={selectedStudent}
              data={reportCardData}
              onDownloadPDF={handleDownloadPDF}
              onPrint={() => window.print()}
            />
          ) : (
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <FileText className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
              <p className="text-muted">No report card available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
