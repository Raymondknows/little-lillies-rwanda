"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CreditCard,
  Users,
  BookOpen,
  Bell,
  ArrowUpRight,
  AlertCircle,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";

export default function ParentDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardScroll, setCardScroll] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        
        // Fetch dashboard data
        const dashRes = await fetch(`${backendUrl}/api/parent/dashboard`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!dashRes.ok) {
          throw new Error('Failed to load dashboard');
        }

        const data = await dashRes.json();
        
        setDashboardData({
          guardianName: data.guardianName || 'Parent',
          childrenCount: data.children?.length || 0,
          outstandingFees: data.outstandingFees || 0,
          children: data.children || [],
          recentResults: data.recentResults || [],
          announcements: data.announcements || [],
          attendance: data.attendance || {},
        });
        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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
          <p className="mt-4 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="rounded-lg border border-error bg-error/10 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error Loading Dashboard</h3>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Outstanding Fees",
      value: formatMoney(dashboardData?.outstandingFees || 0),
      sub: dashboardData?.outstandingFees > 0 ? "Amount due for payment" : "All fees paid",
      icon: CreditCard,
      href: "/parent/invoices",
      color: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "My Children",
      value: String(dashboardData?.childrenCount || 0),
      sub: `${dashboardData?.childrenCount} child${dashboardData?.childrenCount !== 1 ? 'ren' : ''} registered`,
      icon: Users,
      href: "/parent/children",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Recent Results",
      value: String(dashboardData?.recentResults?.length || 0),
      sub: "Latest academic results",
      icon: BookOpen,
      href: "/parent/results",
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Announcements",
      value: String(dashboardData?.announcements?.length || 0),
      sub: "School updates and notices",
      icon: Bell,
      href: "/parent/announcements",
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {dashboardData?.guardianName}!
        </h1>
        <p className="mt-1 text-muted">
          {dashboardData?.childrenCount === 1
            ? "You have 1 child registered in the system"
            : `You have ${dashboardData?.childrenCount} children registered in the system`}
        </p>
      </div>

      {/* Stats Cards - Desktop with Navigation */}
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
            {stats.map((stat, idx) => {
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
        {stats.map((stat, idx) => {
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
        <Link href="/parent/children">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <Users className="h-4 w-4 mr-2" />
            View Children
          </button>
        </Link>
        <Link href="/parent/invoices">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <Eye className="h-4 w-4 mr-2" />
            Check Fees
          </button>
        </Link>
        <Link href="/parent/results">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <Download className="h-4 w-4 mr-2" />
            View Results
          </button>
        </Link>
      </div>

      {/* My Children Section */}
      {dashboardData?.children && dashboardData.children.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow mb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-foreground">My Children</h2>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted bg-background">
              Latest
            </span>
          </div>
          
          {dashboardData.children.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {dashboardData.children.slice(0, 5).map((child: any) => (
                <li key={child.id} className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">
                      {child.firstName} {child.lastName}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {child.class?.name || "Class"}{child.class?.section ? ` ${child.class.section}` : ""} • {child.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {child.outstandingFee > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        ₦{(child.outstandingFee / 1000).toFixed(0)}k Due
                      </span>
                    )}
                    {child.latestGrade && (
                      <span className="text-xs text-muted flex-shrink-0">
                        {child.latestGrade}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <Link href="/parent/children" className="mt-4 flex justify-end items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Recent Results Section */}
      {dashboardData?.recentResults && dashboardData.recentResults.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow mb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="font-semibold text-foreground">Recent Results</h2>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted bg-background">
              Latest
            </span>
          </div>
          
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-0 font-semibold text-foreground">Child</th>
                  <th className="text-left py-2.5 px-0 font-semibold text-foreground">Subject</th>
                  <th className="text-left py-2.5 px-0 font-semibold text-foreground">Score</th>
                  <th className="text-left py-2.5 px-0 font-semibold text-foreground">Grade</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentResults.slice(0, 5).map((result: any, idx: number) => (
                  <tr key={idx} className="border-b border-border hover:bg-background/50 transition">
                    <td className="py-2.5 px-0 text-foreground">{result.childName}</td>
                    <td className="py-2.5 px-0 text-foreground">{result.subject}</td>
                    <td className="py-2.5 px-0 font-semibold text-foreground">{result.score}/100</td>
                    <td className="py-2.5 px-0">
                      <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-medium text-muted">
                        {result.grade || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/parent/results" className="mt-4 flex justify-end items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Announcements Section */}
      {dashboardData?.announcements && dashboardData.announcements.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="font-semibold text-foreground">Announcements</h2>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted bg-background">
              Latest
            </span>
          </div>
          
          <ul className="mt-4 divide-y divide-border">
            {dashboardData.announcements.slice(0, 5).map((announcement: any, idx: number) => (
              <li key={idx} className="py-3 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-foreground text-sm">{announcement.title}</h3>
                <p className="text-xs text-muted mt-1 line-clamp-2">{announcement.body || announcement.content}</p>
                <p className="text-xs text-muted/70 mt-2">
                  {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/parent/announcements" className="mt-4 flex justify-end items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
