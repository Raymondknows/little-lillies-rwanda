"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FileText, Download } from "lucide-react";
import { ReportCardViewer } from "@/components/admin/report-card-viewer";

interface Assessment {
  id: string;
  name: string;
  status: string;
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
  const selectedStudentData = assessment.results.find((r) => r.pupilId === selectedStudent);
  
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
          <h1 className="text-2xl font-bold">{assessment.name}</h1>
          <p className="text-sm text-muted mt-1">View student report cards</p>
        </div>
        <Badge variant={isPublished ? "success" : "secondary"}>
          {isPublished ? "Published" : assessment.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student List Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold mb-3">Students</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
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
                  <p className="font-medium truncate">{result.pupilName}</p>
                  <p className="text-xs opacity-75">{result.admissionNo}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Card Viewer */}
        <div className="lg:col-span-3">
          {selectedStudentData ? (
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold">{selectedStudentData.pupilName}</h2>
                  <p className="text-sm text-muted">{selectedStudentData.admissionNo}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedStudent!)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>

              {/* Summary Card */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs text-muted font-medium">Total Score</p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedStudentData.totalScore ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs text-muted font-medium">Grade</p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedStudentData.grade ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs text-muted font-medium">Status</p>
                  <Badge className="mt-2">{isPublished ? "Published" : "Pending"}</Badge>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4">Score Components</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-xs text-muted font-medium">CA (20%)</p>
                    <p className="text-xl font-semibold mt-2">
                      {selectedStudentData.caScore ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-xs text-muted font-medium">Test (30%)</p>
                    <p className="text-xl font-semibold mt-2">
                      {selectedStudentData.testScore ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-xs text-muted font-medium">Exam (50%)</p>
                    <p className="text-xl font-semibold mt-2">
                      {selectedStudentData.examScore ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Note about ReportCardViewer integration */}
              <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted">
                <p>Full report card details available from backend API</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-12 text-center">
              <FileText className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
              <p className="text-muted">Select a student to view report card</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
