"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, KeyRound, RefreshCw, Sparkles, UserRoundPlus, Search, Printer, Eye, Download, ShieldOff, Copy, X, Building2, Users, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import { buildPinCardHtml } from "@/lib/pin-print";
import { resolveSchoolAssetUrl } from "@/lib/asset-urls";

interface PinStatus {
  enabled: boolean;
  mode: string;
  pinType: string;
  pinValidity: string;
  allowRegeneration: boolean;
}

interface StudentPinResult {
  ok: boolean;
  pin?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo?: string | null;
  };
  pinRecord?: {
    id: string;
    status?: string;
  };
  sessionName?: string | null;
  termName?: string | null;
  assessmentName?: string | null;
  schoolCode?: string | null;
  schoolName?: string | null;
}

interface TermOption {
  id: string;
  name: string;
  isCurrent?: boolean;
  academicYearId?: string;
  academicYearName?: string | null;
}

interface SessionOption {
  id: string;
  name: string;
  isCurrent?: boolean;
  terms: TermOption[];
}

interface AssessmentOption {
  id: string;
  name: string;
  phase?: string | null;
  classId?: string | null;
  term?: {
    id?: string;
    name?: string | null;
    academicYear?: {
      name?: string | null;
    } | null;
  } | null;
}

interface BatchPinResult {
  ok: boolean;
  batch?: {
    id: string;
    quantity?: number;
  };
  pins?: Array<{
    pin: string;
    recordId: string;
  }>;
  schoolCode?: string | null;
  schoolName?: string | null;
}

interface StudentOption {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  admissionNo?: string | null;
  class?: {
    id?: string | null;
    name?: string | null;
    phase?: string | null;
  } | null;
}

interface PinRecord {
  id: string;
  pinValue?: string | null;
  studentId?: string | null;
  type?: string | null;
  status?: string | null;
  expiresAt?: string | null;
  generatedAt?: string | null;
  lastValidatedAt?: string | null;
  generatedBy?: string | null;
  student?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    admissionNo?: string | null;
    class?: {
      id: string;
      name?: string | null;
    } | null;
  } | null;
  batch?: {
    id: string;
    batchName?: string | null;
  } | null;
  term?: {
    id: string;
    name?: string | null;
    academicYear?: {
      name?: string | null;
    } | null;
  } | null;
}

interface SchoolMeta {
  id?: string;
  name?: string | null;
  slug?: string | null;
  initials?: string | null;
  logoUrl?: string | null;
}

