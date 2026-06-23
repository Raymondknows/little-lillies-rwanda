"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SchoolTable, type SchoolRow } from "@/components/platform-admin/school-table";
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
  title,
  subtitle,
}: {
  initialSchools: SchoolRow[];
  title?: string;
  subtitle?: string;
}) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
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

  const filteredSchools = useMemo(() => {
    return schools.filter((school: any) => {
      const searchValue = search.toLowerCase();
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
        (verificationFilter === "VERIFIED" && (school as any).isVerified) ||
        (verificationFilter === "UNVERIFIED" && !(school as any).isVerified);

      return matchesSearch && matchesStatus && matchesVerification;
    });
  }, [schools, search, statusFilter, verificationFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="mt-3 text-muted">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          {title ? <h1 className="text-3xl font-bold truncate">{title}</h1> : null}
          {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => setView("list")}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
              view === "list"
                ? "bg-brand text-white hover:bg-brand/90 shadow-sm hover:shadow-md"
                : "bg-slate-100 text-foreground hover:bg-slate-200"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("grid")}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
              view === "grid"
                ? "bg-brand text-white hover:bg-brand/90 shadow-sm hover:shadow-md"
                : "bg-slate-100 text-foreground hover:bg-slate-200"
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search schools..."
            className="min-w-[240px] rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={verificationFilter}
            onChange={(event) => setVerificationFilter(event.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
          >
            <option value="ALL">All verifications</option>
            <option value="VERIFIED">Verified only</option>
            <option value="UNVERIFIED">Unverified only</option>
          </select>
        </div>
      ) : null}

      {view === "list" ? (
        <SchoolTable initialSchools={filteredSchools} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredSchools.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted">No schools found</p>
            </div>
          ) : (
            filteredSchools.map((school: any) => (
              <Link
                key={school.id}
                href={`/schoolbase-admin/schools/${school.id}`}
                className="group overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:border-brand hover:shadow-lg"
              >
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
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
