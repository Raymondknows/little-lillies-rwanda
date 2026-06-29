"use client";

import { useMemo, useState } from "react";
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

const PHASE_CONFIG = {
  EARLY_YEARS: { label: "Early Years" },
  PRIMARY: { label: "Primary" },
  SECONDARY: { label: "Secondary" },
  ALL: { label: "All Phases" },
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

export default function ResultsPageClient({ assessments }: { assessments: any[] }) {
  const [activePhase, setActivePhase] = useState("ALL");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter by phase, status, and search
  const filteredAssessments = useMemo(() => {
    let filtered = assessments;

    // Filter by phase
    if (activePhase !== "ALL") {
      filtered = filtered.filter((a) => a.phase === activePhase);
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
  }, [assessments, activePhase, activeStatus, searchQuery]);

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
            <Button href="/admin/results/new" className="w-full sm:w-auto">
              Create assessment
            </Button>
            <Button variant="secondary" href="/admin/promotions" className="w-full sm:w-auto">
              Promotions
            </Button>
          </div>
        </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by assessment name or term..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary sm:px-4 sm:py-2"
        />
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

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted">Status:</label>
          <select
            value={activeStatus}
            onChange={(e) => {
              setActiveStatus(e.target.value);
              handleFilterChange();
            }}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-brand transition"
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

      {/* Results Info */}
      <div className="mb-4 text-xs text-muted sm:text-sm">
        Showing {paginatedAssessments.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
        {Math.min(currentPage * ITEMS_PER_PAGE, filteredAssessments.length)} of{" "}
        {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? "s" : ""}
        {searchQuery && <span className="hidden sm:inline"> matching "{searchQuery}"</span>}
      </div>

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
                  const statusConfig = STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={a.id}
                      className={`border-t border-border transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'} hover:bg-slate-100/70`}
                    >
                      <td className="px-3 py-1.5 font-medium text-foreground truncate sm:px-4">
                        {a.name}
                      </td>
                      <td className="px-3 py-1.5 text-muted truncate sm:px-4">
                        {a.term?.name || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-muted text-center sm:px-4">
                        {a._count.results}
                      </td>
                      <td className="px-3 py-1.5 sm:px-4">
                        <Badge
                          variant={
                            isPublished ? "success" : isApproved ? "brand" : "default"
                          }
                        >
                          <StatusIcon className="w-3 h-3 mr-1 inline" />
                          {resultStatusLabel(a.status)}
                        </Badge>
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
                      <p className="font-medium text-sm truncate">{a.name}</p>
                      <p className="text-xs text-muted mt-1">{a.term?.name || "—"}</p>
                    </div>
                    <div className="flex-shrink-0 text-right ml-2">
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
