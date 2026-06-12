"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import { ReportCardViewer } from "./report-card-viewer";

interface Pupil {
  id: string;
  name: string;
}

interface ReportsTabProps {
  assessmentId: string;
  pupils: Pupil[];
  status: string;
}

export function AdminReportsTab({ assessmentId, pupils, status }: ReportsTabProps) {
  const [selectedPupilId, setSelectedPupilId] = useState<string | null>(
    pupils.length > 0 ? pupils[0].id : null
  );
  const [downloading, setDownloading] = useState(false);

  const selectedPupil = pupils.find((p) => p.id === selectedPupilId);

  const handleDownloadPDF = async (pupilId: string) => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/pdf-reports/${assessmentId}/${pupilId}`);
      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${assessmentId}-${pupilId}.pdf`;
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

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold mb-3">Select Student:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {pupils.map((pupil) => (
            <button
              key={pupil.id}
              onClick={() => setSelectedPupilId(pupil.id)}
              className={`px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors ${
                selectedPupilId === pupil.id
                  ? "bg-brand text-white"
                  : "border border-border bg-background hover:bg-background/80"
              }`}
            >
              {pupil.name}
            </button>
          ))}
        </div>
      </div>

      {/* Report Card Display */}
      {selectedPupil && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">{selectedPupil.name}</h3>
              <p className="text-sm text-muted">Report Card Preview</p>
            </div>
            <div className="flex gap-2">
              {status === "PUBLISHED" && (
                <Badge variant="success">Published</Badge>
              )}
              <Button
                variant="outline"
                onClick={() => handleDownloadPDF(selectedPupilId!)}
                disabled={downloading}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {downloading ? "Downloading..." : "Download PDF"}
              </Button>
            </div>
          </div>

          {/* ReportCardViewer Component */}
          <ReportCardViewer
            assessmentId={assessmentId}
            pupilId={selectedPupilId}
            readonly={true}
          />
        </div>
      )}

      {/* Bulk Actions */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">
          💡 <strong>Bulk Export:</strong> Use the individual download buttons to export report cards, or access the API directly for bulk operations.
        </p>
      </div>
    </div>
  );
}
