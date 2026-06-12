"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Share2 } from "lucide-react";

interface SubjectResult {
  subjectName: string;
  caScore?: number;
  testScore?: number;
  examScore?: number;
  projectScore?: number;
  totalScore: number;
  grade: string;
  subjectPosition?: number;
  remarks?: string;
  maxScore?: number;
}

interface ReportCardData {
  student: {
    id: string;
    name: string;
    admissionNo: string;
    dateOfBirth?: string;
    gender?: string;
    photoUrl?: string;
  };
  school: {
    id: string;
    name: string;
    address?: string;
    logoUrl?: string;
    principalName?: string;
    stampUrl?: string;
  };
  class: {
    name: string;
    phase: string;
  };
  term: {
    name: string;
    session: string;
  };
  assessment?: {
    name: string;
    phase: string;
  };
  subjects: SubjectResult[];
  summary: {
    totalScore: number;
    averageScore: number;
    lowestScore: number;
    highestScore: number;
    classPosition?: number;
    totalStudents?: number;
    passRate: number;
    attendance?: number;
    maxAttendance?: number;
  };
  remarks?: {
    psychomotor?: string;
    affective?: string;
    teacherComment?: string;
    promotionStatus?: string;
  };
}

interface WaecReportCardProps {
  data: ReportCardData;
  assessmentId: string;
  pupilId: string;
  onPrint?: () => void;
  onDownloadPDF?: (pupilId: string) => Promise<void>;
}

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-green-100", text: "text-green-900" },
  B: { bg: "bg-blue-100", text: "text-blue-900" },
  C: { bg: "bg-yellow-100", text: "text-yellow-900" },
  D: { bg: "bg-orange-100", text: "text-orange-900" },
  E: { bg: "bg-red-100", text: "text-red-900" },
  F: { bg: "bg-red-200", text: "text-red-950" },
};

const PSYCHOMOTOR_GRADES = ["A", "B", "C"];
const AFFECTIVE_GRADES = ["A", "B", "C"];

