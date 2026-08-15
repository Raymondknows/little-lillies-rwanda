'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getBackendUrl } from '@/lib/backend-url';
import { Download, Eye, File } from 'lucide-react';
import { ReportCardDocument } from '@/components/reports/report-card-document';

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
  gradingScale?: Array<{
    grade: string;
    minScore: number;
    maxScore: number;
  }>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signatories, setSignatories] = useState<Array<any>>([]);
  const [selectedSignatory, setSelectedSignatory] = useState<string>('auto');

  // Auto-load report card when in readonly mode with pupilId
  // Re-fetch when pupilId changes (for dropdown selection updates)
  useEffect(() => {
    if (readonly && initialPupilId) {
      handleViewReportCard(initialPupilId);
    }
  }, [readonly, initialPupilId]);

  useEffect(() => {
    // load signatories for dropdown when in admin context
    (async () => {
      try {
        const backendUrl = getBackendUrl();
        const resp = await fetch(`${backendUrl}/api/admin/signatories`, { credentials: 'include' });
        if (!resp.ok) return;
        const d = await resp.json();
        setSignatories(d.signatories || []);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleViewReportCard = async (pupilId: string) => {
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {};
      if (schoolId) {
        headers['x-school-id'] = schoolId;
      }
      const params = new URLSearchParams();
      if (selectedSignatory && selectedSignatory !== 'auto') {
        if (selectedSignatory === 'principal') params.set('signatoryMode', 'principal');
        else params.set('signatoryId', selectedSignatory);
      }
      const backendUrl = getBackendUrl();
      const url = `${backendUrl}/api/report-cards/${assessmentId}/${pupilId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { headers, credentials: 'include' });

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
      const params = new URLSearchParams();
      if (selectedSignatory && selectedSignatory !== 'auto') {
        if (selectedSignatory === 'principal') params.set('signatoryMode', 'principal');
        else params.set('signatoryId', selectedSignatory);
      }
      const backendUrl = getBackendUrl();
      const url = `${backendUrl}/api/pdf-reports/${assessmentId}/${pupilId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { headers, credentials: 'include' });

      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `report-card-${pupilId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
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

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Signature</label>
            <select
              value={selectedSignatory}
              onChange={(e) => setSelectedSignatory(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="auto">Auto (use section signatory)</option>
              <option value="principal">Principal (Global)</option>
              {signatories.map((s) => (
                <option key={s.id} value={s.id}>{(s.phase ? s.phase + ' — ' : '') + s.name}</option>
              ))}
            </select>
          </div>

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
          <ReportCardDocument reportCard={reportCard as never} photoUrl={photoUrl} />

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
