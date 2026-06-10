"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Zap,
  HelpCircle,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";

export default function PlatformOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardScroll, setCardScroll] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();

        // Fetch platform stats and schools in parallel
        const [statsRes, schoolsRes] = await Promise.all([
          fetch(`${backendUrl}/schoolbase-admin/api/stats`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${backendUrl}/schoolbase-admin/api/schools?limit=5`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        const statsData = await statsRes.json();
        const schoolsData = await schoolsRes.json();

        setStats(statsData);
        setSchools(schoolsData.schools || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading platform data:", err);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading platform dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Active Schools",
      value: String(stats?.activeSchools || 0),
      sub: `${stats?.activePercentage || 0}% of ${stats?.totalSchools || 0} total`,
      href: "/schoolbase-admin/schools",
      icon: Building2,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Users",
      value: String(stats?.totalUsers || 0),
      sub: "Across all schools",
      href: "#",
      icon: Users,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Trial Schools",
      value: String(stats?.trialSchools || 0),
      sub: "Pending upgrade or expiry",
      href: "/schoolbase-admin/schools?status=TRIAL",
      icon: Zap,
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Support Tickets",
      value: String(stats?.supportRequests || 0),
      sub: "Pending responses",
      href: "/schoolbase-admin/support",
      icon: HelpCircle,
      color: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
        <p className="mt-1 text-muted">Manage all schools and monitor platform health</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-10 hidden sm:block pt-4">
        <div className="relative flex items-center gap-4">
          {/* Left Navigation Arrow */}
          <button
            onClick={() => setCardScroll(Math.max(0, cardScroll - 1))}
            disabled={cardScroll === 0}
            className="flex-shrink-0 rounded-full p-2 bg-brand text-white shadow-lg transition-all hover:bg-brand/90 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Cards Container */}
          <div className="grid grid-cols-4 gap-3 flex-1">
            {statCards.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <Link key={idx} href={stat.href}>
                  <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${stat.color} shadow-sm`}>
                        <IconComponent className={`h-4 w-4 ${stat.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted">{stat.label}</p>
                        <p className="mt-1 text-lg font-bold text-foreground">{stat.value}</p>
                      </div>
                      <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
                    </div>
                    <p className="mt-2 text-[11px] text-muted">{stat.sub}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Navigation Arrow */}
          <button
            onClick={() => setCardScroll(Math.min(1, cardScroll + 1))}
            disabled={cardScroll >= 1}
            className="flex-shrink-0 rounded-full p-2 bg-brand text-white shadow-lg transition-all hover:bg-brand/90 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards - Mobile */}
      <div className="sm:hidden mb-10">
        {statCards.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <Link key={idx} href={stat.href} className="block mb-3">
              <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex items-start gap-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${stat.color} shadow-sm`}>
                  <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted font-medium">{stat.label}</p>
                  <p className="mt-1.5 text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted">{stat.sub}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/schoolbase-admin/schools">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <Building2 className="h-4 w-4 mr-2" />
            View Schools
          </button>
        </Link>
        <Link href="/schoolbase-admin/email-center">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Send Email
          </button>
        </Link>
        <Link href="/schoolbase-admin/support">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <HelpCircle className="h-4 w-4 mr-2" />
            View Support
          </button>
        </Link>
      </div>

      {/* Recent Schools */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-foreground">Recent Schools</h2>
          </div>
          <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted bg-background">
            Latest
          </span>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {schools.length === 0 ? (
            <li className="py-3 text-sm text-muted">No schools registered yet.</li>
          ) : (
            schools.map((school: any, idx: number) => (
              <li key={idx} className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{school.name}</p>
                  <p className="text-xs text-muted mt-1">
                    {school.userCount || 0} users • {school.pupilCount || 0} pupils • {school.classCount || 0} classes
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    school.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : school.status === "TRIAL"
                      ? "bg-yellow-100 text-yellow-700"
                      : school.status === "SUSPENDED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {school.status}
                  </span>
                  <span className="text-xs text-muted flex-shrink-0">
                    {new Date(school.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
        <Link href="/schoolbase-admin/schools" className="mt-4 flex justify-end items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
