"use client";

import { useMemo, useState, useEffect } from "react";
import AdminSkeleton from "@/components/ui/skeleton";
import Link from "next/link";
import { Activity, AlertTriangle, Building2, CheckCircle2, Clock, Users, XCircle, Zap } from "lucide-react";
import { SchoolTable, type SchoolRow, ActionMenu } from "@/components/platform-admin/school-table";
import { resolveSchoolAssetUrl } from "@/lib/asset-urls";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getStatusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";
    case "TRIAL":
      return "bg-sky-100 text-sky-700";
    case "SUSPENDED":
      return "bg-amber-100 text-amber-800";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDate(date?: string | Date | null) {
  if (!date) return "n/a";
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SchoolsViewSwitcher({
  initialSchools,
  viewMode,
  setViewMode,
}: {
  initialSchools: SchoolRow[];
  viewMode: "list" | "grid";
  setViewMode: (next: "list" | "grid") => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"NAME_ASC" | "REGISTERED_DESC" | "PLAN_ASC" | "STATUS_ASC" | "TRIAL_END_ASC" | "STUDENTS_DESC">("REGISTERED_DESC");
  const [schools, setSchools] = useState<SchoolRow[]>(initialSchools);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchools() {
      try {
        let allSchools: SchoolRow[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(`/schoolbase-admin/api/schools?page=${page}&limit=100`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();
          allSchools = [...allSchools, ...(data.schools || [])];
          
          if (data.pagination && data.pagination.page >= data.pagination.pages) {
            hasMore = false;
          } else {
            page++;
          }
        }

        setSchools(allSchools);
        setLoading(false);
      } catch (err) {
        console.error("Error loading schools:", err);
        setLoading(false);
      }
    }

    loadSchools();
  }, []);

  const countries = useMemo(() => {
    return Array.from(new Set(schools.map((school) => school.country).filter(Boolean))).sort();
  }, [schools]);

  const stats = useMemo(() => {
    const summary = {
      total: schools.length,
      active: 0,
      trial: 0,
      suspended: 0,
      cancelled: 0,
      verified: 0,
      unverified: 0,
      pupils: 0,
    };

    schools.forEach((school) => {
      summary[school.status.toLowerCase() as keyof typeof summary] =
        (summary[school.status.toLowerCase() as keyof typeof summary] as number) + 1;
      if (school.isVerified) summary.verified += 1;
      else summary.unverified += 1;
      summary.pupils += school.pupilCount ?? 0;
    });

    return summary;
  }, [schools]);

  const isExpiringSoon = (school: SchoolRow) => {
    if (!school.trialEndsAt) return false;
    const endDate = new Date(school.trialEndsAt);
    const now = new Date();
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  };

  const filteredSchools = useMemo(() => {
    const searchValue = search.toLowerCase();

    const filtered = schools.filter((school: any) => {
      const matchesSearch = [
        school.name,
        school.country,
        school.email,
        school.phone,
        school.plan,
        school.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchValue);

      const matchesStatus = statusFilter === "ALL" || school.status === statusFilter;
      const matchesVerification =
        verificationFilter === "ALL" ||
        (verificationFilter === "VERIFIED" && school.isVerified) ||
        (verificationFilter === "UNVERIFIED" && !school.isVerified);
      const matchesCountry = countryFilter === "ALL" || school.country === countryFilter;

      return matchesSearch && matchesStatus && matchesVerification && matchesCountry;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "NAME_ASC":
          return a.name.localeCompare(b.name);
        case "REGISTERED_DESC":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "PLAN_ASC":
          return a.plan.localeCompare(b.plan);
        case "STATUS_ASC":
          return a.status.localeCompare(b.status);
        case "TRIAL_END_ASC":
          return (a.trialEndsAt ? new Date(a.trialEndsAt).getTime() : 0) -
            (b.trialEndsAt ? new Date(b.trialEndsAt).getTime() : 0);
        case "STUDENTS_DESC":
          return (b.pupilCount ?? 0) - (a.pupilCount ?? 0);
        default:
          return 0;
      }
    });
  }, [schools, search, statusFilter, verificationFilter, countryFilter, sortBy]);

  const [busy, setBusy] = useState(false);

  const performAction = async (
    schoolId: string,
    action: string,
    payload?: Record<string, unknown>,
  ) => {
    setBusy(true);
    try {
      const response = await fetch("/schoolbase-admin/api/schools", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schoolId, action, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error(result.message || "Action failed.");
        return;
      }
      setSchools((current) => current.map((s) => (s.id === schoolId ? { ...s, ...(result.school || {}) } : s)));
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setBusy(false);
    }
  };

  const sendReminder = async (schoolId: string) => {
    setBusy(true);
    try {
      const response = await fetch("/schoolbase-admin/api/reminders/send-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schoolId }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error(result.message || "Failed to send reminder.");
      }
    } catch (err) {
      console.error("Failed to send reminder", err);
    } finally {
      setBusy(false);
    }
  };

  const impersonate = async (schoolId: string) => {
    setBusy(true);
    try {
      const response = await fetch("/schoolbase-admin/api/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schoolId }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error(result.message || "Impersonation failed.");
        return;
      }
      const redirectUrl = result.redirectUrl || `/admin?impersonate=${encodeURIComponent(result.token)}`;
      window.location.href = redirectUrl;
    } catch (err) {
      console.error("Impersonation failed", err);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <AdminSkeleton />
      </div>
    );
  }

  const filterControls = (
    <div className="mb-4 flex flex-wrap items-center gap-1">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search schools..."
        className="max-w-[180px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        className="max-w-[140px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
      >
        <option value="ALL">All statuses</option>
        <option value="TRIAL">Trial</option>
        <option value="ACTIVE">Active</option>
        <option value="SUSPENDED">Suspended</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <select
        value={countryFilter}
        onChange={(event) => setCountryFilter(event.target.value)}
        className="w-full max-w-[140px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
      >
        <option value="ALL">All countries</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
      <select
        value={verificationFilter}
        onChange={(event) => setVerificationFilter(event.target.value)}
        className="w-full max-w-[140px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
      >
        <option value="ALL">All verifications</option>
        <option value="VERIFIED">Verified only</option>
        <option value="UNVERIFIED">Unverified only</option>
      </select>
      <select
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value as any)}
        className="w-full max-w-[140px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
      >
        <option value="REGISTERED_DESC">Newest registered</option>
        <option value="NAME_ASC">Name</option>
        <option value="PLAN_ASC">Plan</option>
        <option value="STATUS_ASC">Status</option>
        <option value="TRIAL_END_ASC">Trial ending soon</option>
        <option value="STUDENTS_DESC">Students</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total schools",
            value: stats.total,
            sub: "All registered schools",
            icon: Building2,
            iconClass: "bg-slate-100 text-slate-700",
            href: "/schoolbase-admin/schools",
          },
          {
            label: "Active",
            value: stats.active,
            sub: "Currently active",
            icon: Users,
            iconClass: "bg-emerald-100 text-emerald-700",
            href: "/schoolbase-admin/schools",
          },
          {
            label: "Trial",
            value: stats.trial,
            sub: "Currently on trial",
            icon: Zap,
            iconClass: "bg-sky-100 text-sky-700",
            href: "/schoolbase-admin/schools?status=TRIAL",
          },
          {
            label: "Students",
            value: stats.pupils,
            sub: "Total pupils",
            icon: Activity,
            iconClass: "bg-violet-100 text-violet-700",
            href: "/schoolbase-admin/schools",
          },
          {
            label: "Verified",
            value: stats.verified,
            sub: "Verified accounts",
            icon: CheckCircle2,
            iconClass: "bg-emerald-100 text-emerald-700",
            href: "/schoolbase-admin/schools",
          },
          {
            label: "Unverified",
            value: stats.unverified,
            sub: "Pending verification",
            icon: AlertTriangle,
            iconClass: "bg-amber-100 text-amber-800",
            href: "/schoolbase-admin/schools",
          },
          {
            label: "Suspended",
            value: stats.suspended,
            sub: "Suspended schools",
            icon: Clock,
            iconClass: "bg-orange-100 text-orange-700",
            href: "/schoolbase-admin/schools",
          },
          {
            label: "Cancelled",
            value: stats.cancelled,
            sub: "Cancelled accounts",
            icon: XCircle,
            iconClass: "bg-rose-100 text-rose-700",
            href: "/schoolbase-admin/schools",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="cursor-pointer group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
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
            </Link>
          );
        })}
      </div>

      {viewMode === "list" ? (
        <SchoolTable schools={filteredSchools} filterControls={filterControls} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredSchools.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted">No schools found</p>
            </div>
          ) : (
            filteredSchools.map((school: any) => (
              <div
                  key={school.id}
                  className="relative group overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:border-brand hover:shadow-lg"
                >
                  <Link href={`/schoolbase-admin/schools/${school.id}`} className="cursor-pointer absolute inset-0 z-0" aria-hidden="true">
                    <span className="sr-only">View {school.name}</span>
                  </Link>

                  <div className="relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-brand/10 text-3xl font-semibold text-brand shadow-sm">
                        {school.logoUrl ? (
                          <img
                            src={resolveSchoolAssetUrl(school.logoUrl) || school.logoUrl}
                            alt={`${school.name} logo`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{getInitials(school.name)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-xl font-semibold text-foreground">{school.name}</h2>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(school.status)}`}>
                            {school.status}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${(school as any).isVerified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                            {(school as any).isVerified ? "✓ Verified" : "Unverified"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted line-clamp-2">{school.email || school.country}</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Country</p>
                        <p className="mt-1 text-foreground">{school.country || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Plan</p>
                        <p className="mt-1 text-foreground">{school.plan}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Trial ends</p>
                        <p className="mt-1 text-foreground">{formatDate(school.trialEndsAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Registered</p>
                        <p className="mt-1 text-foreground">{formatDate(school.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 z-20">
                    <ActionMenu
                      school={school}
                      performAction={performAction}
                      sendReminder={sendReminder}
                      impersonate={impersonate}
                      busy={busy}
                    />
                  </div>
                </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
