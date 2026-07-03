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
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";
import ParentPageShell from "@/components/parent-page-shell";

export default function ParentDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
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
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <ParentPageShell onRefresh={loadData}>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-64 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl bg-surface p-5 border border-border space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded mx-auto animate-pulse"></div>
                <div className="h-6 w-20 bg-slate-200 rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="rounded-3xl border border-border bg-surface p-5 space-y-3 animate-pulse">
              <div className="h-5 w-32 bg-slate-200 rounded"></div>
              <div className="h-4 w-48 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </ParentPageShell>
    );
  }

  if (error) {
    return (
      <ParentPageShell onRefresh={loadData}>
        <div className="rounded-lg border border-error bg-error/10 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error Loading Dashboard</h3>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      </ParentPageShell>
    );
  }

  const stats = [
    {
      label: "Children",
      value: String(dashboardData?.childrenCount || 0),
      sub: `${dashboardData?.childrenCount} child${dashboardData?.childrenCount !== 1 ? 'ren' : ''}`,
      icon: Users,
      href: "/parent/children",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Fees",
      value: formatMoney(dashboardData?.outstandingFees || 0),
      sub: dashboardData?.outstandingFees > 0 ? "Amount due" : "No balance",
      icon: CreditCard,
      href: "/parent/invoices",
      color: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "Results",
      value: String(dashboardData?.recentResults?.length || 0),
      sub: "Available results",
      icon: BookOpen,
      href: "/parent/results",
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "News",
      value: String(dashboardData?.announcements?.length || 0),
      sub: "School updates",
      icon: Bell,
      href: "/parent/publications",
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <ParentPageShell onRefresh={loadData}>
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

      {/* Mobile-first icon menu */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <Link key={idx} href={stat.href} className="group block">
              <div className="h-full rounded-3xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md hover:border-brand/50 cursor-pointer flex flex-col items-center text-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${stat.color} shadow-sm`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                  <p className="mt-1 text-xs text-muted">{stat.sub}</p>
                </div>
                <span className="mt-auto rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand">
                  {stat.value}
                </span>
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
          <Link href="/parent/publications" className="mt-4 flex justify-end items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </ParentPageShell>
  );
}
