"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { PublishButton } from "@/components/admin/publish-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorModal } from "@/components/ui/error-modal";
import { UserGuide } from "@/components/ui/user-guide";
import { resultStatusLabel } from "@/lib/format";

const RESULTS_GUIDE = {
  title: "Results Management",
  overview: "Create, manage, and publish student assessment results. Teachers enter marks, approve results, and parents receive instant notifications when results are published.",
  steps: [
    "Click 'Create assessment' to start a new assessment",
    "Enter assessment details (name, term, class, subject)",
    "Select which students to include in the assessment",
    "Teachers enter marks for each student",
    "Review and approve the assessment results",
    "Click 'Publish' to notify parents instantly"
  ],
  commonTasks: [
    {
      title: "Create a new assessment",
      description: "Use clear naming conventions (e.g., 'Q1 Exam 2026', 'Mid-Term Test'). Include the term and year for easy tracking."
    },
    {
      title: "Enter student marks",
      description: "Teachers can enter marks by subject. Marks are saved as drafts until approved by the class teacher or admin."
    },
    {
      title: "Approve results before publishing",
      description: "Review marks for accuracy and completeness before publishing. Once published, parents are notified and cannot be changed."
    },
    {
      title: "Publish results to parents",
      description: "Publishing sends automatic notifications to parents via WhatsApp and email. Results appear in their parent portal."
    },
    {
      title: "Filter and search assessments",
      description: "Use phase and status filters to quickly find assessments. Search by name or term to locate specific assessments."
    }
  ],
  faqs: [
    {
      question: "Can I edit results after publishing?",
      answer: "Published results cannot be edited directly. Create a new 'Amendment' or 'Correction' assessment to update marks."
    },
    {
      question: "What happens when I publish results?",
      answer: "Parents receive WhatsApp and email notifications with links to view results. Results appear in their portal and cannot be missed."
    },
    {
      question: "Can different teachers enter marks for the same class?",
      answer: "Yes, each teacher enters marks for their own subject. The system prevents overlapping entries automatically."
    },
    {
      question: "What formats are supported for marks?",
      answer: "You can enter numeric marks (0-100), grades (A-F), or comments. The system is flexible for different grading schemes."
    },
    {
      question: "Can I delete an assessment?",
      answer: "Assessments in Draft status can be deleted. Published assessments are kept for audit and historical purposes."
    }
  ],
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
};

type PhaseConfigItem = {
  label: string;
  color: string;
};

const PHASE_CONFIG: Record<"EARLY_YEARS" | "PRIMARY" | "SECONDARY" | "ALL", PhaseConfigItem> = {
  EARLY_YEARS: { label: "Early Years", color: "bg-purple-100 text-purple-800" },
  PRIMARY: { label: "Primary", color: "bg-blue-100 text-blue-800" },
  SECONDARY: { label: "Secondary", color: "bg-green-100 text-green-800" },
  ALL: { label: "All Phases", color: "bg-gray-100 text-gray-800" },
};

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", icon: Clock, color: "text-gray-600" },
  APPROVED: { label: "Ready to Publish", icon: CheckCircle2, color: "text-blue-600" },
  PUBLISHED: { label: "Published", icon: CheckCircle2, color: "text-green-600" },
  ALL: { label: "All Statuses", icon: FileText, color: "text-gray-600" },
};

const PHASE_ORDER = ["ALL", "EARLY_YEARS", "PRIMARY", "SECONDARY"];
const STATUS_ORDER = ["ALL", "PUBLISHED", "APPROVED", "DRAFT"];
const ITEMS_PER_PAGE = 20;

const getSessionValue = (assessment: any) =>
  assessment.sessionName || assessment.term?.academicYear?.name || "No session";

const getDefaultSessionOption = (assessments: any[], sessions: any[] = []) => {
  const currentSession = sessions.find((session) => session.isCurrent);
  if (currentSession?.name) {
    return currentSession.name;
  }

  const currentSessionAssessment = assessments.find(
    (assessment) => assessment.term?.academicYear?.isCurrent === true
  );

  return currentSessionAssessment ? getSessionValue(currentSessionAssessment) : "ALL";
};

