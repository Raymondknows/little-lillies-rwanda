"use client";

import Link from "next/link";
import { Fragment, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table2, ChevronRight, AlertCircle } from "lucide-react";
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
    grade: string | null;
    pupil: {
      id: string;
      firstName: string;
      lastName: string;
      admissionNo?: string;
      class?: {
        id: string;
        name: string;
        arm?: string | null;
        phase?: string | null;
      } | null;
    };
    subjectRef?: {
      id?: string | null;
      name?: string | null;
    } | null;
    subject?: string | null;
  }>;
  _count: { results: number };
}

interface SubjectScore {
  subjectId: string;
  totalScore: number | null;
}

interface PupilBroadsheetRow {
  pupilId: string;
  name: string;
  admissionNo?: string;
  className?: string;
  subjectScores: SubjectScore[];
  total: number | null;
  average: number | null;
  grade: string | null;
}

interface ClassBroadsheetGroup {
  className: string;
  subjects: Array<{ subjectId: string; subjectName: string }>;
  pupils: PupilBroadsheetRow[];
  subjectStats: Array<{ subjectId: string; avg: number | null }>;
  classAverage: number | null;
  positionMap: Record<string, number>;
}

function resolveResultTotal(result: {
  caScore: number | null;
  testScore: number | null;
  examScore: number | null;
  totalScore: number | null;
}) {
  if (result.totalScore !== null && result.totalScore !== undefined) {
    return result.totalScore;
  }

  if (result.caScore === null || result.testScore === null || result.examScore === null) {
    return null;
  }

  return result.caScore + result.testScore + result.examScore;
}

