"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Download, Printer } from "lucide-react";

interface ReportCard {
  pupilName: string;
  admissionNo: string;
  className: string;
  totalScore: number | null;
  grade: string | null;
  caScore: number | null;
  testScore: number | null;
  examScore: number | null;
  classPosition: number | null;
  classTotal: number;
  subjectPosition: number | null;
  subjectTotal: number;
  term?: {
    name: string;
    session?: string;
    sortOrder?: number | null;
  };
  thirdTermHistory?: {
    terms: Array<{
      id: string;
      name: string;
      sortOrder: number;
    }>;
    entries: Array<{
      subjectId: string | null;
      subjectName: string;
      currentTotal: number | null;
      cumulativeTotal: number | null;
      previousTotals: Array<{
        termId: string;
        termName: string;
        sortOrder: number;
        totalScore: number | null;
        examScore: number | null;
      }>;
    }>;
  } | null;
}

interface Assessment {
  id: string;
  name: string;
  term: { name: string };
  status: string;
}

export default function ParentReportCardPage({
  params,
}: {
  params: Promise<{ assessmentId: string; studentId: string }>;
}) {
  const { assessmentId, studentId } = use(params);
  const [report, setReport] = useState<ReportCard | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);

        // Fetch assessment details
        const assessmentRes = await fetch(`/api/assessments/${assessmentId}`);
        if (assessmentRes.ok) {
          const assessmentData = await assessmentRes.json();
          setAssessment(assessmentData);
        }

        // Fetch report card
        const reportRes = await fetch(
          `/api/report-cards/${assessmentId}/${studentId}`
        );
        if (!reportRes.ok) throw new Error("Failed to fetch report card");
        const reportData = await reportRes.json();
        setReport(reportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [assessmentId, studentId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(
        `/api/pdf-reports/${assessmentId}/${studentId}`
      );
      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${assessmentId}-${studentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-6 w-full bg-slate-100 rounded animate-pulse"></div>
          <div className="h-6 w-3/4 bg-slate-100 rounded animate-pulse"></div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <Link
          href="/parent/results"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Results
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error || "Report card not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 print:p-0">
      {/* Navigation */}
      <div className="mb-6 print:hidden">
        <Link
          href="/parent/results"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Results
        </Link>
      </div>

      {/* Print Controls */}
      <div className="mb-6 flex gap-3 print:hidden">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button
          onClick={handleDownloadPDF}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Report Card */}
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-white p-8 shadow-lg print:border-0 print:shadow-none">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold">Report Card</h1>
          {assessment && (
            <div className="mt-4 space-y-1 text-sm text-muted">
              <p>Assessment: {assessment.name}</p>
              <p>Term: {assessment.term.name}</p>
            </div>
          )}
        </div>

        {/* Student Information */}
        <div className="mb-8 rounded-lg border border-border bg-background p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted">Student Name</p>
              <p className="text-lg font-bold">{report.pupilName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Admission Number</p>
              <p className="text-lg font-bold">{report.admissionNo}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Class</p>
              <p className="text-lg font-bold">{report.className}</p>
            </div>
          </div>
        </div>

        {/* Overall Performance */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Overall Performance</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-xs font-medium text-muted">Total Score</p>
              <p className="text-3xl font-bold mt-2">
                {report.totalScore ?? "—"}
              </p>
              <p className="text-xs text-muted mt-1">/ 100</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-xs font-medium text-muted">Grade</p>
              <div className="mt-2">
                <Badge className="text-lg py-1 px-3">
                  {report.grade ?? "—"}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-xs font-medium text-muted">Class Position</p>
              <p className="text-3xl font-bold mt-2">
                {report.classPosition ?? "—"}
              </p>
              <p className="text-xs text-muted mt-1">
                of {report.classTotal}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-xs font-medium text-muted">Subject Position</p>
              <p className="text-3xl font-bold mt-2">
                {report.subjectPosition ?? "—"}
              </p>
              <p className="text-xs text-muted mt-1">
                of {report.subjectTotal}
              </p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-medium">Continuous Assessment (CA)</span>
              <span className="text-xl font-bold">{report.caScore ?? "—"}</span>
              <span className="text-xs text-muted">20%</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-medium">Test Score</span>
              <span className="text-xl font-bold">{report.testScore ?? "—"}</span>
              <span className="text-xs text-muted">30%</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-medium">Examination</span>
              <span className="text-xl font-bold">{report.examScore ?? "—"}</span>
              <span className="text-xs text-muted">50%</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="font-bold">Total Score</span>
              <span className="text-2xl font-bold">{report.totalScore ?? "—"}</span>
            </div>
          </div>
        </div>

        {report.term?.sortOrder === 3 && report.thirdTermHistory?.entries?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Third Term Cumulative History</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-700">
                  <tr>
                    <th className="border-b border-border px-3 py-2 font-semibold">Subject</th>
                    {report.thirdTermHistory.terms.map((term) => (
                      <th key={term.id} className="border-b border-border px-3 py-2 text-center font-semibold">{term.name}</th>
                    ))}
                    <th className="border-b border-border px-3 py-2 text-center font-semibold">Term 3</th>
                    <th className="border-b border-border px-3 py-2 text-center font-semibold">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {report.thirdTermHistory.entries.map((entry, index) => (
                    <tr key={`${entry.subjectName}-${index}`} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{entry.subjectName}</td>
                      {entry.previousTotals.map((termTotal) => (
                        <td key={`${entry.subjectName}-${termTotal.termId}`} className="px-3 py-2 text-center text-slate-700">
                          {termTotal.totalScore !== null ? termTotal.totalScore.toFixed(1) : '—'}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center text-slate-700">
                        {entry.currentTotal !== null ? entry.currentTotal.toFixed(1) : '—'}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-slate-900">
                        {entry.cumulativeTotal !== null ? entry.cumulativeTotal.toFixed(1) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-muted print:text-black">
          <p>This is an official report card from SchoolBase</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mx-auto max-w-2xl mt-6 text-center text-sm text-muted print:hidden">
        <p>
          Please contact the school if you have any questions about your
          child's performance.
        </p>
      </div>
    </div>
  );
}
