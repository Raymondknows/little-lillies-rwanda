"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Share2 } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";

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
  summary?: {
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
  averageScore?: number;
  classPosition?: number | null;
  totalSubjects?: number;
  statistics?: {
    highestScore: number;
    lowestScore: number;
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

interface SchoolConfig {
  principalSignatureUrl?: string | null;
  principalName?: string | null;
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
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);

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

  useEffect(() => {
    let mounted = true;

    const fetchSchoolConfig = async () => {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/settings/data`, {
          credentials: "include",
        });

        if (!response.ok) return;

        const data = await response.json();
        if (mounted) {
          setSchoolConfig(data?.config ?? null);
        }
      } catch (error) {
        console.error("Error loading school config:", error);
      }
    };

    fetchSchoolConfig();

    return () => {
      mounted = false;
    };
  }, []);

  const getGradeColor = (grade: string) => GRADE_COLORS[grade] || { bg: "bg-gray-100", text: "text-gray-900" };

  const averageScore = data.summary?.averageScore ?? data.averageScore ?? 0;
  const totalScore = data.summary?.totalScore ?? data.subjects.reduce((sum, subject) => sum + subject.totalScore, 0);
  const classPosition = data.summary?.classPosition ?? data.classPosition;
  const totalSubjects = data.totalSubjects ?? data.subjects.length;
  const highestScore = data.summary?.highestScore ?? data.statistics?.highestScore ?? Math.max(...data.subjects.map((subject) => subject.totalScore), 0);
  const lowestScore = data.summary?.lowestScore ?? data.statistics?.lowestScore ?? Math.min(...data.subjects.map((subject) => subject.totalScore), 0);
  const passRate = data.summary?.passRate ?? data.statistics?.passRate ?? 0;
  const attendance = data.summary?.attendance ?? data.statistics?.attendance;
  const maxAttendance = data.summary?.maxAttendance ?? data.statistics?.maxAttendance;
  const subjectColumns = {
    hasCa: true,
    hasExam: true,
    hasPosition: data.subjects.some((subject) => subject.subjectPosition),
  };

  return (
    <div className="space-y-6">
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

      <div className="mx-auto bg-white" style={{ width: '210mm', maxWidth: '100%', aspectRatio: '1/1.414' }}>
        <div
          id={`report-card-${pupilId}`}
          className="h-full overflow-auto border border-gray-300 p-8 print:p-0 print:border-0"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
            {data.school.logoUrl ? (
              <img
                src={data.school.logoUrl}
                alt="School Logo"
                className="w-20 h-20 mx-auto mb-3 object-contain"
              />
            ) : (
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-4 border-gray-800">
                <span className="text-white font-bold text-lg">SB</span>
              </div>
            )}

            <h1 className="text-xl font-bold text-gray-900 mb-1">{data.school.name}</h1>
            {data.school.address && (
              <p className="text-xs text-gray-700 mb-2">{data.school.address}</p>
            )}
            <p className="text-xs font-semibold text-gray-800">STATEMENT OF RESULT</p>
            <p className="text-xs text-gray-600 mt-2">{data.term.session}</p>

            <div className="grid grid-cols-4 gap-2 text-xs mt-4 text-gray-700 font-medium">
              <div>
                <p className="text-[10px] font-semibold text-gray-600">TERM</p>
                <p className="font-bold">{data.term.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-600">CLASS</p>
                <p className="font-bold">{data.class.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-600">ASSESSMENT</p>
                <p className="font-bold text-[10px]">{data.assessment?.name || 'Assessment'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-600">DATE</p>
                <p className="font-bold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0">
              {data.student.photoUrl ? (
                <img
                  src={data.student.photoUrl}
                  alt={data.student.name}
                  className="w-20 h-24 object-cover border-2 border-gray-400 rounded"
                />
              ) : (
                <div className="w-20 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-[10px] text-center px-1">
                  Student Photo
                </div>
              )}
            </div>

            <div className="grid gap-x-8 gap-y-3 text-xs grid-cols-2 flex-1 content-start pt-1">
              <div>
                <p className="text-gray-600 font-semibold text-xs">Pupil's Name:</p>
                <p className="text-gray-900 font-bold">{data.student.name}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold text-xs">Admission No:</p>
                <p className="text-gray-900 font-bold">{data.student.admissionNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold text-xs">Class:</p>
                <p className="text-gray-900 font-bold">{data.class.name}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold text-xs">Term/Session:</p>
                <p className="text-gray-900 font-bold">{data.term.name} {data.term.session}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold text-xs">Date of Birth:</p>
                <p className="text-gray-900 font-bold">{data.student.dateOfBirth || '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold text-xs">Gender:</p>
                <p className="text-gray-900 font-bold">{data.student.gender || '—'}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold text-gray-900 mb-2">ACADEMIC PERFORMANCE</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-gray-500">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="border border-gray-500 p-1 text-left font-bold">Subject</th>
                    {subjectColumns.hasCa && <th className="border border-gray-500 p-1 text-center font-bold">CA</th>}
                    {subjectColumns.hasExam && <th className="border border-gray-500 p-1 text-center font-bold">Exam</th>}
                    <th className="border border-gray-500 p-1 text-center font-bold">Total</th>
                    <th className="border border-gray-500 p-1 text-center font-bold">Grade</th>
                    {subjectColumns.hasPosition && <th className="border border-gray-500 p-1 text-center font-bold">Position</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.subjects.map((subject, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-500 p-1 text-gray-900 font-medium">{subject.subjectName}</td>
                      <td className="border border-gray-500 p-1 text-center text-gray-900">{subject.caScore ?? '—'}</td>
                      <td className="border border-gray-500 p-1 text-center text-gray-900">{subject.examScore ?? '—'}</td>
                      <td className="border border-gray-500 p-1 text-center text-gray-900 font-semibold">{subject.totalScore.toFixed(1)}</td>
                      <td className="border border-gray-500 p-1 text-center">
                        <span className="inline-block bg-blue-100 px-2 py-0.5 rounded font-bold text-blue-900">
                          {subject.grade}
                        </span>
                      </td>
                      {subjectColumns.hasPosition && (
                        <td className="border border-gray-500 p-1 text-center text-gray-900 font-semibold">
                          {subject.subjectPosition ? `${subject.subjectPosition}` : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6 text-xs">
            <div className="border-2 border-gray-400 p-2 text-center bg-blue-50">
              <p className="text-gray-600 font-semibold">Average</p>
              <p className="text-lg font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
            </div>
            <div className="border-2 border-gray-400 p-2 text-center bg-green-50">
              <p className="text-gray-600 font-semibold">Position</p>
              <p className="text-lg font-bold text-gray-900">{classPosition || '—'}</p>
            </div>
            <div className="border-2 border-gray-400 p-2 text-center bg-purple-50">
              <p className="text-gray-600 font-semibold">Subjects</p>
              <p className="text-lg font-bold text-gray-900">{totalSubjects}</p>
            </div>
            <div className="border-2 border-gray-400 p-2 text-center bg-orange-50">
              <p className="text-gray-600 font-semibold">Pass Rate</p>
              <p className="text-lg font-bold text-gray-900">{passRate.toFixed(0)}%</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {data.remarks?.teacherComment && (
              <div className="border border-gray-400 p-2 bg-yellow-50">
                <p className="text-xs font-bold text-gray-900 mb-1">TEACHER'S REMARK:</p>
                <p className="text-xs text-gray-800">{data.remarks.teacherComment}</p>
              </div>
            )}
            {data.remarks?.promotionStatus && (
              <div className="border border-gray-400 p-2 bg-blue-50">
                <p className="text-xs font-bold text-gray-900 mb-1">PROMOTION STATUS:</p>
                <p className="text-xs text-gray-800">{data.remarks.promotionStatus}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 text-xs">
            <div className="border-t border-gray-600 pt-2">
              <p className="h-12"></p>
              <p className="font-semibold text-gray-900">Teacher's Signature</p>
              <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 p-2 min-h-20">
              {data.school.stampUrl ? (
                <img
                  src={data.school.stampUrl}
                  alt="School Stamp"
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <>
                  <p className="text-gray-500 font-semibold text-xs mb-2">SCHOOL STAMP</p>
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-400 text-center">Official<br />Seal</span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-gray-600 pt-2">
              {schoolConfig?.principalSignatureUrl ? (
                <div className="mb-2">
                  <img
                    src={schoolConfig.principalSignatureUrl}
                    alt="Principal Signature"
                    className="h-12 object-contain"
                  />
                </div>
              ) : (
                <p className="h-12"></p>
              )}
              <p className="font-semibold text-gray-900">Principal's Signature</p>
              <p className="text-gray-600">{schoolConfig?.principalName || data.school.principalName || 'Principal/Headmaster'}</p>
            </div>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-gray-300 text-xs text-gray-600">
            <p>Verification Code: {pupilId.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs">Generated on {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 print:hidden">
        Layout aligned to the admin report card design.
      </div>
    </div>
  );
}
