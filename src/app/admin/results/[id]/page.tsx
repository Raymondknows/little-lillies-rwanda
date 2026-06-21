"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table2, ChevronRight, AlertCircle } from "lucide-react";
import { AssessmentScores } from "@/components/admin/assessment-scores";
import { AssessmentSetupWizard } from "@/components/admin/assessment-setup-wizard";
import { AssessmentActionsPanel } from "@/components/admin/assessment-actions-panel";
import { ClassStatistics } from "@/components/admin/class-statistics";
import { AuditTrail } from "@/components/admin/audit-trail";
import { AdminReportsTab } from "@/components/admin/admin-reports-tab";

interface Assessment {
  id: string;
  name: string;
  schoolId: string;
  phase: string;
  status: string;
  componentData?: string | null;
  publishedAt?: string;
  term: {
    name: string;
  };
  results: Array<{
    pupilId: string;
    caScore: number | null;
    testScore: number | null;
    examScore: number | null;
    totalScore: number | null;
    pupil: { id: string; name: string };
  }>;
  _count: { results: number };
}

interface PhasePupil {
  id: string;
  name: string;
  admissionNo?: string;
  photoUrl?: string;
  className?: string;
}

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [phasePupils, setPhasePupils] = useState<PhasePupil[]>([]);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/results/${id}`);
        if (!response.ok) throw new Error("Failed to fetch assessment");
        const data = await response.json();
        setAssessment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  useEffect(() => {
    if (!assessment?.phase) return;

    const fetchPhasePupils = async () => {
      try {
        const response = await fetch('/api/admin/students/data', {
          credentials: 'include',
        });

        if (!response.ok) {
          setPhasePupils([]);
          return;
        }

        const data = await response.json();
        const pupils = Array.isArray(data.pupils) ? data.pupils : [];

        setPhasePupils(
          pupils
            .filter((pupil: any) => pupil?.class?.phase === assessment.phase)
            .map((pupil: any) => ({
              id: pupil.id,
              name: `${pupil.firstName || ''} ${pupil.lastName || ''}`.trim() || pupil.name || 'Student',
              admissionNo: pupil.admissionNo,
              photoUrl: pupil.photoUrl,
              className: pupil.class ? `${pupil.class.name}${pupil.class.arm ? ` ${pupil.class.arm}` : ''}` : undefined,
            }))
        );
      } catch (err) {
        console.error('Failed to load phase pupils:', err);
        setPhasePupils([]);
      }
    };

    fetchPhasePupils();
  }, [assessment?.phase]);

  const handleApprove = async () => {
    if (!assessment) return;
    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/assessments/${id}/approve`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to approve");
      const updated = await response.json();
      setAssessment(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!assessment) return;
    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/assessments/${id}/publish`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to publish");
      const updated = await response.json();
      setAssessment(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnDraft = async () => {
    if (!assessment) return;
    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/assessments/${id}/return-draft`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to return to draft");
      const updated = await response.json();
      setAssessment(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to return to draft");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <div className="text-center text-muted">Loading assessment details...</div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <Link href="/admin/results" className="text-sm font-medium text-brand hover:underline">
          ← Results
        </Link>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-muted">{error || "Assessment not found"}</p>
        </div>
      </div>
    );
  }

  const pupils = Array.from(
    new Map(assessment.results.map((r) => [r.pupil.id, r.pupil])).values()
  );
  const reportPupils = phasePupils.length > 0 ? phasePupils : pupils;
  const existingResults = assessment.results.reduce(
    (acc, r) => {
      acc[r.pupilId] = r;
      return acc;
    },
    {} as Record<string, any>
  );
  const isConfigured = Boolean(assessment.componentData);

  return (
    <div className="mx-auto max-w-7xl px-3 py-4">
      <Link href="/admin/results" className="text-sm font-medium text-brand hover:underline print:hidden">
        ← Results
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">{assessment.name}</h1>
          <p className="text-muted">{assessment.term.name}</p>
        </div>
        <Badge
          variant={
            assessment.status === "PUBLISHED" ? "success" : assessment.status === "APPROVED" ? "brand" : "default"
          }
        >
          {assessment.status}
        </Badge>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Setup Wizard Modal */}
      {showSetupWizard && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 print:hidden">
          <AssessmentSetupWizard
            assessmentId={id}
            onSetupComplete={() => {
              setShowSetupWizard(false);
              window.location.reload();
            }}
            onCancel={() => setShowSetupWizard(false)}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mt-6 border-b border-gray-200 print:hidden">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("scores")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "scores"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Scores
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "statistics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "audit"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === "reports"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="mt-6 space-y-6">
          {/* Setup Wizard Prompt */}
          {assessment.status === "DRAFT" && !showSetupWizard && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900">Assessment Not Configured</h3>
                  <p className="text-sm text-amber-800 mt-1">
                    Define the grading structure (CA/Test/Exam weights) before proceeding.
                  </p>
                  <Button
                    onClick={() => setShowSetupWizard(true)}
                    className="mt-3"
                  >
                    Configure Assessment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Actions Panel */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Assessment Management</h2>
            <AssessmentActionsPanel
              assessmentId={id}
              status={assessment.status}
              schoolId={assessment.schoolId}
              isConfigured={isConfigured}
              onStatusChange={(newStatus) => {
                setAssessment({ ...assessment, status: newStatus });
              }}
            />
          </div>

          {!isConfigured && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">Assessment not configured yet.</p>
              <p className="mt-1 text-sm text-amber-800">
                Configure CA, Test, and Exam weights first. Result calculation, locking, unlocking, and publishing are disabled for now.
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button href={`/admin/results/${id}/broadsheet`} variant="outline" className="h-10 whitespace-nowrap px-4">
              <Table2 className="h-4 w-4" />
              View Broadsheet
            </Button>
            <Button href={`/admin/results/${id}/report`} variant="outline" className="h-10 whitespace-nowrap px-4">
              View Report Cards
            </Button>
            <Button className="h-10 whitespace-nowrap px-4 opacity-60 cursor-not-allowed" variant="outline" disabled title="Locked for now">
              Download Results (Locked)
            </Button>
          </div>

          {assessment.status === "PUBLISHED" && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-700 font-medium">✓ Published to Parents</p>
              <p className="text-sm text-green-600 mt-1">
                Results were published on{" "}
                {new Date(assessment.publishedAt || "").toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Scores Tab */}
      {activeTab === "scores" && assessment.status === "DRAFT" && phasePupils.length > 0 && (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Enter Assessment Scores</h2>
            <p className="text-sm text-muted">CA (20%) + Test (30%) + Exam (50%) = Total</p>
          </div>
          <AssessmentScores
            assessmentId={id}
            pupils={phasePupils}
            existingResults={existingResults}
          />
        </div>
      )}

      {activeTab === "scores" && assessment.status !== "DRAFT" && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">
            Scores cannot be edited after leaving draft status
          </p>
        </div>
      )}

      {/* Results Summary Table */}
      {activeTab === "scores" && phasePupils.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Scores Entered</h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium sm:px-4">Student</th>
                  <th className="px-3 py-2 font-medium text-center sm:px-4">CA</th>
                  <th className="px-3 py-2 font-medium text-center sm:px-4">Test</th>
                  <th className="px-3 py-2 font-medium text-center sm:px-4">Exam</th>
                  <th className="px-3 py-2 font-medium text-center sm:px-4">Total</th>
                  <th className="px-3 py-2 font-medium text-center sm:px-4">Grade</th>
                </tr>
              </thead>
              <tbody>
                {phasePupils.map((pupil) => {
                  const result = existingResults[pupil.id];
                  return (
                    <tr key={pupil.id} className="border-t border-border hover:bg-background/50">
                      <td className="px-3 py-2 font-medium sm:px-4">{pupil.name}</td>
                      <td className="px-3 py-2 text-center sm:px-4">{result?.caScore ?? "—"}</td>
                      <td className="px-3 py-2 text-center sm:px-4">{result?.testScore ?? "—"}</td>
                      <td className="px-3 py-2 text-center sm:px-4">{result?.examScore ?? "—"}</td>
                      <td className="px-3 py-2 text-center font-semibold sm:px-4">
                        {result?.totalScore ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-center sm:px-4">
                        {result?.grade ? (
                          <Badge>{result.grade}</Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === "statistics" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Class Statistics</h2>
          <ClassStatistics assessmentId={id} schoolId={assessment.schoolId} />
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === "audit" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Action Timeline</h2>
          <AuditTrail assessmentId={id} />
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="mt-6">
          <AdminReportsTab 
            assessmentId={id} 
            pupils={reportPupils} 
            status={assessment.status}
          />
        </div>
      )}
    </div>
  );
}
