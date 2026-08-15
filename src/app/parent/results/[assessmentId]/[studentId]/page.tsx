"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { ChevronLeft } from "lucide-react";
import { WaecReportCard } from "@/components/teacher/waec-report-card";

interface ReportCard {
  student?: {
    name?: string;
    admissionNo?: string | null;
    photoUrl?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
  };
  school?: {
    name?: string;
    address?: string | null;
    logoUrl?: string | null;
    principalName?: string | null;
    stampUrl?: string | null;
    principalSignatureUrl?: string | null;
  };
  class?: {
    name?: string;
  };
  term?: {
    name?: string;
    session?: string;
    sortOrder?: number | null;
  };
  subjects?: Array<{
    subjectName: string;
    caScore?: number | null;
    testScore?: number | null;
    examScore?: number | null;
    totalScore: number;
    grade: string;
    remarks?: string | null;
  }>;
  averageScore?: number;
  classPosition?: number | null;
  totalSubjects?: number;
  statistics?: {
    passRate?: number;
  };
  teacherRemark?: string | null;
  principalRemark?: string | null;
  gradingScale?: Array<{
    grade: string;
    minScore: number;
    maxScore: number;
  }>;
  thirdTermHistory?: {
    terms: Array<{ id: string; name: string; sortOrder: number }>;
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

        const assessmentRes = await fetch(`/api/assessments/${assessmentId}`);
        if (assessmentRes.ok) {
          const assessmentData = await assessmentRes.json();
          setAssessment(assessmentData);
        }

        const reportRes = await fetch(`/api/report-cards/${assessmentId}/${studentId}?signatoryMode=principal`);
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
      const response = await fetch(`/api/pdf-reports/${assessmentId}/${studentId}?signatoryMode=principal`);
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
        <div className="h-8 w-48 rounded-lg bg-slate-200 animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-6 w-full rounded bg-slate-100 animate-pulse"></div>
          <div className="h-6 w-3/4 rounded bg-slate-100 animate-pulse"></div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full rounded bg-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <Link href="/parent/results" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          <ChevronLeft className="h-4 w-4" />
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
      <div className="mb-6 print:hidden">
        <Link href="/parent/results" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Back to Results
        </Link>
      </div>

      <div className="mx-auto max-w-6xl">
        <WaecReportCard
          assessmentId={assessmentId}
          pupilId={studentId}
          data={report as never}
          onPrint={handlePrint}
          onDownloadPDF={handleDownloadPDF}
          showDownload={false}
        />
      </div>
    </div>
  );
}
