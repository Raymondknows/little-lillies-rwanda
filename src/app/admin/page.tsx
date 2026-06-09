"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCard, Users, Layers, TrendingUp, ArrowUpRight, Clock, ChevronLeft, ChevronRight, DollarSign, BookOpen, MessageSquare } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [schoolName, setSchoolName] = useState<string>('Your School');
  const [loading, setLoading] = useState(true);
  const [cardScroll, setCardScroll] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        
        // Fetch all data in parallel
        const [feesRes, studentsRes, classesRes, teachersRes, verifyRes] = await Promise.all([
          fetch(`${backendUrl}/api/admin/fees/data`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`${backendUrl}/api/admin/students/data`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`${backendUrl}/api/admin/classes/data`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`${backendUrl}/api/admin/teachers/data`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`${backendUrl}/api/admin/verify`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
        ]);

        const [feesData, studentsData, classesData, teachersData, verifyData] = await Promise.all([
          feesRes.json(),
          studentsRes.json(),
          classesRes.json(),
          teachersRes.json(),
          verifyRes.json(),
        ]);

        console.log('Dashboard data:', {
          fees: feesData,
          students: studentsData,
          classes: classesData,
          teachers: teachersData,
          verify: verifyData,
        });

        // Extract school name
        let schoolNameToUse = 'Your School';
        if (verifyData.authenticated && verifyData.session?.schoolName) {
          schoolNameToUse = verifyData.session.schoolName;
        }

        // Count active pupils
        const pupils = studentsData.pupils || [];
        const pupilCount = pupils.filter((p: any) => p.isActive).length;
        
        // Count classes
        const classCount = (classesData.classes || []).length;
        
        // Get recent pupils (last 5 added)
        const recentPupils = pupils
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        // Get recent teachers (last 5 added)
        const recentTeachers = (teachersData.teachers || [])
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);
        
        // Set dashboard data
        setDashboardData({
          outstanding: feesData.outstanding || 0,
          attentionCount: feesData.invoices?.filter((inv: any) => 
            ['SENT', 'PART_PAID', 'OVERDUE'].includes(inv.status)
          ).length || 0,
          pupilCount,
          classCount,
          recentPayments: [], // No payment records endpoint yet
          recentPupils,
          recentTeachers,
          currency: 'NGN',
        });
        setSchoolName(schoolNameToUse);
        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard:", err);
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

  const stats = [
    {
      label: "Outstanding fees",
      value: formatMoney(dashboardData?.outstanding || 0),
      sub: `${dashboardData?.attentionCount || 0} invoices need attention`,
      href: "/admin/fees",
      icon: CreditCard,
    },
    {
      label: "Active pupils",
      value: String(dashboardData?.pupilCount || 0),
      sub: `${dashboardData?.classCount || 0} classes`,
      href: "/admin/students",
      icon: Users,
    },
    {
      label: "Classes",
      value: String(dashboardData?.classCount || 0),
      sub: "Manage grade groups and sections",
      href: "/admin/classes",
      icon: Layers,
    },
    {
      label: "Recent payments",
      value: String(dashboardData?.recentPayments?.length || 0),
      sub: "Latest transactions",
      href: "/admin/fees",
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Good morning, {schoolName}
        </h1>
        <p className="mt-1 text-muted">
          Live dashboard — fees, results, and pupils from your database.
        </p>
      </div>

      {/* Stats Cards - Desktop with Navigation */}
      <div className="mb-10 hidden sm:block">
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
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                        <IconComponent className="h-4 w-4 text-brand" />
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

      {/* Stats Cards - Mobile (Stacked Vertically) */}
      <div className="sm:hidden mb-10">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <Link key={idx} href={stat.href} className="block mb-3">
              <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                  <IconComponent className="h-5 w-5 text-brand" />
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

      {/* Grid of sections - Responsive: 1 col mobile, 2 col tablet, 2 col desktop */}
      <section className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Payments */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-foreground">Recent payments</h2>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted bg-background">
              Latest
            </span>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {!dashboardData?.recentPayments || dashboardData.recentPayments.length === 0 ? (
              <li className="py-3 text-sm text-muted">No payments yet.</li>
            ) : (
              dashboardData.recentPayments.slice(0, 5).map((p: any, idx: number) => (
                <li key={idx} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground truncate">{p.invoice?.pupil?.firstName} {p.invoice?.pupil?.lastName}</span>
                    <span className="text-sm font-bold text-green-600 flex-shrink-0">{formatMoney(p.amount, dashboardData?.currency || "NGN")}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>#{p.invoiceId}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{new Date(p.paidAt || Date.now()).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/fees" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Latest Students */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-foreground">Latest students</h2>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted bg-background">
              New
            </span>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {!dashboardData?.recentPupils || dashboardData.recentPupils.length === 0 ? (
              <li className="py-3 text-sm text-muted">No new students yet.</li>
            ) : (
              dashboardData.recentPupils.slice(0, 5).map((pupil: any, idx: number) => (
                <li key={idx} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground truncate">{pupil.firstName} {pupil.lastName}</span>
                    <span className="text-xs text-muted flex-shrink-0">
                      {new Date(pupil.createdAt || Date.now()).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{pupil.class?.name || "Unassigned"} {pupil.class?.arm ? `(${pupil.class.arm})` : ""}</p>
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/students" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Latest Teachers */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-foreground">Latest teachers</h2>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted bg-background">
              New
            </span>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {!dashboardData?.recentTeachers || dashboardData.recentTeachers.length === 0 ? (
              <li className="py-3 text-sm text-muted">No recent teachers yet.</li>
            ) : (
              dashboardData.recentTeachers.slice(0, 5).map((teacher: any, idx: number) => (
                <li key={idx} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground truncate">{teacher.name || "Unknown"}</span>
                    <span className="text-xs text-muted flex-shrink-0">
                      {new Date(teacher.createdAt || Date.now()).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">{teacher.email || "No email"}</p>
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/teachers" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Latest Announcements */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-foreground">Latest announcements</h2>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted bg-background">
              New
            </span>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {!dashboardData?.recentAnnouncements || dashboardData.recentAnnouncements.length === 0 ? (
              <li className="py-3 text-sm text-muted">No announcements yet.</li>
            ) : (
              dashboardData.recentAnnouncements.slice(0, 5).map((announcement: any, idx: number) => (
                <li key={idx} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground truncate">{announcement.title || "Untitled"}</span>
                    <span className="text-xs text-muted flex-shrink-0">
                      {new Date(announcement.publishedAt || announcement.createdAt || Date.now()).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2 text-muted">{announcement.body || "No content"}</p>
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/website" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
