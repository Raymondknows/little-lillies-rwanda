'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, File } from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';

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
  photoUrl?: string | null;
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
    sortOrder: number | null;
  };
  subjects: Array<{
    subjectName: string;
    caScore?: number | null;
    testScore?: number | null;
    examScore?: number | null;
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

interface SchoolConfig {
  logoUrl?: string | null;
  stampUrl?: string | null;
  principalSignatureUrl?: string | null;
  principalName?: string | null;
  principalComment?: string | null;
}

export function ReportCardViewer({
  assessmentId,
  pupils,
  schoolId,
  pupilId: initialPupilId,
  readonly,
  photoUrl,
}: ReportCardViewerProps) {
  const [selectedPupil, setSelectedPupil] = useState<string | null>(
    initialPupilId || (pupils && pupils.length > 0 ? pupils[0].id : null)
  );
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-load report card when in readonly mode with pupilId
  // Re-fetch when pupilId changes (for dropdown selection updates)
  useEffect(() => {
    if (readonly && initialPupilId) {
      handleViewReportCard(initialPupilId);
    }
  }, [readonly, initialPupilId]);

  // Fetch school configuration (logo, stamp, signature, principal info)
  useEffect(() => {
    const fetchSchoolConfig = async () => {
      try {
        setConfigLoading(true);
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/settings/data`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setSchoolConfig(data.config);
        }
      } catch (err) {
        console.error('Error loading school config:', err);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchSchoolConfig();
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
        <div className="space-y-4">
          {/* Print Container - A4 Portrait */}
          <div className="mx-auto bg-white" style={{ width: '210mm', maxWidth: '100%', aspectRatio: '1/1.414' }}>
            <div className="h-full overflow-auto border border-gray-300 p-8 print:p-0 print:border-0" style={{ fontFamily: 'Arial, sans-serif' }}>
              {/* School Header with Logo */}
              <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
                {/* Logo */}
                {schoolConfig?.logoUrl ? (
                  <img 
                    src={schoolConfig.logoUrl} 
                    alt="School Logo" 
                    className="w-20 h-20 mx-auto mb-3 object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-4 border-gray-800">
                    <span className="text-white font-bold text-lg">SB</span>
                  </div>
                )}
                
                {/* School Name and Details */}
                <h1 className="text-xl font-bold text-gray-900 mb-1">{reportCard.school.name}</h1>
                {reportCard.school.address && (
                  <p className="text-xs text-gray-700 mb-2">{reportCard.school.address}</p>
                )}
                <p className="text-xs font-semibold text-gray-800">PUPIL'S CUMULATIVE REPORT</p>
              </div>

              {/* Student Information Section */}
              <div className="flex gap-4 mb-6">
                {/* Student Photo */}
                {photoUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={photoUrl} 
                      alt={reportCard.student.name} 
                      className="w-20 h-24 object-cover border-2 border-gray-400 rounded"
                    />
                  </div>
                )}
                
                {/* Student Details Grid */}
                <div className={`grid gap-x-8 gap-y-3 text-xs ${photoUrl ? 'grid-cols-2 flex-1' : 'grid-cols-2 w-full'}`}>
                  <div>
                    <p className="text-gray-600 font-semibold text-xs">Pupil's Name:</p>
                    <p className="text-gray-900 font-bold">{reportCard.student.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-xs">Admission No:</p>
                    <p className="text-gray-900 font-bold">{reportCard.student.admissionNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-xs">Class:</p>
                    <p className="text-gray-900 font-bold">{reportCard.class.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-xs">Term/Session:</p>
                    <p className="text-gray-900 font-bold">{reportCard.term.name} {reportCard.term.session}</p>
                  </div>
                </div>
              </div>

              {/* Academic Results Table */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-900 mb-2">ACADEMIC PERFORMANCE</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-gray-500">
                    <thead>
                      <tr className="bg-gray-800 text-white">
                        <th className="border border-gray-500 p-1 text-left font-bold">Subject</th>
                        <th className="border border-gray-500 p-1 text-center font-bold">CA</th>
                        <th className="border border-gray-500 p-1 text-center font-bold">Test</th>
                        <th className="border border-gray-500 p-1 text-center font-bold">Exam</th>
                        <th className="border border-gray-500 p-1 text-center font-bold">Total</th>
                        <th className="border border-gray-500 p-1 text-center font-bold">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportCard.subjects.map((subject, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="border border-gray-500 p-1 text-gray-900 font-medium">{subject.subjectName}</td>
                          <td className="border border-gray-500 p-1 text-center text-gray-900">
                            {subject.caScore ?? '—'}
                          </td>
                          <td className="border border-gray-500 p-1 text-center text-gray-900">
                            {subject.testScore ?? '—'}
                          </td>
                          <td className="border border-gray-500 p-1 text-center text-gray-900">
                            {subject.examScore ?? '—'}
                          </td>
                          <td className="border border-gray-500 p-1 text-center text-gray-900 font-semibold">
                            {subject.totalScore.toFixed(1)}
                          </td>
                          <td className="border border-gray-500 p-1 text-center">
                            <span className="inline-block bg-blue-100 px-2 py-0.5 rounded font-bold text-blue-900">
                              {subject.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {reportCard.term.sortOrder === 3 && reportCard.thirdTermHistory?.entries?.length ? (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-900 mb-2">THIRD TERM CUMULATIVE HISTORY</p>
                  <div className="overflow-x-auto border border-gray-300 rounded">
                    <table className="w-full text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-900">
                          <th className="border border-gray-300 p-1 text-left font-semibold">Subject</th>
                          {reportCard.thirdTermHistory.terms.map((term) => (
                            <th key={term.id} className="border border-gray-300 p-1 text-center font-semibold">{term.name}</th>
                          ))}
                          <th className="border border-gray-300 p-1 text-center font-semibold">Term 3</th>
                          <th className="border border-gray-300 p-1 text-center font-semibold">Cumulative</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportCard.thirdTermHistory.entries.map((entry, idx) => (
                          <tr key={`${entry.subjectName}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 p-1 font-medium text-gray-900">{entry.subjectName}</td>
                            {entry.previousTotals.map((termTotal) => (
                              <td key={`${entry.subjectName}-${termTotal.termId}`} className="border border-gray-300 p-1 text-center text-gray-900">
                                {termTotal.totalScore !== null ? termTotal.totalScore.toFixed(1) : '—'}
                              </td>
                            ))}
                            <td className="border border-gray-300 p-1 text-center text-gray-900">
                              {entry.currentTotal !== null ? entry.currentTotal.toFixed(1) : '—'}
                            </td>
                            <td className="border border-gray-300 p-1 text-center font-semibold text-gray-900">
                              {entry.cumulativeTotal !== null ? entry.cumulativeTotal.toFixed(1) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {/* Performance Summary */}
              <div className="grid grid-cols-4 gap-2 mb-6 text-xs">
                <div className="border-2 border-gray-400 p-2 text-center bg-blue-50">
                  <p className="text-gray-600 font-semibold">Average</p>
                  <p className="text-lg font-bold text-gray-900">{reportCard.averageScore.toFixed(1)}</p>
                </div>
                <div className="border-2 border-gray-400 p-2 text-center bg-green-50">
                  <p className="text-gray-600 font-semibold">Position</p>
                  <p className="text-lg font-bold text-gray-900">{reportCard.classPosition || '—'}</p>
                </div>
                <div className="border-2 border-gray-400 p-2 text-center bg-purple-50">
                  <p className="text-gray-600 font-semibold">Subjects</p>
                  <p className="text-lg font-bold text-gray-900">{reportCard.totalSubjects}</p>
                </div>
                <div className="border-2 border-gray-400 p-2 text-center bg-orange-50">
                  <p className="text-gray-600 font-semibold">Pass Rate</p>
                  <p className="text-lg font-bold text-gray-900">{reportCard.statistics.passRate.toFixed(0)}%</p>
                </div>
              </div>

              {/* Teacher's Remark and Principal's Comment */}
              <div className="space-y-3 mb-6">
                {reportCard.teacherRemark && (
                  <div className="border border-gray-400 p-2 bg-yellow-50">
                    <p className="text-xs font-bold text-gray-900 mb-1">TEACHER'S REMARK:</p>
                    <p className="text-xs text-gray-800">{reportCard.teacherRemark}</p>
                  </div>
                )}
                {schoolConfig?.principalComment && (
                  <div className="border border-gray-400 p-2 bg-blue-50">
                    <p className="text-xs font-bold text-gray-900 mb-1">PRINCIPAL'S COMMENT:</p>
                    <p className="text-xs text-gray-800">{schoolConfig.principalComment}</p>
                  </div>
                )}
              </div>

              {/* Official Signatures and Stamp Section */}
              <div className="grid grid-cols-3 gap-3 mt-8 text-xs">
                {/* Class Teacher */}
                <div className="border-t border-gray-600 pt-2">
                  <p className="h-12"></p>
                  <p className="font-semibold text-gray-900">Class Teacher</p>
                  <p className="text-gray-600">Signature & Date</p>
                </div>

                {/* School Stamp Area */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 p-2 min-h-20">
                  {schoolConfig?.stampUrl ? (
                    <img 
                      src={schoolConfig.stampUrl} 
                      alt="School Stamp" 
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <>
                      <p className="text-gray-500 font-semibold text-xs mb-2">SCHOOL STAMP</p>
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-400 text-center">Official<br/>Seal</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Principal/Headmaster */}
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
                  <p className="font-semibold text-gray-900">{schoolConfig?.principalName || 'Principal/Headmaster'}</p>
                  <p className="text-gray-600">Signature & Date</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-400 text-center text-xs text-gray-600">
                <p>This is an official document of {reportCard.school.name}</p>
                <p>Generated by SchoolBase • Confidential</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 print:hidden">
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
