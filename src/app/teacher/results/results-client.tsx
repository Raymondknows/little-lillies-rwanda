"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PHASE_TABS = [
  { key: "ALL", label: "All Phases" },
  { key: "EARLY_YEARS", label: "Early Years" },
  { key: "PRIMARY", label: "Primary" },
  { key: "SECONDARY", label: "Secondary" },
];

const STATUS_TABS = [
  { key: "ALL", label: "All Statuses" },
  { key: "PUBLISHED", label: "Published" },
  { key: "READY_TO_PUBLISH", label: "Ready to Publish" },
  { key: "DRAFT", label: "Draft" },
];

export default function TeacherResultsPageClient({ assessments }: { assessments: any[] }) {
  const [activePhase, setActivePhase] = useState("ALL");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [query, setQuery] = useState("");

  const phaseCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: assessments.length,
      EARLY_YEARS: 0,
      PRIMARY: 0,
      SECONDARY: 0,
    };

    assessments.forEach((item) => {
      const phase = item.phase;
      if (phase in counts) {
        counts[phase] += 1;
      }
    });

    return counts;
  }, [assessments]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: assessments.length,
      PUBLISHED: 0,
      READY_TO_PUBLISH: 0,
      DRAFT: 0,
    };

    assessments.forEach((item) => {
      const status = item.status;
      if (status === "APPROVED") {
        counts.READY_TO_PUBLISH += 1;
      }
      if (status === "PUBLISHED") {
        counts.PUBLISHED += 1;
      }
      if (status === "DRAFT") {
        counts.DRAFT += 1;
      }
    });

    return counts;
  }, [assessments]);

  const filteredRows = useMemo(() => {
    let filtered = assessments;
    if (activePhase !== "ALL") {
      filtered = filtered.filter((item) => item.phase === activePhase);
    }
    if (activeStatus !== "ALL") {
      filtered = filtered.filter((item) => {
        if (activeStatus === "READY_TO_PUBLISH") {
          return item.status === "APPROVED";
        }
        return item.status === activeStatus;
      });
    }
    if (query.trim()) {
      const lower = query.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          item.term?.name?.toLowerCase().includes(lower),
      );
    }
    return filtered;
  }, [assessments, activePhase, activeStatus, query]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Results</h1>
          <p className="mt-2 text-sm text-muted">
            Create and publish results in minutes — parents get notified instantly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.href = "/teacher"}
          aria-label="Back to teacher dashboard"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand text-white shadow-sm transition hover:bg-brand-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by assessment name or term..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border sm:gap-2">
        {PHASE_TABS.map((tab) => {
          const isActive = activePhase === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActivePhase(tab.key)}
              className={`px-2 py-3 font-medium text-xs sm:px-4 sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1 inline-block rounded px-1.5 py-0.5 text-xs font-semibold bg-background text-foreground sm:ml-2 sm:px-2">
                {phaseCounts[tab.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap gap-2 pb-2 sm:pb-0">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveStatus(tab.key)}
              className={`px-2 py-1 text-xs font-semibold rounded-full transition-all whitespace-nowrap flex items-center gap-1 sm:px-3 sm:py-2 ${
                isActive
                  ? "bg-brand text-white"
                  : "bg-surface text-foreground border border-border hover:bg-background"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs">({statusCounts[tab.key] ?? 0})</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 text-xs text-muted sm:text-sm">
        Showing {filteredRows.length > 0 ? 1 : 0}–{filteredRows.length} of {filteredRows.length} assessments
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {/* Desktop Table */}
        <table className="hidden sm:table w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Assessment</th>
              <th className="px-6 py-3 font-medium">Term</th>
              <th className="px-6 py-3 font-medium text-center">Entries</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((assessment) => {
                const statusLabel =
                  assessment.status === "APPROVED"
                    ? "Ready to Publish"
                    : assessment.status === "PUBLISHED"
                    ? "Published"
                    : "Draft";
                return (
                  <tr key={assessment.id} className="border-t border-border hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{assessment.name}</td>
                    <td className="px-6 py-4 text-muted">{assessment.term?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-center text-muted">{assessment._count?.results ?? 0}</td>
                    <td className="px-6 py-4 text-muted">{statusLabel}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/teacher/results/${assessment.id}`}
                      className="inline-flex rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-brand-hover"
                      >
                        {assessment.status === "PUBLISHED" ? "View Results" : "Manage Results"}
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted">
                  No assessments match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile List */}
        <div className="sm:hidden space-y-2 p-4">
          {filteredRows.length > 0 ? (
            filteredRows.map((assessment) => {
              const statusLabel =
                assessment.status === "APPROVED"
                  ? "Ready to Publish"
                  : assessment.status === "PUBLISHED"
                  ? "Published"
                  : "Draft";
              return (
                <Link
                  key={assessment.id}
                  href={`/teacher/results/${assessment.id}`}
                  className="block rounded-lg border border-border bg-surface px-4 py-3 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{assessment.name}</p>
                      <p className="text-xs text-muted mt-1">{assessment.term?.name ?? "—"}</p>
                    </div>
                    <div className="flex-shrink-0 text-right ml-2">
                      <p className="text-xs text-muted">{statusLabel}</p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center text-sm text-muted py-8">
              No assessments match these filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
