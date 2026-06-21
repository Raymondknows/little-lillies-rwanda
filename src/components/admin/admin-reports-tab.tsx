"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, User } from "lucide-react";
import { ReportCardViewer } from "./report-card-viewer";
import { resolveFileUrl } from "@/lib/api-client";
import { getBackendUrl } from "@/lib/backend-url";

interface Pupil {
  id: string;
  name: string;
  admissionNo?: string;
  photoUrl?: string;
  className?: string;
}

interface ReportsTabProps {
  assessmentId: string;
  pupils: Pupil[];
  status: string;
}

interface StudentDetails {
  id: string;
  name: string;
  admissionNo?: string;
  photoUrl?: string;
  className?: string;
  firstName?: string;
  lastName?: string;
}

export function AdminReportsTab({ assessmentId, pupils, status }: ReportsTabProps) {
  const [selectedPupilId, setSelectedPupilId] = useState<string | null>(
    pupils.length > 0 ? pupils[0].id : null
  );
  const [selectedPupilDetails, setSelectedPupilDetails] = useState<StudentDetails | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [loadingPupilDetails, setLoadingPupilDetails] = useState(false);

  // Fetch full student details with photo when selected pupil changes
  useEffect(() => {
    if (!selectedPupilId) return;

    const fetchPupilDetails = async () => {
      setLoadingPupilDetails(true);
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/students/${selectedPupilId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          // Fallback to basic pupil info if full details not available
          const pupil = pupils.find((p) => p.id === selectedPupilId);
          if (pupil) {
            setSelectedPupilDetails({
              id: pupil.id,
              name: pupil.name,
              admissionNo: pupil.admissionNo,
              photoUrl: pupil.photoUrl,
              className: pupil.className,
            });
          }
          return;
        }

        const data = await response.json();
        setSelectedPupilDetails({
          id: data.id,
          name: `${data.firstName} ${data.lastName}`.trim(),
          admissionNo: data.admissionNo,
          photoUrl: data.photoUrl,
          className: data.class?.name,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } catch (err) {
        console.error('Error fetching pupil details:', err);
        // Fallback to basic info
        const pupil = pupils.find((p) => p.id === selectedPupilId);
        if (pupil) {
          setSelectedPupilDetails({
            id: pupil.id,
            name: pupil.name,
            admissionNo: pupil.admissionNo,
            photoUrl: pupil.photoUrl,
            className: pupil.className,
          });
        }
      } finally {
        setLoadingPupilDetails(false);
      }
    };

    fetchPupilDetails();
  }, [selectedPupilId, pupils]);

  const handleDownloadPDF = async (pupilId: string) => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/pdf-reports/${assessmentId}/${pupilId}`);
      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${selectedPupilDetails?.name || 'student'}-${assessmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (pupils.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center">
        <FileText className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
        <p className="text-muted">No students in this assessment</p>
      </div>
    );
  }

  const photoUrl = selectedPupilDetails ? resolveFileUrl(selectedPupilDetails.photoUrl, selectedPupilDetails.id) : null;

  return (
    <div className="space-y-6">
      {/* Student Selector and Details - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Left: Student Selector Dropdown */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <label className="block text-sm font-semibold mb-4 text-foreground">Select Student:</label>
          <select
            value={selectedPupilId || ""}
            onChange={(e) => setSelectedPupilId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand font-medium"
          >
            {pupils.map((pupil) => (
              <option key={pupil.id} value={pupil.id}>
                {pupil.name}
                {pupil.admissionNo ? ` (${pupil.admissionNo})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Student Details and Actions - Spans 2 columns */}
        {selectedPupilDetails && !loadingPupilDetails && (
          <div className="lg:col-span-2 rounded-lg border border-border bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <div className="flex items-start gap-6">
              {/* Student Photo */}
              <div className="flex-shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={selectedPupilDetails.name}
                    className="h-24 w-24 rounded-lg object-cover ring-2 ring-white shadow-md"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-brand/10 flex items-center justify-center ring-2 ring-white shadow-md">
                    <User className="h-12 w-12 text-brand" />
                  </div>
                )}
              </div>

              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedPupilDetails.name}
                </h3>
                {selectedPupilDetails.admissionNo && (
                  <p className="text-sm text-muted mt-2">
                    Admission No: <span className="font-medium text-foreground">{selectedPupilDetails.admissionNo}</span>
                  </p>
                )}
                {selectedPupilDetails.className && (
                  <p className="text-sm text-muted mt-1">
                    Class: <span className="font-medium text-foreground">{selectedPupilDetails.className}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2">
                {status === "PUBLISHED" && (
                  <Badge variant="success">Published</Badge>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedPupilId!)}
                  disabled={downloading}
                  className="gap-2 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? "Downloading..." : "Download PDF"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {loadingPupilDetails && (
          <div className="lg:col-span-2 rounded-lg border border-border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
            <span className="ml-2 text-sm text-muted">Loading student details...</span>
          </div>
        )}
      </div>

      {/* Report Card Display */}
      {selectedPupilId && !loadingPupilDetails && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="mb-6 print:hidden">
            <h4 className="text-md font-semibold text-foreground">Report Card Preview</h4>
            <p className="text-sm text-muted mt-1">Full assessment details for {selectedPupilDetails?.name}</p>
          </div>

          {/* ReportCardViewer Component */}
          <ReportCardViewer
            assessmentId={assessmentId}
            pupilId={selectedPupilId}
            readonly={true}
            photoUrl={photoUrl}
          />
        </div>
      )}

      {/* Bulk Actions */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 print:hidden">
        <p className="text-sm text-amber-900">
          💡 <strong>Bulk Export:</strong> Use the download button above to export individual report cards, or access the API directly for bulk operations.
        </p>
      </div>
    </div>
  );
}