const getDefaultTermOption = (assessments: any[], selectedSession: string) => {
  const matchingAssessments = assessments.filter((assessment) => {
    if (selectedSession === "ALL") return true;
    return getSessionValue(assessment) === selectedSession;
  });

  const currentTermAssessment = matchingAssessments.find(
    (assessment) => assessment.term?.academicYear?.isCurrent === true && assessment.term?.id
  );

  if (currentTermAssessment?.term?.id) {
    return String(currentTermAssessment.term.id);
  }

  const firstTermAssessment = matchingAssessments.find((assessment) => assessment.term?.id);
  return firstTermAssessment ? String(firstTermAssessment.term.id) : "ALL";
};

export default function ResultsPageClient({ assessments, sessions = [] }: { assessments: any[]; sessions?: any[] }) {
  const router = useRouter();
  const [activePhase, setActivePhase] = useState("ALL");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [selectedSession, setSelectedSession] = useState(() => getDefaultSessionOption(assessments, sessions));
  const [selectedTerm, setSelectedTerm] = useState(() => getDefaultTermOption(assessments, getDefaultSessionOption(assessments, sessions)));
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalType, setModalType] = useState<'success' | 'error'>('error');
  const [modalDetails, setModalDetails] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const sessionOptions = useMemo(() => {
    const uniqueSessions = Array.from(
      new Set(
        (sessions.length > 0
          ? sessions.map((session: any) => session.name).filter(Boolean)
          : assessments.map(getSessionValue)
        ).filter(Boolean)
      )
    );

    return [{ value: "ALL", label: "All Sessions" }, ...uniqueSessions.map((value) => ({ value, label: value }))];
  }, [assessments, sessions]);

  const termOptions = useMemo(() => {
    const matchingAssessments = assessments.filter((assessment) => {
      if (selectedSession === "ALL") return true;
      return getSessionValue(assessment) === selectedSession;
    });

    const uniqueTerms = Array.from(
      new Map(
        matchingAssessments
          .filter((assessment) => assessment.term?.id || assessment.term?.name)
          .map((assessment) => {
            const termId = assessment.term?.id ? String(assessment.term.id) : "no-term";
            return [termId, { value: termId, label: assessment.term?.name || "No term" }];
          })
      ).values()
    );

    return [{ value: "ALL", label: "All Terms" }, ...uniqueTerms];
  }, [assessments, selectedSession]);

  // Filter by phase, status, session, term, and search
  const filteredAssessments = useMemo(() => {
    let filtered = assessments;

    // Filter by phase
    if (activePhase !== "ALL") {
      filtered = filtered.filter((a) => a.phase === activePhase);
    }

    // Filter by session
    if (selectedSession !== "ALL") {
      filtered = filtered.filter((a) => getSessionValue(a) === selectedSession);
    }

    // Filter by term
    if (selectedTerm !== "ALL") {
      filtered = filtered.filter((a) => String(a.term?.id) === selectedTerm);
    }

    // Filter by status
    if (activeStatus !== "ALL") {
      filtered = filtered.filter((a) => a.status === activeStatus);
    }

    // Filter by search (assessment name or term name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => {
        const name = (a.name || "").toLowerCase();
        const termName = (a.term?.name || "").toLowerCase();
        return name.includes(query) || termName.includes(query);
      });
    }

    return filtered;
  }, [assessments, activePhase, activeStatus, selectedSession, selectedTerm, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredAssessments.length / ITEMS_PER_PAGE);
  const paginatedAssessments = filteredAssessments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);
    handleFilterChange();
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    handleFilterChange();
  };

  const handleSessionChange = (session: string) => {
    setSelectedSession(session);
    setSelectedTerm("ALL");
    handleFilterChange();
  };

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    handleFilterChange();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleFilterChange();
  };

  const getPhaseStats = (phase: string) => {
    if (phase === "ALL") {
      return assessments.length;
    }
    return assessments.filter((a) => a.phase === phase).length;
  };

  const getStatusStats = (status: string) => {
    if (status === "ALL") {
      return assessments.length;
    }
    return assessments.filter((a) => a.status === status).length;
  };

  const totalResults = paginatedAssessments.reduce((sum, a) => sum + a._count.results, 0);

  return (
    <>
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-foreground">Results</h1>
            <p className="mt-2 text-sm text-muted">
              Create and publish results in minutes — parents get notified instantly
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Animated Search Panel - slides out on same line */}
            <div className={`overflow-hidden transition-all duration-300 ease-out flex-shrink-0 ${isSearchOpen ? "w-72 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-full"}`}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by assessment name or term..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-lg border-2 border-[#0A66C2] bg-background px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0A66C2] sm:px-4 sm:py-2"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSearchOpen((open) => !open)}
              className="w-full sm:w-auto"
            >
              {isSearchOpen ? "Close Search" : "Search Results"}
            </Button>
            <Button href="/admin/results/new" className="w-full sm:w-auto">
              Create assessment
            </Button>
            <Button variant="secondary" href="/admin/promotions" className="w-full sm:w-auto">
              Promotions
            </Button>
          </div>
        </div>

      {/* Filters - Phase Tabs and Status Dropdown */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Phase Tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted min-w-fit">Phase:</span>
          <div className="flex flex-wrap gap-2">
            {PHASE_ORDER.map((phase) => {
              const count = getPhaseStats(phase);
              const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];
              const isActive = activePhase === phase;

              return (
                <button
                  key={phase}
                  onClick={() => handlePhaseChange(phase)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? "bg-brand text-white"
                      : "bg-background text-muted hover:bg-surface"
                  }`}
                >
                  {config.label}
                  <span className="ml-1 inline-block">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="rounded-md bg-transparent text-sm font-medium text-foreground outline-none"
            >
              {sessionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => handleTermChange(e.target.value)}
              className="rounded-md bg-transparent text-sm font-medium text-foreground outline-none"
            >
              {termOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Status</label>
            <select
              value={activeStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-md bg-transparent text-sm font-medium text-foreground outline-none"
            >
              {STATUS_ORDER.map((status) => {
                const count = getStatusStats(status);
                const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                return (
                  <option key={status} value={status}>
                    {config.label} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-xs text-muted sm:text-sm">
        Showing {paginatedAssessments.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
        {Math.min(currentPage * ITEMS_PER_PAGE, filteredAssessments.length)} of{" "}
        {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? "s" : ""}
        {searchQuery && <span className="hidden sm:inline"> matching "{searchQuery}"</span>}
      </div>
      <ErrorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage || ''}
        details={modalDetails}
        type={modalType}
        confirmLabel={modalType === 'success' ? 'Okay' : 'Review'}
      />

      {/* Assessments Table */}
      {paginatedAssessments.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                    <th className="px-3 py-1.5 font-medium sm:px-4">Assessment</th>
                    <th className="px-3 py-1.5 font-medium sm:px-4">Term</th>
                    <th className="px-3 py-1.5 font-medium sm:px-4 text-center">Entries</th>
                    <th className="px-3 py-1.5 font-medium sm:px-4">Status</th>
                    <th className="px-3 py-1.5 font-medium sm:px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssessments.map((a, index) => {
                  const isPublished = a.status === "PUBLISHED";
                  const isApproved = a.status === "APPROVED";
                  const isLocked = Boolean(a.isLocked);
                  const statusConfig = STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={a.id}
                      className={`border-t border-border transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'} hover:bg-slate-100/70`}
                    >
                      <td className="px-3 py-1.5 sm:px-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{a.name}</p>
                          <p className="mt-1 text-[11px] text-muted">
                            {a.sessionName ? `${a.sessionName}` : "Session not set"}
                            {a.term?.name ? ` • ${a.term.name}` : ""}
                          </p>
                          <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${PHASE_CONFIG[a.phase as keyof typeof PHASE_CONFIG]?.color || "bg-gray-100 text-gray-800"}`}>
                            {PHASE_CONFIG[a.phase as keyof typeof PHASE_CONFIG]?.label || a.phase}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-muted truncate sm:px-4">
                        {a.term?.name || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-muted text-center sm:px-4">
                        {a._count.results}
                      </td>
                      <td className="px-3 py-1.5 sm:px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {isLocked && (
                            <Badge variant="warning" className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Locked
                            </Badge>
                          )}
                          <Badge
                            variant={
                              isPublished ? "success" : isApproved ? "brand" : "default"
                            }
                          >
                            <StatusIcon className="w-3 h-3 mr-1 inline" />
                            {resultStatusLabel(a.status)}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 sm:px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/admin/results/${a.id}`}
                            className={`${isPublished ? 'border border-border bg-background text-foreground hover:bg-surface' : 'bg-brand text-white hover:bg-brand-dark'} text-xs sm:text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition`}
                          >
                            {isPublished ? "View" : "Manage"}
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                            {a.status === 'DRAFT' && (
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={async () => {
                                  setApprovingId(a.id);
                                  try {
                                                            const res = await fetch(`/api/admin/assessments/${a.id}/approve`, {
                                      method: 'POST',
                                      credentials: 'include',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                    });
                                    const responseBody = await res.json().catch(() => null);
                                    if (!res.ok) {
                                      const errText = responseBody?.error || responseBody?.message || 'Failed to approve';
                                      const details = responseBody?.details?.reason || undefined;
                                      setModalTitle('Approval Failed');
                                      setModalType('error');
                                      setModalMessage(errText);
                                      setModalDetails(details);
                                      setModalOpen(true);
                                      throw new Error(errText);
                                    }

                                    setModalTitle('Approval Complete');
                                    setModalType('success');
                                    setModalMessage('Assessment approved and ready to publish.');
                                    setModalDetails(undefined);
                                    setModalOpen(true);
                                    setApprovingId(null);
                                    router.refresh();
                                  } catch (err) {
                                    if (!(err instanceof Error && err.message === 'Failed to approve')) {
                                      // error already surfaced in modal
                                    }
                                    setApprovingId(null);
                                  }
                                }}
                                disabled={approvingId === a.id}
                                className="text-xs sm:text-sm"
                              >
                                Approve
                              </Button>
                            )}
                          {isApproved && <PublishButton assessmentId={a.id} />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="sm:hidden space-y-2">
            {paginatedAssessments.map((a, index) => {
              const isPublished = a.status === "PUBLISHED";
              const isApproved = a.status === "APPROVED";
              const isLocked = Boolean(a.isLocked);
              const statusConfig = STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusConfig.icon;

              return (
                <Link
                  key={a.id}
                  href={`/admin/results/${a.id}`}
                  className={`block rounded-lg border border-border px-4 py-2 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'} hover:bg-slate-100/70`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{a.name}</p>
                        <p className="text-xs text-muted mt-1">
                          {a.sessionName ? `${a.sessionName}` : "Session not set"}
                          {a.term?.name ? ` • ${a.term.name}` : ""}
                        </p>
                        <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${PHASE_CONFIG[a.phase as keyof typeof PHASE_CONFIG]?.color || "bg-gray-100 text-gray-800"}`}>
                          {PHASE_CONFIG[a.phase as keyof typeof PHASE_CONFIG]?.label || a.phase}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right ml-2">
                      <div className="flex flex-wrap justify-end gap-2">
                        {isLocked && (
                          <Badge variant="warning" className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Locked
                          </Badge>
                        )}
                        <Badge
                          variant={
                            isPublished ? "success" : isApproved ? "brand" : "default"
                          }
                        >
                          <StatusIcon className="w-3 h-3 mr-1 inline" />
                          {resultStatusLabel(a.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted sm:text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded px-2 py-1 border border-border text-xs font-medium text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed sm:px-4 sm:py-2 sm:text-sm"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, arr) => (
                    <div key={page}>
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-1 py-1 text-xs text-muted sm:px-2 sm:py-2">…</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`rounded px-2 py-1 text-xs font-medium sm:px-3 sm:py-2 sm:text-sm ${
                          page === currentPage
                            ? "bg-primary text-white"
                            : "border border-border text-foreground hover:bg-background"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded px-2 py-1 border border-border text-xs font-medium text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed sm:px-4 sm:py-2 sm:text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center sm:px-6 sm:py-12">
          <FileText className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" />
          <p className="text-xs text-muted sm:text-sm">
            {searchQuery
              ? `No assessments found matching "${searchQuery}"`
              : "No assessments yet. Create one to get started."}
          </p>
        </div>
      )}
      </div>
      <UserGuide guide={RESULTS_GUIDE} />
    </>
  );
}