function resolveGrade(average: number | null) {
  if (average === null) return null;
  if (average >= 70) return "A";
  if (average >= 60) return "B";
  if (average >= 50) return "C";
  if (average >= 45) return "D";
  if (average >= 40) return "E";
  return "F";
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
  const [broadsheetGroups, setBroadsheetGroups] = useState<ClassBroadsheetGroup[]>([]);

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
    if (!assessment) return;

        const groups = new Map<
      string,
      {
        className: string;
        subjects: Map<string, string>;
        pupils: Map<
          string,
          {
            pupilId: string;
            name: string;
            admissionNo?: string;
            className?: string;
            resultsBySubject: Map<string, typeof assessment.results[number]>;
          }
        >;
      }
    >();

    assessment.results.forEach((result) => {
      const className = result.pupil.class
        ? `${result.pupil.class.name}${result.pupil.class.arm ? ` ${result.pupil.class.arm}` : ''}`
        : 'Class not assigned';

      const subjectId = result.subjectRef?.id ?? result.subject ?? `unknown-${result.pupilId}-${result.subjectRef?.name ?? result.subject ?? 'general'}`;
      const subjectName = result.subjectRef?.name || result.subject || 'General';

      const group = groups.get(className) ?? {
        className,
        subjects: new Map(),
        pupils: new Map(),
      };

      if (!group.subjects.has(subjectId)) {
        group.subjects.set(subjectId, subjectName);
      }

      const pupil = group.pupils.get(result.pupilId) ?? {
        pupilId: result.pupilId,
        name: `${result.pupil.firstName} ${result.pupil.lastName}`.trim(),
        admissionNo: result.pupil.admissionNo ?? undefined,
        className,
        resultsBySubject: new Map(),
      };

      pupil.resultsBySubject.set(subjectId, result);
      group.pupils.set(result.pupilId, pupil);
      groups.set(className, group);
    });

    const classGroups = Array.from(groups.values())
      .map((group) => {
        const subjects = Array.from(group.subjects.entries())
          .map(([subjectId, subjectName]) => ({ subjectId, subjectName }))
          .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

        const pupils = Array.from(group.pupils.values())
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((pupil) => {
            const subjectScores = subjects.map((subject) => {
              const result = pupil.resultsBySubject.get(subject.subjectId);
              return {
                subjectId: subject.subjectId,
                totalScore: result ? resolveResultTotal(result) : null,
              };
            });

            const totals = subjectScores
              .map((score) => score.totalScore)
              .filter((value): value is number => value !== null);

            const total = totals.length > 0 ? totals.reduce((sum, value) => sum + value, 0) : null;
            const average = totals.length > 0 ? total! / totals.length : null;

            return {
              pupilId: pupil.pupilId,
              name: pupil.name,
              admissionNo: pupil.admissionNo,
              className: pupil.className,
              subjectScores,
              total,
              average,
              grade: resolveGrade(average),
            };
          });

        const sortedByAverage = [...pupils]
          .filter((row) => row.average !== null)
          .sort((a, b) => (b.average ?? 0) - (a.average ?? 0));

        const positionMap: Record<string, number> = {};
        let currentPosition = 1;
        let lastAverage: number | null = null;

        sortedByAverage.forEach((row, index) => {
          if (lastAverage === null || row.average !== lastAverage) {
            currentPosition = index + 1;
            lastAverage = row.average;
          }
          positionMap[row.pupilId] = currentPosition;
        });

        const subjectStats = subjects.map((subject) => {
          const values = pupils
            .map((row) => row.subjectScores.find((score) => score.subjectId === subject.subjectId)?.totalScore ?? null)
            .filter((value): value is number => value !== null);

          return {
            subjectId: subject.subjectId,
            avg: values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
          };
        });

        const classAverageValues = pupils.map((row) => row.average).filter((value): value is number => value !== null);
        const classAverage =
          classAverageValues.length > 0
            ? classAverageValues.reduce((sum, value) => sum + value, 0) / classAverageValues.length
            : null;

        return {
          className: group.className,
          subjects,
          pupils,
          subjectStats,
          classAverage,
          positionMap,
        };
      })
      .sort((a, b) => a.className.localeCompare(b.className));

    setBroadsheetGroups(classGroups);

  }, [assessment]);

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
  const reportPupils = pupils.map((pupil) => ({
    ...pupil,
    name: `${pupil.firstName} ${pupil.lastName}`.trim(),
  }));
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
            <Button
              onClick={() => setActiveTab("reports")}
              variant="outline"
              className="h-10 whitespace-nowrap px-4"
            >
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
      {activeTab === "scores" && (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Assessment Scores</h2>
            <p className="text-sm text-muted">
              Saved pupil results are displayed grouped by class. Totals and grades reflect stored assessment results, not editable inputs.
            </p>
          </div>
        </div>
      )}

      {/* Results Summary Table */}
      {activeTab === "scores" && broadsheetGroups.length > 0 && (
        <div className="mt-6 space-y-8">
          <h2 className="text-lg font-semibold">Scores Entered</h2>
          {broadsheetGroups.map((group) => (
            <div key={group.className} className="space-y-4">
              <div className="rounded-lg border border-border bg-surface p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand">Class: {group.className}</p>
                    <p className="text-sm text-muted">{group.pupils.length} student{group.pupils.length === 1 ? "" : "s"}</p>
                  </div>
                  <p className="text-sm text-muted">Totals and averages are calculated from stored subject scores.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border bg-surface">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-border bg-background text-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium sm:px-4">#</th>
                      <th className="px-3 py-2 font-medium sm:px-4">Name</th>
                      <th className="px-3 py-2 font-medium sm:px-4">Adm. No</th>
                      {group.subjects.map((subject) => (
                        <th key={subject.subjectId} className="px-3 py-2 font-medium text-center sm:px-4">
                          {subject.subjectName}
                        </th>
                      ))}
                      <th className="px-3 py-2 font-medium text-center sm:px-4">Total</th>
                      <th className="px-3 py-2 font-medium text-center sm:px-4">Avg</th>
                      <th className="px-3 py-2 font-medium text-center sm:px-4">Pos</th>
                      <th className="px-3 py-2 font-medium text-center sm:px-4">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.pupils.map((row, index) => (
                      <tr key={row.pupilId} className="border-t border-border hover:bg-background/50">
                        <td className="px-3 py-2 font-medium sm:px-4">{index + 1}</td>
                        <td className="px-3 py-2 font-medium sm:px-4">{row.name}</td>
                        <td className="px-3 py-2 text-muted sm:px-4">{row.admissionNo ?? '—'}</td>
                        {row.subjectScores.map((score) => (
                          <td key={score.subjectId} className="px-3 py-2 text-center sm:px-4">
                            {score.totalScore !== null ? Math.round(score.totalScore) : '—'}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-center font-semibold sm:px-4">
                          {row.total !== null ? Math.round(row.total) : '—'}
                        </td>
                        <td className="px-3 py-2 text-center sm:px-4">
                          {row.average !== null ? row.average.toFixed(1) : '—'}
                        </td>
                        <td className="px-3 py-2 text-center font-semibold text-brand sm:px-4">
                          {group.positionMap[row.pupilId] ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-center sm:px-4">
                          {row.grade ?? '—'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-background font-semibold">
                      <td colSpan={3} className="px-3 py-2 sm:px-4">Class Stats</td>
                      {group.subjectStats.map((subjectStat) => (
                        <td key={subjectStat.subjectId} className="px-3 py-2 text-center text-sm text-muted sm:px-4">
                          Avg: {subjectStat.avg !== null ? subjectStat.avg.toFixed(1) : '—'}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center text-muted sm:px-4">
                        Overall: {group.classAverage !== null ? group.classAverage.toFixed(1) : '—'}
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "scores" && broadsheetGroups.length === 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No saved assessment results are available for this assessment yet.</p>
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
          <AuditTrail assessmentId={id} schoolId={assessment.schoolId} />
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
