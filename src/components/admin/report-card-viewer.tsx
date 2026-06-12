'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, File } from 'lucide-react';

interface ReportCardViewerProps {
  assessmentId: string;
  pupils?: Array<{
    id: string;
    name: string;
    admissionNo: string | null;
  }>;
  schoolId?: string;
  pupilId?: string | null;
  readonly?: boolean;
}

interface ReportCard {
  student: {
    id: string;
    name: string;
    admissionNo: string | null;
    gender: string | null;
    dateOfBirth: string | null;
  };
  school: {
    name: string;
    address: string | null;
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
    subjectPosition: number | null;
  }>;
  averageScore: number;
  classPosition: number | null;
  totalSubjects: number;
  teacherRemark: string | null;
  statistics: {
    highestScore: number;
    lowestScore: number;
    passRate: number;
  };
}

export function ReportCardViewer({
  assessmentId,
  pupils,
  schoolId,
  pupilId: initialPupilId,
  readonly,
}: ReportCardViewerProps) {
  const [selectedPupil, setSelectedPupil] = useState<string | null>(
    initialPupilId || (pupils && pupils.length > 0 ? pupils[0].id : null)
  );
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load report card when in readonly mode with pupilId
  useEffect(() => {
    if (readonly && initialPupilId && !reportCard) {
      handleViewReportCard(initialPupilId);
    }
  }, []);

  const handleViewReportCard = async (pupilId: string) => {
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {};
      if (schoolId) {
        headers['x-school-id'] = schoolId;
      }
      const response = await fetch(`/api/report-cards/${assessmentId}/${pupilId}`, {
        headers,
      });

      if (!response.ok) throw new Error('Failed to fetch report card');

      const data = await response.json();
      setReportCard(data);
      setSelectedPupil(pupilId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report card');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (pupilId: string) => {
    try {
      const headers: HeadersInit = {};
      if (schoolId) {
        headers['x-school-id'] = schoolId;
      }
      const response = await fetch(`/api/pdf-reports/${assessmentId}/${pupilId}`, {
        headers,
      });

      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-card-${pupilId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Only show header and pupil list if not in readonly mode */}
      {!readonly && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 text-lg font-semibold">Report Cards</h3>

          {/* Pupil List */}
          {!pupils || pupils.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No students available</p>
            </div>
          ) : (
            <div className="mb-6 space-y-2 max-h-96 overflow-y-auto">
            {pupils.map((pupil) => (
              <div
                key={pupil.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  selectedPupil === pupil.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                } cursor-pointer transition`}
                onClick={() => handleViewReportCard(pupil.id)}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{pupil.name}</p>
                  {pupil.admissionNo && (
                    <p className="text-sm text-gray-500">{pupil.admissionNo}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewReportCard(pupil.id);
                    }}
                    disabled={loading}
                    className="gap-1 text-sm"
                  >
                    <Eye size={16} />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPDF(pupil.id);
                    }}
                    disabled={loading}
                    className="gap-1 text-sm"
                  >
                    <Download size={16} />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Report Card View - Shows in both modes */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-gray-600">Loading report card...</p>
        </div>
      )}

      {reportCard && (
        <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 print:p-0">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-gray-900">{reportCard.school.name}</h2>
              {reportCard.school.address && (
                <p className="text-sm text-gray-600">{reportCard.school.address}</p>
              )}
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900">{reportCard.student.name}</p>
                {reportCard.student.admissionNo && (
                  <p className="text-gray-600">
                    Admission No: {reportCard.student.admissionNo}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-600">Class: {reportCard.class.name}</p>
                <p className="text-gray-600">
                  Term: {reportCard.term.name} ({reportCard.term.session})
                </p>
              </div>
            </div>

            {/* Subjects Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="py-2 text-left font-semibold text-gray-900">Subject</th>
                    <th className="py-2 text-center font-semibold text-gray-900">Score</th>
                    <th className="py-2 text-center font-semibold text-gray-900">Grade</th>
                    <th className="py-2 text-center font-semibold text-gray-900">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCard.subjects.map((subject, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-2 text-gray-900">{subject.subjectName}</td>
                      <td className="py-2 text-center text-gray-900">
                        {subject.totalScore.toFixed(2)}
                      </td>
                      <td className="py-2 text-center">
                        <Badge>{subject.grade}</Badge>
                      </td>
                      <td className="py-2 text-center text-gray-900">
                        {subject.subjectPosition || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-gray-600">Average Score</p>
                <p className="font-semibold text-gray-900">
                  {reportCard.averageScore.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Class Position</p>
                <p className="font-semibold text-gray-900">
                  {reportCard.classPosition || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Subjects</p>
                <p className="font-semibold text-gray-900">{reportCard.totalSubjects}</p>
              </div>
              <div>
                <p className="text-gray-600">Pass Rate</p>
                <p className="font-semibold text-gray-900">
                  {reportCard.statistics.passRate.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => window.print()}
                className="gap-2 text-sm"
              >
                <File size={18} />
                Print Report Card
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
