"use client";

import { useMemo, useState, useEffect } from "react";
import { setSchoolPlanAction, approveSchoolSubscriptionAction, rejectSchoolSubscriptionAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getBackendUrl } from "@/lib/backend-url";
import type { School } from "@prisma/client";

const PLAN_CONFIG = {
  FREE: { label: "Free", color: "bg-gray-100 text-gray-800" },
  STARTER: { label: "Starter", color: "bg-blue-100 text-blue-800" },
  GROWTH: { label: "Growth", color: "bg-purple-100 text-purple-800" },
  ENTERPRISE: { label: "Enterprise", color: "bg-yellow-100 text-yellow-800" },
};

const PLAN_OPTIONS = [
  { value: "STARTER", label: "Starter - ₦35,000/term" },
  { value: "GROWTH", label: "Growth - ₦45,000/term" },
];

const STATUS_CONFIG = {
  TRIAL: { label: "Trial", color: "bg-info/10 text-info" },
  ACTIVE: { label: "Active", color: "bg-success/10 text-success" },
  SUSPENDED: { label: "Suspended", color: "bg-warning/10 text-warning" },
  CANCELLED: { label: "Cancelled", color: "bg-error/10 text-error" },
};

const ITEMS_PER_PAGE = 15;

export default function SubscriptionsPageClient({
  schools: initialSchools,
}: {
  schools: School[];
}) {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedPlans((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const school of schools) {
        if (school.status === "PENDING" && !next[school.id]) {
          next[school.id] = "STARTER";
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [schools]);

  // Get pending schools
  const pendingSchools = useMemo(() => {
    return schools.filter((s) => s.status === "PENDING");
  }, [schools]);

  // Only show tabs for All, Free, Growth
  const PLAN_TAB_ORDER = ["ALL", "FREE", "GROWTH"];
  const STATUS_TAB_ORDER = ["ALL", "TRIAL", "ACTIVE"];

  // Filter schools
  const filteredSchools = useMemo(() => {
    let filtered = schools;

    // Filter by plan
    if (planFilter !== "ALL") {
      filtered = filtered.filter((s) => s.plan === planFilter);
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }


    // Filter by search (name, slug, country)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(query) ||
        s.slug.toLowerCase().includes(query) ||
        s.country.toLowerCase().includes(query) ||
        (s.email && s.email.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [schools, searchQuery, planFilter, statusFilter]);

  const getPlanStats = (plan: string) => {
    if (plan === "ALL") return schools.length;
    return schools.filter((s) => s.plan === plan).length;
  };

  const getStatusStats = (status: string) => {
    if (status === "ALL") return schools.length;
    return schools.filter((s) => s.status === status).length;
  };

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-8">
      {pendingSchools.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-warning animate-pulse"></div>
            <h2 className="text-lg font-semibold text-foreground">Pending Approvals</h2>
            <Badge variant="warning">{pendingSchools.length}</Badge>
          </div>

          <p className="text-sm text-muted mb-4">
            Schools that have signed up and are waiting for subscription approval after payment.
          </p>

          <div className="space-y-3">
            {pendingSchools.map((school) => (
              <div
                key={school.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border bg-background p-4 hover:shadow-md transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{school.name}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                    <span>{school.slug}</span>
                    <span>•</span>
                    <span>{school.country}</span>
                    <span>•</span>
                    <span>{school.email}</span>
                    <span>•</span>
                    <span>Signed up {new Date(school.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <select
                    value={selectedPlans[school.id] || "STARTER"}
                    onChange={(e) =>
                      setSelectedPlans({
                        ...selectedPlans,
                        [school.id]: e.target.value,
                      })
                    }
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {PLAN_OPTIONS.map((plan) => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <form action={approveSchoolSubscriptionAction}>
                      <input type="hidden" name="schoolId" value={school.id} />
                      <input type="hidden" name="plan" value={selectedPlans[school.id] || "STARTER"} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg bg-success px-4 py-2 text-xs font-semibold text-white hover:bg-success/90 transition-colors whitespace-nowrap"
                      >
                        ✓ Approve
                      </button>
                    </form>
                    <form action={rejectSchoolSubscriptionAction}>
                      <input type="hidden" name="schoolId" value={school.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg bg-error px-4 py-2 text-xs font-semibold text-white hover:bg-error/90 transition-colors whitespace-nowrap"
                      >
                        ✕ Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
        <input
          type="text"
          placeholder="Search by school name, slug, email, or country..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="min-w-0 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none"
        >
          <option value="ALL">All plans</option>
          <option value="FREE">Free</option>
          <option value="STARTER">Starter</option>
          <option value="GROWTH">Growth</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="TRIAL">Trial</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div className="min-w-0 text-xs text-muted">
          Showing {paginatedSchools.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredSchools.length)} of {filteredSchools.length} school{filteredSchools.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Schools Table */}
      {paginatedSchools.length > 0 ? (
        <div className="space-y-4">
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">School</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium">Change Plan</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSchools.map((school) => (
                  <tr key={school.id} className="border-t border-border hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {school.name}
                      <div className="text-xs text-muted mt-0.5">{school.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-muted text-sm">{school.country}</td>
                    <td className="px-4 py-3">
                      <Badge variant="default">
                        {PLAN_CONFIG[school.plan as keyof typeof PLAN_CONFIG]?.label || school.plan}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          school.status === "ACTIVE"
                            ? "success"
                            : school.status === "SUSPENDED"
                              ? "warning"
                              : "default"
                        }
                      >
                        {school.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {school.subscriptionExpiresAt
                        ? new Date(school.subscriptionExpiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <form action={setSchoolPlanAction} className="flex items-center gap-2">
                        <input type="hidden" name="schoolId" value={school.id} />
                        <select
                          name="plan"
                          defaultValue={school.plan}
                          className="rounded border border-border px-2 py-1 text-xs font-medium"
                        >
                          <option value="FREE">Free</option>
                          <option value="STARTER">Starter</option>
                          <option value="GROWTH">Growth</option>
                          <option value="ENTERPRISE">Enterprise</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded bg-brand px-2 py-1 text-xs font-medium text-white hover:bg-brand/90"
                        >
                          Set
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden space-y-2">
            {paginatedSchools.map((school) => (
              <div
                key={school.id}
                className="rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{school.name}</p>
                    <p className="text-xs text-muted mt-0.5">{school.slug}</p>
                  </div>
                  <div>
                    <Badge variant="default" className="text-xs">
                      {PLAN_CONFIG[school.plan as keyof typeof PLAN_CONFIG]?.label || school.plan}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                  <span>{school.country}</span>
                  <span>•</span>
                  <span>{school.status}</span>
                </div>
                <form action={setSchoolPlanAction} className="flex items-center gap-2">
                  <input type="hidden" name="schoolId" value={school.id} />
                  <select
                    name="plan"
                    defaultValue={school.plan}
                    className="flex-1 rounded border border-border px-2 py-1 text-xs font-medium"
                  >
                    <option value="FREE">Free</option>
                    <option value="STARTER">Starter</option>
                    <option value="GROWTH">Growth</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand/90"
                  >
                    Set
                  </button>
                </form>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted sm:text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded px-2 py-1 border border-border text-xs font-medium text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                  .map((page, index, arr) => (
                    <div key={page}>
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-1 py-1 text-xs text-muted">…</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`rounded px-2 py-1 text-xs font-medium ${
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
                  className="rounded px-2 py-1 border border-border text-xs font-medium text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center sm:px-6 sm:py-12">
          <p className="text-xs text-muted sm:text-sm">
            {searchQuery ? `No schools found matching "${searchQuery}"` : "No schools found"}
          </p>
        </div>
      )}
    </div>
  );
}