export function WaecReportCard({
  data,
  assessmentId,
  pupilId,
  onPrint,
  onDownloadPDF,
}: WaecReportCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 500);
  };

  const handleDownload = async () => {
    if (!onDownloadPDF) return;
    setIsDownloading(true);
    try {
      await onDownloadPDF(pupilId);
    } finally {
      setIsDownloading(false);
    }
  };

  const getGradeColor = (grade: string) => GRADE_COLORS[grade] || { bg: "bg-gray-100", text: "text-gray-900" };

  const hasOptionalScores = data.subjects.some(
    (s) => s.caScore !== undefined || s.testScore !== undefined || s.examScore !== undefined || s.projectScore !== undefined
  );

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-2 print:hidden">
        <Button
          onClick={handlePrint}
          disabled={isPrinting}
          variant="outline"
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading || !onDownloadPDF}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? "Downloading..." : "Download PDF"}
        </Button>
        <Button variant="ghost" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {/* Main Report Card */}
      <div
        id={`report-card-${pupilId}`}
        className="bg-white rounded-lg shadow-lg border-2 border-gray-800 p-12 text-gray-900 print:shadow-none print:rounded-none print:p-8 print:border-none"
      >
        {/* Header Section */}
        <div className="border-b-4 border-gray-800 pb-6 mb-8 print:break-inside-avoid">
          <div className="flex items-start justify-between mb-4">
            {data.school.logoUrl && (
              <img
                src={data.school.logoUrl}
                alt="School Logo"
                className="h-16 w-16 object-contain"
              />
            )}
            <div className="text-center flex-1 px-4">
              <h1 className="text-2xl font-black text-gray-900">{data.school.name}</h1>
              {data.school.address && (
                <p className="text-xs text-gray-600 mt-1">{data.school.address}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-700 font-semibold">
              <p className="text-lg font-black">STATEMENT OF RESULT</p>
              <p className="text-sm">{data.term.session}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-sm mt-4 text-gray-700 font-medium">
            <div>
              <p className="text-xs font-semibold text-gray-600">TERM</p>
              <p className="font-bold">{data.term.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">CLASS</p>
              <p className="font-bold">{data.class.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">ASSESSMENT</p>
              <p className="font-bold text-xs">{data.assessment?.name || "Assessment"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">DATE</p>
              <p className="font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-3 gap-6 mb-8 print:break-inside-avoid">
          <div className="border-2 border-gray-400 p-4 rounded">
            <p className="text-xs font-bold text-gray-600 mb-2">STUDENT NAME</p>
            <p className="font-bold text-lg text-gray-900">{data.student.name}</p>
            <p className="text-xs text-gray-700 mt-1">Admission: {data.student.admissionNo}</p>
          </div>
          <div className="border-2 border-gray-400 p-4 rounded">
            <p className="text-xs font-bold text-gray-600 mb-2">DATE OF BIRTH</p>
            <p className="font-bold text-lg">{data.student.dateOfBirth || "—"}</p>
            <p className="text-xs text-gray-700 mt-1">Gender: {data.student.gender || "—"}</p>
          </div>
          <div className="border-2 border-gray-400 p-4 rounded">
            {data.student.photoUrl ? (
              <img
                src={data.student.photoUrl}
                alt="Student Photo"
                className="w-full h-24 object-cover rounded"
              />
            ) : (
              <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                No Photo
              </div>
            )}
          </div>
        </div>

        {/* Results Table */}
        <div className="mb-8 print:break-inside-avoid">
          <h2 className="text-sm font-black text-gray-900 mb-4 border-b-2 border-gray-800 pb-2">
            ACADEMIC PERFORMANCE
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border-2 border-gray-800 px-3 py-2 text-left font-bold">SUBJECT</th>
                {hasOptionalScores && data.subjects[0]?.caScore !== undefined && (
                  <th className="border-2 border-gray-800 px-2 py-2 text-center font-bold text-xs">CA</th>
                )}
                {hasOptionalScores && data.subjects[0]?.testScore !== undefined && (
                  <th className="border-2 border-gray-800 px-2 py-2 text-center font-bold text-xs">TEST</th>
                )}
                {hasOptionalScores && data.subjects[0]?.examScore !== undefined && (
                  <th className="border-2 border-gray-800 px-2 py-2 text-center font-bold text-xs">EXAM</th>
                )}
                {hasOptionalScores && data.subjects[0]?.projectScore !== undefined && (
                  <th className="border-2 border-gray-800 px-2 py-2 text-center font-bold text-xs">PROJECT</th>
                )}
                <th className="border-2 border-gray-800 px-3 py-2 text-center font-bold">TOTAL</th>
                <th className="border-2 border-gray-800 px-2 py-2 text-center font-bold">GRADE</th>
                {data.subjects.some((s) => s.subjectPosition) && (
                  <th className="border-2 border-gray-800 px-2 py-2 text-center font-bold text-xs">POS.</th>
                )}
                {data.subjects.some((s) => s.remarks) && (
                  <th className="border-2 border-gray-800 px-2 py-2 text-left font-bold text-xs">REMARKS</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((subject, idx) => {
                const gradeColor = getGradeColor(subject.grade);
                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border-2 border-gray-400 px-3 py-2 font-semibold text-gray-900">
                      {subject.subjectName}
                    </td>
                    {hasOptionalScores && subject.caScore !== undefined && (
                      <td className="border-2 border-gray-400 px-2 py-2 text-center">{subject.caScore}</td>
                    )}
                    {hasOptionalScores && subject.testScore !== undefined && (
                      <td className="border-2 border-gray-400 px-2 py-2 text-center">{subject.testScore}</td>
                    )}
                    {hasOptionalScores && subject.examScore !== undefined && (
                      <td className="border-2 border-gray-400 px-2 py-2 text-center">{subject.examScore}</td>
                    )}
                    {hasOptionalScores && subject.projectScore !== undefined && (
                      <td className="border-2 border-gray-400 px-2 py-2 text-center">{subject.projectScore}</td>
                    )}
                    <td className="border-2 border-gray-400 px-3 py-2 text-center font-bold text-lg">
                      {subject.totalScore}
                      {subject.maxScore && <span className="text-xs">/{subject.maxScore}</span>}
                    </td>
                    <td className={`border-2 border-gray-400 px-2 py-2 text-center font-black text-lg ${gradeColor.bg} ${gradeColor.text}`}>
                      {subject.grade}
                    </td>
                    {data.subjects.some((s) => s.subjectPosition) && (
                      <td className="border-2 border-gray-400 px-2 py-2 text-center text-xs font-semibold">
                        {subject.subjectPosition ? `${subject.subjectPosition}` : "—"}
                      </td>
                    )}
                    {data.subjects.some((s) => s.remarks) && (
                      <td className="border-2 border-gray-400 px-2 py-2 text-xs">{subject.remarks || "—"}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-6 mb-8 print:break-inside-avoid">
          <div className="border-2 border-gray-400 p-4 rounded bg-gray-50">
            <h3 className="font-black text-gray-900 mb-4 text-sm border-b-2 border-gray-400 pb-2">
              OVERALL SUMMARY
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600">Total Subjects:</span>
                <span className="font-bold text-lg text-gray-900">{data.subjects.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600">Average Score:</span>
                <span className="font-bold text-lg text-gray-900">{data.summary.averageScore.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600">Total Score:</span>
                <span className="font-bold text-lg text-gray-900">{data.summary.totalScore}</span>
              </div>
              {data.summary.classPosition && (
                <div className="flex justify-between items-center border-t-2 border-gray-400 pt-2 mt-2">
                  <span className="text-xs font-semibold text-gray-600">Class Position:</span>
                  <span className="font-bold text-lg text-gray-900">
                    {data.summary.classPosition}/{data.summary.totalStudents || "—"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-2 border-gray-400 p-4 rounded bg-gray-50">
            <h3 className="font-black text-gray-900 mb-4 text-sm border-b-2 border-gray-400 pb-2">
              CLASS STATISTICS
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600">Highest Score:</span>
                <span className="font-bold text-lg text-gray-900">{data.summary.highestScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600">Lowest Score:</span>
                <span className="font-bold text-lg text-gray-900">{data.summary.lowestScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600">Pass Rate:</span>
                <span className="font-bold text-lg text-gray-900">{data.summary.passRate.toFixed(1)}%</span>
              </div>
              {data.summary.attendance !== undefined && (
                <div className="flex justify-between items-center border-t-2 border-gray-400 pt-2 mt-2">
                  <span className="text-xs font-semibold text-gray-600">Attendance:</span>
                  <span className="font-bold text-lg text-gray-900">
                    {data.summary.attendance}/{data.summary.maxAttendance || "—"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Psychomotor & Affective Domain */}
        {data.remarks && (data.remarks.psychomotor || data.remarks.affective) && (
          <div className="grid grid-cols-2 gap-6 mb-8 print:break-inside-avoid">
            {data.remarks.psychomotor && (
              <div className="border-2 border-gray-400 p-4 rounded bg-blue-50">
                <p className="text-xs font-black text-gray-600 mb-3">PSYCHOMOTOR SKILLS</p>
                <p className="text-5xl font-black text-blue-900 text-center">{data.remarks.psychomotor}</p>
              </div>
            )}
            {data.remarks.affective && (
              <div className="border-2 border-gray-400 p-4 rounded bg-purple-50">
                <p className="text-xs font-black text-gray-600 mb-3">AFFECTIVE DOMAIN</p>
                <p className="text-5xl font-black text-purple-900 text-center">{data.remarks.affective}</p>
              </div>
            )}
          </div>
        )}

        {/* Teacher & Principal Remarks */}
        {data.remarks?.teacherComment && (
          <div className="border-l-4 border-gray-800 pl-4 mb-8 print:break-inside-avoid">
            <p className="text-xs font-black text-gray-600 mb-2">TEACHER'S REMARK</p>
            <p className="text-sm text-gray-800 italic">{data.remarks.teacherComment}</p>
          </div>
        )}

        {data.remarks?.promotionStatus && (
          <div className="border-2 border-gray-800 p-4 mb-8 bg-yellow-50 print:break-inside-avoid">
            <p className="text-xs font-black text-gray-600 mb-2">PROMOTION STATUS</p>
            <p className="text-sm font-bold text-gray-900">{data.remarks.promotionStatus}</p>
          </div>
        )}

        {/* Footer - Signatures */}
        <div className="border-t-4 border-gray-800 pt-6 mt-8 print:break-inside-avoid">
          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-16 border-b-2 border-gray-800 mb-2"></div>
              <p className="font-bold text-gray-900">Teacher's Signature</p>
              <p className="text-gray-600 text-xs mt-1">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <div className="h-16 border-b-2 border-gray-800 mb-2"></div>
              <p className="font-bold text-gray-900">Principal's Signature</p>
              <p className="text-gray-600 text-xs">{data.school.principalName || "Principal"}</p>
            </div>
            <div>
              {data.school.stampUrl ? (
                <img src={data.school.stampUrl} alt="School Stamp" className="h-16 w-full object-contain" />
              ) : (
                <div className="h-16 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-gray-400 text-xs">
                  School Stamp
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Code */}
        <div className="text-center mt-6 pt-4 border-t border-gray-300 text-xs text-gray-600">
          <p>Verification Code: {pupilId.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