export default function ResultPinsPage() {
  const [status, setStatus] = useState<PinStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [assessments, setAssessments] = useState<AssessmentOption[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string; phase?: string | null }>>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [batchName, setBatchName] = useState("");
  const [pinFormat, setPinFormat] = useState("XXXX-XXXX");
  const [pinLength, setPinLength] = useState(8);
  const [generatedStudent, setGeneratedStudent] = useState<StudentPinResult | null>(null);
  const [generatedBatch, setGeneratedBatch] = useState<BatchPinResult | null>(null);
  const [submittingStudent, setSubmittingStudent] = useState(false);
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [pinSearch, setPinSearch] = useState("");
  const [pinFilterStatus, setPinFilterStatus] = useState("all");
  const [pinFilterType, setPinFilterType] = useState("all");
  const [pinFilterSession, setPinFilterSession] = useState("all");
  const [pinFilterTerm, setPinFilterTerm] = useState("all");
  const [pinFilterClass, setPinFilterClass] = useState("all");
  const [pinFilterGeneratedBy, setPinFilterGeneratedBy] = useState("all");
  const [pinFilterBatch, setPinFilterBatch] = useState("all");
  const [pins, setPins] = useState<PinRecord[]>([]);
  const [loadingPins, setLoadingPins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<PinRecord | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [schoolMeta, setSchoolMeta] = useState<SchoolMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const backendUrl = getBackendUrl();

  const loadSchoolMeta = async () => {
    try {
      const [schoolResponse, settingsResponse] = await Promise.all([
        fetch("/api/admin/school", { credentials: "include" }),
        fetch("/api/admin/settings/data", { credentials: "include" }),
      ]);

      if (!schoolResponse.ok) return;

      const schoolData = await schoolResponse.json();
      const settingsData = settingsResponse.ok ? await settingsResponse.json() : null;
      const configuredLogoUrl = settingsData?.config?.logoUrl || schoolData?.logoUrl || schoolData?.school?.logoUrl || null;
      const resolvedLogoUrl = configuredLogoUrl ? resolveSchoolAssetUrl(configuredLogoUrl) : null;

      setSchoolMeta({
        id: schoolData?.id || schoolData?.school?.id,
        name: schoolData?.name || schoolData?.school?.name,
        slug: schoolData?.slug || schoolData?.school?.slug,
        initials: schoolData?.initials || schoolData?.school?.initials,
        logoUrl: resolvedLogoUrl,
      });
    } catch (err) {
      console.error("Unable to load school metadata", err);
    }
  };

  const loadStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await fetch(`${backendUrl}/api/result-pins/status`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load PIN settings");
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load PIN settings");
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadMetadataOptions = async () => {
    try {
      const [academicYearsResponse, assessmentsResponse, studentsResponse] = await Promise.all([
        fetch(`${backendUrl}/api/admin/academic-years`, { credentials: "include" }),
        fetch(`${backendUrl}/api/admin/results/data`, { credentials: "include" }),
        fetch(`${backendUrl}/api/admin/students/data`, { credentials: "include" }),
      ]);

      if (academicYearsResponse.ok) {
        const academicYearsData = await academicYearsResponse.json();
        const academicYearItems = Array.isArray(academicYearsData?.academicYears) ? academicYearsData.academicYears : [];
        const normalizedSessions = academicYearItems.map((year: any) => ({
          id: year.id,
          name: year.name,
          isCurrent: Boolean(year.isCurrent),
          terms: Array.isArray(year.terms)
            ? year.terms.map((term: any) => ({
                id: term.id,
                name: term.name,
                isCurrent: Boolean(term.isCurrent),
                academicYearId: term.academicYearId || year.id,
                academicYearName: year.name,
              }))
            : [],
        }));
        setSessions(normalizedSessions as SessionOption[]);
        const flattenedTerms = normalizedSessions.flatMap((session: SessionOption) =>
          session.terms.map((term) => ({
            ...term,
            academicYearName: session.name,
          })),
        );
        setTerms(flattenedTerms as TermOption[]);
      } else {
        const fallbackTermsResponse = await fetch(`${backendUrl}/api/admin/terms`, { credentials: "include" });
        if (fallbackTermsResponse.ok) {
          const fallbackTermsData = await fallbackTermsResponse.json();
          setTerms((fallbackTermsData.terms || []) as TermOption[]);
          setSessions([]);
        }
      }

      if (assessmentsResponse.ok) {
        const assessmentsData = await assessmentsResponse.json();
        const assessmentItems = Array.isArray(assessmentsData?.assessments) ? assessmentsData.assessments : [];
        setAssessments(assessmentItems as AssessmentOption[]);
      }

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        const classItems = Array.isArray(studentsData?.classes) ? studentsData.classes : [];
        const studentItems = Array.isArray(studentsData?.pupils) ? studentsData.pupils : [];
        setClasses(classItems as Array<{ id: string; name: string; phase?: string | null }>);
        setStudents(studentItems as StudentOption[]);
      }
    } catch (err) {
      console.error("Failed to load metadata options", err);
    }
  };

  useEffect(() => {
    void loadSchoolMeta();
    void loadStatus();
    void loadPins();
    void loadMetadataOptions();
  }, []);

  const loadPins = async (searchValue = pinSearch) => {
    try {
      setLoadingPins(true);
      setCurrentPage(1);
      const response = await fetch(`${backendUrl}/api/result-pins/pins?search=${encodeURIComponent(searchValue)}&limit=100`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load PIN records");
      const data = await response.json();
      setPins(data.pins || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load PIN records");
    } finally {
      setLoadingPins(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return students;
    return students.filter((student) => student.class?.id === selectedClassId);
  }, [selectedClassId, students]);

  const selectedClassPhase = useMemo(() => {
    if (!selectedClassId) return null;
    return classes.find((classItem) => classItem.id === selectedClassId)?.phase || null;
  }, [classes, selectedClassId]);

  const filteredAssessments = useMemo(() => {
    const termFiltered = selectedTermId
      ? assessments.filter((assessment) => assessment.term?.id === selectedTermId)
      : assessments;

    if (!selectedClassId) return termFiltered;

    return termFiltered.filter((assessment) => {
      if (assessment.classId) {
        return assessment.classId === selectedClassId;
      }
      if (selectedClassPhase) {
        return assessment.phase === selectedClassPhase;
      }
      return true;
    });
  }, [assessments, selectedClassId, selectedClassPhase, selectedTermId]);

  useEffect(() => {
    if (selectedAssessmentId && !filteredAssessments.some((assessment) => assessment.id === selectedAssessmentId)) {
      setSelectedAssessmentId("");
    }
  }, [filteredAssessments, selectedAssessmentId]);

  const summaryCards = useMemo(() => {
    const totals = pins.reduce(
      (accumulator, pin) => {
        accumulator.total += 1;
        if (pin.status === "ACTIVE") accumulator.active += 1;
        if (pin.status === "EXPIRED") accumulator.expired += 1;
        if (pin.status === "REVOKED") accumulator.revoked += 1;
        if (pin.studentId) accumulator.assigned += 1;
        else accumulator.unassigned += 1;
        return accumulator;
      },
      {
        total: 0,
        active: 0,
        assigned: 0,
        unassigned: 0,
        expired: 0,
        revoked: 0,
      },
    );

    return [
      { label: "Total PINs", value: totals.total, sub: "All generated PINs", icon: KeyRound, iconClass: "bg-sky-100 text-sky-700" },
      { label: "Active PINs", value: totals.active, sub: "Ready for use", icon: CheckCircle2, iconClass: "bg-emerald-100 text-emerald-700" },
      { label: "Assigned PINs", value: totals.assigned, sub: "Linked to students", icon: Users, iconClass: "bg-violet-100 text-violet-700" },
      { label: "Expired / Revoked", value: totals.expired + totals.revoked, sub: "No longer valid", icon: Clock3, iconClass: "bg-amber-100 text-amber-700" },
    ];
  }, [pins]);

  const summary = useMemo(() => {
    const totals = pins.reduce(
      (accumulator, pin) => {
        accumulator.total += 1;
        if (pin.status === "ACTIVE") accumulator.active += 1;
        if (pin.status === "EXPIRED") accumulator.expired += 1;
        if (pin.status === "REVOKED") accumulator.revoked += 1;
        if (pin.studentId) accumulator.assigned += 1;
        else accumulator.unassigned += 1;
        return accumulator;
      },
      {
        total: 0,
        active: 0,
        assigned: 0,
        unassigned: 0,
        expired: 0,
        revoked: 0,
      },
    );

    return totals;
  }, [pins]);

  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      if (pinFilterStatus !== "all" && (pin.status || "ACTIVE").toUpperCase() !== pinFilterStatus.toUpperCase()) {
        return false;
      }
      if (pinFilterType !== "all" && (pin.type || "GENERIC").toUpperCase() !== pinFilterType.toUpperCase()) {
        return false;
      }
      if (pinFilterSession !== "all" && (pin.term?.academicYear?.name || "") !== pinFilterSession) {
        return false;
      }
      if (pinFilterTerm !== "all" && (pin.term?.name || "") !== pinFilterTerm) {
        return false;
      }
      if (pinFilterClass !== "all" && (pin.student?.class?.name || "") !== pinFilterClass) {
        return false;
      }
      if (pinFilterGeneratedBy !== "all" && (pin.generatedBy || "system") !== pinFilterGeneratedBy) {
        return false;
      }
      if (pinFilterBatch !== "all" && (pin.batch?.batchName || "") !== pinFilterBatch) {
        return false;
      }
      return true;
    });
  }, [pins, pinFilterStatus, pinFilterType, pinFilterSession, pinFilterTerm, pinFilterClass, pinFilterGeneratedBy, pinFilterBatch]);

  const totalFilteredRows = filteredPins.length;
  const pageCount = Math.max(1, Math.ceil(totalFilteredRows / pageSize));
  const pagedPins = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPins.slice(startIndex, startIndex + pageSize);
  }, [filteredPins, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pinFilterStatus, pinFilterType, pinFilterSession, pinFilterTerm, pinFilterClass, pinFilterGeneratedBy, pinFilterBatch, pinSearch]);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  const handleGenerateStudentPin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmittingStudent(true);

    try {
      const response = await fetch(`${backendUrl}/api/result-pins/generate/student`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pupilId: studentId.trim(),
          termId: selectedTermId || undefined,
          assessmentId: selectedAssessmentId || undefined,
          generatedBy: "admin-ui",
          pinFormat,
          pinLength,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to generate student PIN");
      const selectedStudent = students.find((entry) => entry.id === studentId);
      setGeneratedStudent({
        ...data,
        student: {
          ...(data.student || {}),
          admissionNo: selectedStudent?.admissionNo || data.student?.admissionNo || null,
        },
        schoolCode: schoolMeta?.slug || schoolMeta?.initials || null,
        schoolName: schoolMeta?.name || null,
      });
      setStudentId("");
      await loadPins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate student PIN");
    } finally {
      setSubmittingStudent(false);
    }
  };

  const handlePrintSheet = async () => {
    if (!generatedStudent?.pin) return;

    const studentName = generatedStudent.student ? `${generatedStudent.student.firstName || ""} ${generatedStudent.student.lastName || ""}`.trim() : "Student";
    const schoolCode = generatedStudent.schoolCode || schoolMeta?.slug || schoolMeta?.initials || "school-code";
    const admissionNo = generatedStudent.student?.admissionNo || "N/A";
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const schoolLogoUrl = schoolMeta?.logoUrl || (schoolMeta?.id ? `/api/school-logo/${encodeURIComponent(schoolMeta.id)}` : undefined);
    const html = await buildPinCardHtml({
      schoolName: generatedStudent.schoolName || schoolMeta?.name || undefined,
      schoolLogoUrl,
      schoolId: schoolMeta?.id,
      schoolCode,
      studentName,
      admissionNo,
      session: generatedStudent.sessionName || "—",
      term: generatedStudent.termName || "—",
      pin: generatedStudent.pin,
      printedAt: new Date().toLocaleString(),
    });

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (printError) {
        console.error("Unable to print PIN card", printError);
      }

      setTimeout(() => {
        try {
          printWindow.close();
        } catch (closeError) {
          console.error("Unable to close PIN card popup", closeError);
        }
      }, 900);
    }, 900);
  };

  const handleGenerateBatch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmittingBatch(true);

    try {
      const response = await fetch(`${backendUrl}/api/result-pins/generate/batch`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          batchName: batchName.trim() || undefined,
          generatedBy: "admin-ui",
          pinFormat,
          pinLength,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to generate PIN batch");
      setGeneratedBatch(data);
      setQuantity(10);
      setBatchName("");
      await loadPins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PIN batch");
    } finally {
      setSubmittingBatch(false);
    }
  };

  const handleCopyPin = async () => {
    if (!generatedStudent?.pin) return;
    try {
      await navigator.clipboard.writeText(generatedStudent.pin);
      setError(null);
    } catch (clipboardError) {
      console.error("Unable to copy PIN", clipboardError);
    }
  };

  const handleExportBatch = () => {
    if (!generatedBatch?.pins?.length) return;
    const lines = generatedBatch.pins.map((entry) => entry.pin).join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `result-pins-${generatedBatch.batch?.id || "batch"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleViewPin = (pin: PinRecord) => {
    setSelectedPin(pin);
    setIsPinModalOpen(true);
  };

  const handlePrintPin = async (pin: PinRecord) => {
    const schoolCode = schoolMeta?.slug || schoolMeta?.initials || "school-code";
    const admissionNo = pin.student?.admissionNo || "N/A";
    const studentName = pin.student ? `${pin.student.firstName || ""} ${pin.student.lastName || ""}`.trim() : "Unassigned";
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const schoolLogoUrl = schoolMeta?.logoUrl || (schoolMeta?.id ? `/api/school-logo/${encodeURIComponent(schoolMeta.id)}` : undefined);
    const html = await buildPinCardHtml({
      schoolName: schoolMeta?.name || undefined,
      schoolLogoUrl,
      schoolId: schoolMeta?.id,
      schoolCode,
      studentName,
      admissionNo,
      session: pin.term?.academicYear?.name || "—",
      term: pin.term?.name || "—",
      pin: pin.pinValue || "—",
      printedAt: new Date().toLocaleString(),
    });

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (printError) {
        console.error("Unable to print PIN card", printError);
      }

      setTimeout(() => {
        try {
          printWindow.close();
        } catch (closeError) {
          console.error("Unable to close PIN card popup", closeError);
        }
      }, 900);
    }, 900);
  };

  const getTypeBadgeClass = (type?: string | null) => {
    const normalized = (type || "GENERIC").toUpperCase();
    if (normalized === "STUDENT") {
      return "border-violet-200 bg-violet-100 text-violet-700";
    }
    if (normalized === "GENERIC") {
      return "border-sky-200 bg-sky-100 text-sky-700";
    }
    return "border-slate-200 bg-slate-100 text-slate-700";
  };

  const getStatusBadgeClass = (status?: string | null) => {
    const normalized = (status || "ACTIVE").toUpperCase();
    if (normalized === "ACTIVE") {
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    }
    if (normalized === "EXPIRED") {
      return "border-amber-200 bg-amber-100 text-amber-700";
    }
    if (normalized === "REVOKED") {
      return "border-rose-200 bg-rose-100 text-rose-700";
    }
    return "border-slate-200 bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/settings" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand/80">
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-foreground">Result PIN Management</h1>
          <p className="mt-2 text-sm text-muted">Generate and validate PINs for the optional result-access layer.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadStatus()}
          disabled={loadingStatus}
          className="inline-flex items-center gap-2 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0858a8] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${loadingStatus ? "animate-spin" : ""}`} />
          {loadingStatus ? "Refreshing..." : "Refresh status"}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground">
            <KeyRound className="h-4 w-4 text-brand" />
            {loadingStatus ? "Loading status..." : status?.enabled ? "PIN access enabled" : "PIN access disabled"}
          </div>
          {status ? (
            <>
              <span className="text-sm text-muted">Mode: {status.mode}</span>
              <span className="text-sm text-muted">PIN type: {status.pinType}</span>
              <span className="text-sm text-muted">Validity: {status.pinValidity}</span>
            </>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!status?.enabled ? (
        <div className="rounded-lg border border-dashed border-border bg-background p-5 text-sm text-muted">
          The feature is currently disabled for this school. Enable it from the Result Access PIN section in settings before generating PINs.
        </div>
      ) : null}

      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="group rounded-2xl border border-border bg-background p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted">{card.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Result PIN Registry</h2>
            <p className="text-sm text-muted">Search by PIN, student name, admission number, or batch.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={pinSearch}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setPinSearch(nextValue);
                  void loadPins(nextValue);
                }}
                placeholder="Search PINs"
                className="w-44 bg-transparent text-sm text-foreground outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setPinSearch("");
                setPinFilterStatus("all");
                setPinFilterType("all");
                setPinFilterSession("all");
                setPinFilterTerm("all");
                setPinFilterClass("all");
                setPinFilterGeneratedBy("all");
                setPinFilterBatch("all");
                void loadPins("");
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/30"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select value={pinFilterStatus} onChange={(event) => setPinFilterStatus(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
          <select value={pinFilterType} onChange={(event) => setPinFilterType(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All PIN types</option>
            <option value="STUDENT">Student</option>
            <option value="GENERIC">Generic</option>
          </select>
          <select value={pinFilterSession} onChange={(event) => setPinFilterSession(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All sessions</option>
            {Array.from(new Set(pins.map((pin) => pin.term?.academicYear?.name).filter(Boolean) as string[])).map((session) => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
          <select value={pinFilterTerm} onChange={(event) => setPinFilterTerm(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All terms</option>
            {Array.from(new Set(pins.map((pin) => pin.term?.name).filter(Boolean) as string[])).map((term) => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
          <select value={pinFilterClass} onChange={(event) => setPinFilterClass(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All classes</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.name}>{classItem.name}</option>
            ))}
          </select>
          <select value={pinFilterGeneratedBy} onChange={(event) => setPinFilterGeneratedBy(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All generators</option>
            {Array.from(new Set(pins.map((pin) => pin.generatedBy).filter(Boolean) as string[])).map((generatedBy) => (
              <option key={generatedBy} value={generatedBy}>{generatedBy}</option>
            ))}
          </select>
          <select value={pinFilterBatch} onChange={(event) => setPinFilterBatch(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All batches</option>
            {Array.from(new Set(pins.map((pin) => pin.batch?.batchName).filter(Boolean) as string[])).map((batchName) => (
              <option key={batchName} value={batchName}>{batchName}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/60 px-3 py-3 text-sm text-muted">
            <div>
              {loadingPins ? "Loading records..." : `Showing ${totalFilteredRows === 0 ? 0 : (currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalFilteredRows)} of ${totalFilteredRows} rows`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1 || totalFilteredRows === 0}
                className="rounded border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">
                Page {currentPage} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                disabled={currentPage === pageCount || totalFilteredRows === 0}
                className="rounded border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          {loadingPins ? (
            <div className="p-4 text-sm text-muted">Loading records...</div>
          ) : totalFilteredRows === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="rounded-full border border-border bg-background p-3">
                <ShieldOff className="h-5 w-5 text-muted" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">No Result PINs have been generated yet.</p>
                <p className="mt-1 text-sm text-muted">Generate a student PIN or a generic batch to see records here.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-3 font-medium">PIN</th>
                    <th className="px-3 py-3 font-medium">Student</th>
                    <th className="px-3 py-3 font-medium">Admission No.</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Session</th>
                    <th className="px-3 py-3 font-medium">Term</th>
                    <th className="px-3 py-3 font-medium">Expiry</th>
                    <th className="px-3 py-3 font-medium">Generated</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface/60">
                  {pagedPins.map((pin) => (
                    <tr key={pin.id} className="align-top">
                      <td className="px-3 py-3">
                        <div className="font-semibold tracking-[0.2em] text-foreground">{pin.pinValue || '—'}</div>
                        <div className="mt-1 text-xs text-muted">{pin.batch?.batchName || 'Standalone'}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-foreground">{pin.student ? `${pin.student.firstName || ''} ${pin.student.lastName || ''}`.trim() : 'Unassigned'}</div>
                        <div className="text-xs text-muted">{pin.student?.class?.name || '—'}</div>
                      </td>
                      <td className="px-3 py-3 text-foreground">{pin.student?.admissionNo || '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getTypeBadgeClass(pin.type || 'GENERIC')}`}>
                          {pin.type || 'GENERIC'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(pin.status || 'ACTIVE')}`}>
                          {pin.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-foreground">{pin.term?.academicYear?.name || '—'}</td>
                      <td className="px-3 py-3 text-foreground">{pin.term?.name || '—'}</td>
                      <td className="px-3 py-3 text-foreground">{pin.expiresAt ? new Date(pin.expiresAt).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-3 text-foreground">{pin.generatedAt ? new Date(pin.generatedAt).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => handleViewPin(pin)} className="inline-flex items-center gap-1 rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100">
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button type="button" onClick={() => handlePrintPin(pin)} className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">
                            <Printer className="h-3.5 w-3.5" /> Print
                          </button>
                          <button type="button" className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                            <Download className="h-3.5 w-3.5" /> Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <Link
            href="/admin/settings/result-pins/all"
            className="inline-flex items-center gap-2 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0858a8]"
          >
            View all
          </Link>
        </div>
      </div>

      {isPinModalOpen && selectedPin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">PIN preview</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">Result access sheet details</h3>
              </div>
              <button type="button" onClick={() => { setSelectedPin(null); setIsPinModalOpen(false); }} className="rounded-full border border-border bg-background p-2 text-foreground hover:bg-muted/30">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-3 text-sm text-muted">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">School code</span>
                  <span className="font-semibold text-foreground">{schoolMeta?.slug || schoolMeta?.initials || "school-code"}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">Student</span>
                  <span className="font-semibold text-foreground">{selectedPin.student ? `${selectedPin.student.firstName || ""} ${selectedPin.student.lastName || ""}`.trim() : "Unassigned"}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">Admission number</span>
                  <span className="font-semibold text-foreground">{selectedPin.student?.admissionNo || "—"}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">PIN</span>
                  <span className="font-semibold tracking-[0.3em] text-brand">{selectedPin.pinValue || "—"}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">Session</span>
                  <span className="font-semibold text-foreground">{selectedPin.term?.academicYear?.name || "—"}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">Term</span>
                  <span className="font-semibold text-foreground">{selectedPin.term?.name || "—"}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => handlePrintPin(selectedPin)} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">
                <Printer className="h-4 w-4" />
                Print sheet
              </button>
              <button type="button" onClick={() => { setSelectedPin(null); setIsPinModalOpen(false); }} className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/30">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRoundPlus className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold text-foreground">Generate Student PIN</h2>
          </div>
          <form onSubmit={handleGenerateStudentPin} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Class</label>
                <select
                  value={selectedClassId}
                  onChange={(event) => {
                    setSelectedClassId(event.target.value);
                    setSelectedAssessmentId("");
                    setStudentId("");
                  }}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value="">All classes</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Student</label>
                <select
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                >
                  <option value="">Select a student</option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {`${student.firstName || ""} ${student.lastName || ""}`.trim() || student.admissionNo || student.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Session / Term</label>
                <select
                  value={selectedTermId}
                  onChange={(event) => {
                    setSelectedTermId(event.target.value);
                    setSelectedAssessmentId("");
                  }}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value="">Optional term</option>
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <optgroup key={session.id} label={session.name}>
                        {session.terms.map((term) => (
                          <option key={term.id} value={term.id}>
                            {term.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.academicYearName ? `${term.academicYearName} • ${term.name}` : term.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Assessment</label>
                <select
                  value={selectedAssessmentId}
                  onChange={(event) => {
                    const nextAssessmentId = event.target.value;
                    setSelectedAssessmentId(nextAssessmentId);
                    if (!nextAssessmentId) {
                      setSelectedTermId("");
                      return;
                    }
                    const assessment = assessments.find((item) => item.id === nextAssessmentId);
                    if (assessment?.term?.id) {
                      setSelectedTermId(assessment.term.id);
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value="">Optional assessment</option>
                  {filteredAssessments.map((assessment) => (
                    <option key={assessment.id} value={assessment.id}>
                      {assessment.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submittingStudent || !status?.enabled}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {submittingStudent ? "Generating..." : "Generate student PIN"}
              </button>
              <button
                type="button"
                onClick={handlePrintSheet}
                disabled={!generatedStudent?.pin}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Printer className="h-4 w-4" />
                Print sheet
              </button>
            </div>
          </form>

          {generatedStudent ? (
            <div className="mt-4 rounded-lg border border-border bg-background p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">Generated PIN</p>
                  <p className="mt-2 text-2xl font-bold tracking-[0.3em] text-brand">{generatedStudent.pin}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPin}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/30"
                  >
                    <Copy className="h-4 w-4" />
                    Copy PIN
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintSheet}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/30"
                  >
                    <Printer className="h-4 w-4" />
                    Print sheet
                  </button>
                </div>
              </div>
              <p className="mt-3 text-muted">
                Student: {generatedStudent.student?.firstName || ""} {generatedStudent.student?.lastName || ""}
              </p>
              <div className="mt-3 space-y-1 text-sm text-muted">
                <div><span className="font-medium text-foreground">School code:</span> {generatedStudent.schoolCode || schoolMeta?.slug || schoolMeta?.initials || "—"}</div>
                <div><span className="font-medium text-foreground">Admission number:</span> {generatedStudent.student?.admissionNo || "—"}</div>
                <div><span className="font-medium text-foreground">Session:</span> {generatedStudent.sessionName || "—"}</div>
                <div><span className="font-medium text-foreground">Term:</span> {generatedStudent.termName || "—"}</div>
                <div><span className="font-medium text-foreground">Assessment:</span> {generatedStudent.assessmentName || "—"}</div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold text-foreground">Generate Generic PIN Batch</h2>
          </div>
          <form onSubmit={handleGenerateBatch} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={250}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Batch name</label>
                <input
                  value={batchName}
                  onChange={(event) => setBatchName(event.target.value)}
                  placeholder="Optional batch label"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Format</label>
                <select
                  value={pinFormat}
                  onChange={(event) => setPinFormat(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value="XXXX-XXXX">XXXX-XXXX</option>
                  <option value="XXXX-XXXX-XXXX">XXXX-XXXX-XXXX</option>
                  <option value="ALPHA-NUMERIC">Alpha-numeric</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Length</label>
                <input
                  type="number"
                  min={4}
                  max={12}
                  value={pinLength}
                  onChange={(event) => setPinLength(Number(event.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submittingBatch || !status?.enabled}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {submittingBatch ? "Generating..." : "Generate batch"}
              </button>
              <button
                type="button"
                onClick={handleExportBatch}
                disabled={!generatedBatch?.pins?.length}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                Export TXT
              </button>
            </div>
          </form>

          {generatedBatch ? (
            <div className="mt-4 rounded-lg border border-border bg-background p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-foreground">Generated {generatedBatch.batch?.quantity || 0} PINs</p>
                <button
                  type="button"
                  onClick={handleExportBatch}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/30"
                >
                  <Download className="h-4 w-4" />
                  Export TXT
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {generatedBatch.pins?.slice(0, 10).map((entry) => (
                  <div key={entry.recordId} className="rounded border border-border bg-background/70 px-3 py-2 font-mono text-sm text-foreground">
                    {entry.pin}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
