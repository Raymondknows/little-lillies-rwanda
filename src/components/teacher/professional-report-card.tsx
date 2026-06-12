"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, ChevronLeft, BarChart3, FileText } from "lucide-react";
import Link from "next/link";

interface ReportCardData {
  student: {
    id: string;
    name: string;
    admissionNo: string;
    gender?: string;
    dateOfBirth?: string;
  };
  school: {
    name: string;
    address?: string;
    logo?: string;
  };
  class: {
    name: string;
  };
  term: {
    name: string;
    session: string;
  };
  subjects: Array<{
    subjectName: string;
    totalScore: number;
    grade: string;
    teacherRemark?: string;
    comment?: string;
    subjectPosition?: number;
  }>;
  averageScore: number;
  classPosition: number | null;
  totalSubjects: number;
  teacherRemark?: string;
  principalRemark?: string;
  statistics: {
    highestScore: number;
    lowestScore: number;
    passRate: number;
  };
}

interface ProfessionalReportCardProps {
  assessmentId: string;
  pupilId: string;
  data?: ReportCardData | null;
  onDownload?: (pupilId: string) => Promise<void>;
}

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-50",
  B: "text-blue-700 bg-blue-50",
  C: "text-yellow-700 bg-yellow-50",
  D: "text-orange-700 bg-orange-50",
  E: "text-red-700 bg-red-50",
  F: "text-red-900 bg-red-100",
};

const PSYCHOMOTOR_COLORS: Record<string, string> = {
  A: "text-green-600",
  B: "text-blue-600",
  C: "text-gray-600",
};

export function ProfessionalReportCard({
  assessmentId,
  pupilId,
  data,
  onDownload,
}: ProfessionalReportCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle undefined data
  if (!data || !data.subjects) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
        <p className="text-gray-600">No report card data available</p>
      </div>
    );
  }

  const isPassing = data.subjects.every((r) => r.grade !== "F" && r.grade !== "E");

  const handleDownload = async () => {
    if (!onDownload) return;
    setIsDownloading(true);
    try {
      await onDownload(pupilId);
    } finally {
      setIsDownloading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    return GRADE_COLORS[grade] || "text-gray-700 bg-gray-50";
  };

  return (
    <div className="space-y-6">
      {/* Professional Report Card Print Area */}
      <div
        id={`report-card-${pupilId}`}
        className="bg-white rounded-lg border border-gray-300 p-8 text-gray-900 shadow-lg print:shadow-none"
      >
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-4">
            {data.school.logo && (
              <img
                src={data.school.logo}
                alt="School Logo"
                className="h-12 w-12"
              />
            )}
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {data.school.name}
              </h1>
              {data.school.address && (
                <p className="text-xs text-gray-600 mt-1">{data.school.address}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-600">
              <p className="font-medium">STATEMENT OF RESULT</p>
              <p>{data.term.session}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm mt-4 text-gray-800">
            <div>
              <p className="font-semibold">Student Name</p>
              <p className="font-bold text-lg">{data.student.name}</p>
            </div>
            <div>
              <p className="font-semibold">Admission No.</p>
              <p className="font-mono">{data.student.admissionNo}</p>
            </div>
            <div>
              <p className="font-semibold">Class</p>
              <p className="font-bold">{data.class.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs text-gray-700 mt-3">
            <div>
              <p className="font-semibold">Gender</p>
              <p>{data.student.gender || "—"}</p>
            </div>
            <div>
              <p className="font-semibold">Class</p>
              <p>{data.class.name}</p>
            </div>
            <div>
              <p className="font-semibold">Term</p>
              <p>{data.term.name}</p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="mb-6 print:break-inside-avoid">
          <h2 className="font-bold text-lg mb-3 text-gray-900">Assessment Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200 border-2 border-gray-400">
                  <th className="border border-gray-400 px-3 py-2 text-left font-bold">
                    Subject
                  </th>
                  <th className="border border-gray-400 px-3 py-2 text-center font-bold">
                    Total Score
                  </th>
                  <th className="border border-gray-400 px-2 py-2 text-center font-bold">
                    Grade
                  </th>
                  {data.subjects.some((s) => s.comment) && (
                    <th className="border border-gray-400 px-2 py-2 text-center font-bold text-xs">
                      Remark
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.subjects.map((subject, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-400 px-3 py-2 font-medium">
                      {subject.subjectName}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-center font-bold">
                      {subject.totalScore}
                    </td>
                    <td className={`border border-gray-400 px-2 py-2 text-center font-bold ${getGradeColor(subject.grade)}`}>
                      {subject.grade}
                    </td>
                    {data.subjects.some((s) => s.comment) && (
                      <td className="border border-gray-400 px-2 py-2 text-center text-xs">
                        {subject.comment || "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-6 mb-6 print:break-inside-avoid">
          <div className="border-2 border-gray-400 p-4 rounded">
            <h3 className="font-bold text-gray-900 mb-3">OVERALL SUMMARY</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Total Subjects:</span>
                <span className="font-bold text-lg">
                  {data.totalSubjects}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Average Score:</span>
                <span className="font-bold">
                  {data.averageScore.toFixed(1)}%
                </span>
              </div>
              {data.classPosition && (
                <div className="flex justify-between">
                  <span className="font-semibold">Class Position:</span>
                  <span className="font-bold">
                    {data.classPosition}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-2 border-gray-400 p-4 rounded">
            <h3 className="font-bold text-gray-900 mb-3">CLASS STATISTICS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Highest Score:</span>
                <span className="font-bold">{data.statistics.highestScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Lowest Score:</span>
                <span className="font-bold">{data.statistics.lowestScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Pass Rate:</span>
                <span className="font-bold">{data.statistics.passRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Comment */}
        {(data.teacherRemark || data.principalRemark) && (
          <div className="border-l-4 border-gray-800 pl-4 mb-6 print:break-inside-avoid">
            {data.teacherRemark && (
              <>
                <p className="text-xs font-semibold text-gray-700 mb-2">TEACHER'S REMARK</p>
                <p className="text-sm italic text-gray-800">{data.teacherRemark}</p>
              </>
            )}
            {data.principalRemark && (
              <>
                <p className="text-xs font-semibold text-gray-700 mb-2 mt-3">PRINCIPAL'S REMARK</p>
                <p className="text-sm italic text-gray-800">{data.principalRemark}</p>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-800 pt-4 mt-6 print:break-inside-avoid">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="text-gray-600 mb-8">_________________</p>
              <p className="font-semibold">Teacher's Signature</p>
            </div>
            <div>
              <p className="text-gray-600 mb-8">_________________</p>
              <p className="font-semibold">Principal's Signature</p>
            </div>
            <div>
              <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
              <p className="font-semibold">Date</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download/Print Buttons */}
      <div className="flex gap-3 justify-center print:hidden">
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? "Downloading..." : "Download PDF"}
        </Button>
      </div>
    </div>
  );
}

export default ProfessionalReportCard;
