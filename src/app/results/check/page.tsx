"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ChevronRight, Filter, GraduationCap, Lock } from "lucide-react";
import { ErrorModal } from "@/components/ui/error-modal";
import { getBackendUrl } from "@/lib/backend-url";
import ParentPageShell from "@/components/parent-page-shell";
import { WaecReportCard } from "@/components/teacher/waec-report-card";

interface Result {
  id: string;
  subject: string;
  assessmentId: string;
  caScore?: number;
  testScore?: number;
  examScore?: number;
  totalScore?: number;
  grade?: string;
  termId?: string | null;
  term?: string | null;
}

interface Term {
  id: string;
  name: string;
  sortOrder?: number;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
}

export default function PublicResultCheckPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [reportCardData, setReportCardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinChecking, setPinChecking] = useState(false);
  const [pinVerifiedChildId, setPinVerifiedChildId] = useState<string | null>(null);
  const [verifiedPin, setVerifiedPin] = useState<string | null>(null);
  const [pinRequired, setPinRequired] = useState(false);
  const [schoolCode, setSchoolCode] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [pin, setPin] = useState("");
  const [termId, setTermId] = useState("");
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const backendUrl = getBackendUrl();

  const loadData = async () => {
    setError(null);
    setLoading(false);
    setResults([]);
    setReportCards([]);
    setReportCardData(null);
    setSelectedAssessmentId(null);
    setSelectedTerm(null);
    setTerms([]);
    setStudent(null);
    setSchool(null);
    setChildren([]);
    setSelectedChildId(null);
    setStatusMessage(null);
    setPinRequired(false);
    setPinError(null);
    setPinInput("");
    setPinVerifiedChildId(null);
    setVerifiedPin(null);
    setPinChecking(false);
    setSchoolCode("");
    setAdmissionNo("");
    setPin("");
    setTermId("");
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setDownloadError(null);
    setPinRequired(false);
    setPinError(null);
    setResults([]);
    setReportCards([]);
    setReportCardData(null);
    setSelectedAssessmentId(null);

    try {
      const response = await fetch(`${backendUrl}/api/results/check`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolCode, admissionNo, pin, termId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data?.requiresPin) {
          const nextStudent = data.student || null;
          const nextSchool = data.school || null;

          if (nextStudent && nextSchool) {
            setStudent(nextStudent);
            setSchool(nextSchool);
            setPinRequired(true);
            setPinInput("");
            setLoading(false);
            return;
          }
        }

        if (typeof data?.error === "string" && /pin|expired/i.test(data.error)) {
          setPinError(data.error);
          setPinRequired(true);
          setStudent(data.student || student);
          setSchool(data.school || school);
          setLoading(false);
          return;
        }

        throw new Error(data?.error || "Unable to check results");
      }

      const nextResults: Result[] = data.results || [];
      const nextReportCards = data.reportCards || [];
      const nextTerms = nextResults.reduce<Term[]>((acc, item) => {
        const termIdValue = item.termId ?? item.id ?? null;
        const termName = item.term ?? "Latest Term";
        if (!termIdValue) return acc;
        const exists = acc.some((existing) => existing.id === termIdValue || existing.name === termName);
        if (!exists) {
          acc.push({ id: termIdValue, name: termName });
        }
        return acc;
      }, []);

      const nextStudent = data.student || null;
      const nextSchool = data.school || null;
      const nextChild: Child = {
        id: nextStudent?.id || `${schoolCode}-${admissionNo}`,
        firstName: nextStudent?.firstName || nextStudent?.name || admissionNo,
        lastName: nextStudent?.lastName || "",
        admissionNo: nextStudent?.admissionNo || admissionNo,
      };

      setChildren((current) => {
        const exists = current.some((child) => child.id === nextChild.id || child.admissionNo === nextChild.admissionNo);
        if (exists) {
          return current;
        }
        return [nextChild, ...current];
      });
      setSelectedChildId(nextChild.id);
      setResults(nextResults);
      setReportCards(nextReportCards);
      setTerms(nextTerms);
      setStudent(nextStudent);
      setSchool(nextSchool);

      const nextSelectedTerm = data.term
        ? { id: data.term.id, name: data.term.name, sortOrder: data.term.sortOrder }
        : nextTerms[0] ?? null;
      setSelectedTerm(nextSelectedTerm);
      setTermId(data.term?.id || "");

      const firstAssessmentId = nextResults[0]?.assessmentId ?? null;
      const matchedReportCard = nextReportCards.find((card: any) => card.assessmentId === firstAssessmentId) || nextReportCards[0] || null;
      setSelectedAssessmentId(firstAssessmentId);
      setReportCardData(matchedReportCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to check results");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (pupilId: string) => {
    if (!selectedAssessmentId || !pupilId || !school?.id) {
      setDownloadError("Report card details are not available yet.");
      return;
    }

    try {
      setDownloadError(null);
      const response = await fetch(`/api/pdf-reports/${selectedAssessmentId}/${pupilId}`, {
        credentials: "include",
        headers: {
          "x-school-id": school.id,
        },
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || "Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const studentName = [student?.firstName, student?.lastName].filter(Boolean).join(" ").trim() || student?.admissionNo || "student";
      const termName = selectedTerm?.name || "results";
      const safeStudentName = studentName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const safeTermName = termName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const fileName = `${safeStudentName || "student"}-${safeTermName || "results"}.pdf`;
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to download PDF";
      setDownloadError(message);
      console.error("PDF download failed:", err);
    }
  };

  const handleUnlockResults = async () => {
    if (!pinInput.trim() || !student) {
      setPinError("Please enter a valid PIN");
      return;
    }

    setPinChecking(true);
    setPinError(null);

    try {
      // For the public page, we verify PIN by re-sending the original check request
      // with the updated PIN from the modal
      const response = await fetch(`${backendUrl}/api/results/check`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          schoolCode, 
          admissionNo, 
          pin: pinInput, 
          termId 
        }),
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        // If still getting PIN error, show it
        if (data?.error?.includes("PIN")) {
          setPinError(data.error);
        } else {
          setPinError("Unable to verify PIN. Please try again.");
        }
        return;
      }

      // PIN verified successfully - update the pin state and clear the modal
      setPin(pinInput);
      setPinRequired(false);
      setPinInput("");
      setVerifiedPin(pinInput);
      setPinVerifiedChildId(student.id);
      
      // Update results with the newly fetched data
      const nextResults: Result[] = data.results || [];
      const nextReportCards = data.reportCards || [];
      setStatusMessage(typeof data?.message === 'string' ? data.message : null);
      setResults(nextResults);
      setReportCards(nextReportCards);
      
      const firstAssessmentId = nextResults[0]?.assessmentId ?? null;
      const matchedReportCard = nextReportCards.find((card: any) => card.assessmentId === firstAssessmentId) || nextReportCards[0] || null;
      setSelectedAssessmentId(firstAssessmentId);
      setReportCardData(matchedReportCard);
    } catch (err) {
      setPinError(err instanceof Error ? err.message : "Unable to verify PIN");
    } finally {
      setPinChecking(false);
    }
  };

  if (loading) {
    return (
      <ParentPageShell onRefresh={loadData}>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-64 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 animate-pulse">
            <div className="h-5 w-32 bg-slate-200 rounded"></div>
            {[1, 2].map((i) => (
              <div key={i} className="h-10 w-24 bg-slate-100 rounded inline-block mr-2"></div>
            ))}
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 animate-pulse">
              <div className="h-5 w-40 bg-slate-200 rounded"></div>
              <div className="h-16 w-full bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </ParentPageShell>
    );
  }

  if (error) {
    return (
      <ParentPageShell onRefresh={loadData}>
        <ErrorModal
          isOpen={Boolean(error)}
          onClose={() => setError(null)}
          title="Error"
          message={error}
          type="error"
          confirmLabel="Close"
        />
      </ParentPageShell>
    );
  }

  if (pinRequired && student && school) {
    return (
      <ParentPageShell onRefresh={loadData}>
        <ErrorModal
          isOpen={Boolean(pinError)}
          onClose={() => setPinError(null)}
          title="Invalid PIN"
          message={pinError || "The supplied PIN is invalid or has expired."}
          type="error"
          confirmLabel="Close"
        />
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">PIN Required</h2>
              <p className="text-sm text-slate-600 mt-2">
                Enter the result PIN provided by the school to view the results for {student.firstName || "this student"}.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">PIN</label>
                <input
                  value={pinInput}
                  onChange={(event) => setPinInput(event.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !pinChecking && handleUnlockResults()}
                  placeholder="Enter PIN"
                  type="password"
                  maxLength={20}
                  autoFocus
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <button
                type="button"
                onClick={handleUnlockResults}
                disabled={pinChecking || !pinInput.trim()}
                className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pinChecking ? "Verifying..." : "Unlock Results"}
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Your PIN is confidential and used only to verify access.
            </p>
          </div>
        </div>
      </ParentPageShell>
    );
  }

  const selectedAssessment = results.find((result) => result.assessmentId === selectedAssessmentId) || null;
  const selectedChild = children.find((child) => child.id === selectedChildId) || null;
  const visibleResults = results.reduce<Result[]>((acc, result) => {
    const exists = acc.some((item) => item.assessmentId === result.assessmentId || item.subject === result.subject);
    if (!exists) {
      acc.push(result);
    }
    return acc;
  }, []);

  return (
    <ParentPageShell onRefresh={loadData}>
      <ErrorModal
        isOpen={Boolean(pinError)}
        onClose={() => setPinError(null)}
        title="Invalid PIN"
        message={pinError || "The supplied PIN is invalid or has expired."}
        type="error"
        confirmLabel="Close"
      />
      <div className="mx-2 mt-4 space-y-4 sm:mx-4 lg:mx-6 print:mx-0 print:mt-0 print:space-y-0">
        <div className="border-b border-slate-200 pb-6 print:hidden">
          <h1 className="text-4xl font-bold text-slate-900">Academic Results</h1>
          <p className="mt-1 text-sm text-slate-600">Check a student's results with a school code, admission number, and PIN.</p>
        </div>

        {children.length === 0 && (
          <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow print:hidden">
            <div className="mt-6 flex items-center gap-3 px-6 md:px-8">
              <Filter className="h-5 w-5 text-slate-600" />
              <h2 className="font-semibold text-slate-900">Check Results</h2>
            </div>

            <form onSubmit={handleSubmit} className="mx-4 mt-4 mb-6 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50/70 px-4 py-5 sm:mx-6 sm:px-6 sm:py-6 lg:mx-8 lg:px-8 lg:py-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="mt-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">School Code</label>
                  <input
                    id="results-school-code"
                    name="results-school-code"
                    value={schoolCode}
                    onChange={(event) => setSchoolCode(event.target.value)}
                    placeholder="Enter school slug or initials"
                    autoComplete="off"
                    data-lpignore="true"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    required
                  />
                </div>
                <div className="mt-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Admission Number</label>
                  <input
                    id="results-admission-number"
                    name="results-admission-number"
                    value={admissionNo}
                    onChange={(event) => setAdmissionNo(event.target.value)}
                    placeholder="Enter admission number"
                    autoComplete="off"
                    data-lpignore="true"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="mt-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Term</label>
                  <select
                    id="results-term"
                    name="results-term"
                    value={termId}
                    onChange={(event) => setTermId(event.target.value)}
                    autoComplete="off"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">Latest Term</option>
                    {terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">PIN</label>
                  <input
                    id="results-pin"
                    name="results-pin"
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    placeholder="Enter result PIN"
                    type="password"
                    maxLength={20}
                    autoComplete="new-password"
                    data-lpignore="true"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? "Checking..." : "Check Results"}
                </button>
              </div>
            </form>
          </div>
        )}

        {children.length > 0 && (
          <div className="mx-auto mt-6 w-full max-w-7xl">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
              <div className="w-full shrink-0 xl:max-w-[340px] print:hidden">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow">
                  <div className="mb-4 flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-slate-600" />
                    <h2 className="font-semibold text-slate-900">Select Student</h2>
                  </div>
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">End of Term Examination</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">First Term - End of Term Assessment</p>
                  </div>
                  <div className="overflow-x-auto pb-1">
                    <div className="flex gap-2 min-w-[max-content]">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => {
                            setSelectedChildId(child.id);
                            const syncedStudent = student && student.id === child.id ? student : null;
                            if (syncedStudent) {
                              setStudent(syncedStudent);
                              setSchool(school);
                            } else {
                              setStudent(null);
                              setSchool(null);
                              setResults([]);
                              setReportCards([]);
                              setReportCardData(null);
                              setSelectedAssessmentId(null);
                            }
                          }}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                            selectedChild?.id === child.id
                              ? "border-brand bg-brand text-white shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
                          }`}
                        >
                          {`${child.firstName} ${child.lastName}`.trim()} ({child.admissionNo || "—"})
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedChild && (
                    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                          {`${selectedChild.firstName?.[0] || "S"}${selectedChild.lastName?.[0] || ""}`.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {`${selectedChild.firstName} ${selectedChild.lastName}`.trim()}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">Admission No: {selectedChild.admissionNo || "—"}</p>
                          <p className="text-xs text-slate-500">Class: {student?.className || "—"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {student && (
                <div className="min-w-0 flex-1 print:max-w-full">
                  <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow print:border-0 print:bg-transparent print:p-0 print:rounded-none print:shadow-none print:space-y-0">
                    {visibleResults.length === 0 ? (
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center print:hidden">
                        <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">
                          {statusMessage || 'No published results are available yet for this student. Results will appear here once the school publishes them.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {downloadError ? (
                          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
                            {downloadError}
                          </div>
                        ) : null}

                        {reportLoading ? (
                          <div className="text-center py-12 text-slate-600">Loading report card...</div>
                        ) : reportCardData && selectedAssessmentId ? (
                          <WaecReportCard
                            assessmentId={selectedAssessmentId}
                            pupilId={student.id}
                            data={reportCardData}
                            onDownloadPDF={handleDownloadPdf}
                            onPrint={() => window.print()}
                          />
                        ) : (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
                            <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-600">No report card available</p>
                          </div>
                        )}

                        <div className="flex justify-end print:hidden">
                          <Link
                            href={selectedAssessmentId ? `/parent/results/${selectedAssessmentId}/${student.id}` : "/parent/results"}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand/80"
                          >
                            Open full report card
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ParentPageShell>
  );
}
