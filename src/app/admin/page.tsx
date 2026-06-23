"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCard, Users, Layers, TrendingUp, ArrowUpRight, Clock, ChevronLeft, ChevronRight, DollarSign, BookOpen, MessageSquare, Plus } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";
import SubscriptionModal from "@/components/subscription-modal";

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [schoolName, setSchoolName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string } | null>(null);
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

        // Check if any response is blocked by subscription guard
        for (const res of [feesRes, studentsRes, classesRes, teachersRes]) {
          if (res.status === 403) {
            const errorBody = await res.json().catch(() => null);
            if (errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
              setSubscriptionBlocked({ reason: errorBody.reason || 'Your school subscription is not active' });
              setLoading(false);
              return;
            }
          }
        }

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

        // Extract school name - fetch the full school object just like the sidebar does
        let schoolNameToUse = '';
        if (verifyData.authenticated && verifyData.session?.schoolId) {
          try {
            const schoolRes = await fetch(`${backendUrl}/api/admin/school/${verifyData.session.schoolId}`, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            if (schoolRes.ok) {
              const schoolData = await schoolRes.json();
              schoolNameToUse = schoolData?.name || '';
            }
          } catch (err) {
            console.error('Error fetching school:', err);
          }
        }

        // Count active pupils
        const pupils = studentsData.pupils || [];
        const pupilCount = pupils.filter((p: any) => p.isActive).length;
        
        // Count classes
        const classCount = (classesData.classes || []).length;
        
        // Get recent pupils (last 3 added)
        const recentPupils = pupils
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        // Get recent teachers (last 3 added)
        const recentTeachers = (teachersData.teachers || [])
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 3);
        
        // Fetch announcements data
        let announcements = [];
        try {
          const announcementsRes = await fetch(`${backendUrl}/api/admin/announcements`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (announcementsRes.ok) {
            const announcementsData = await announcementsRes.json();
            announcements = announcementsData.announcements || [];
          }
        } catch (err) {
          console.error('Error fetching announcements:', err);
        }
        
        // Fetch recent payments data
        let recentPayments = [];
        try {
          const paymentsRes = await fetch(`${backendUrl}/api/admin/payments/recent`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (paymentsRes.ok) {
            const paymentsData = await paymentsRes.json();
            recentPayments = paymentsData.payments || [];
          }
        } catch (err) {
          console.error('Error fetching recent payments:', err);
        }
        
        // Set dashboard data
        setDashboardData({
          outstanding: feesData.outstanding || 0,
          attentionCount: feesData.invoices?.filter((inv: any) => 
            ['SENT', 'PART_PAID', 'OVERDUE'].includes(inv.status)
          ).length || 0,
          pupilCount,
          classCount,
          recentPayments,
          recentPupils,
          recentTeachers,
          recentAnnouncements: announcements,
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

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} schoolName={schoolName || 'Your School'} />;
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Good morning, {schoolName || 'Dashboard'}
        </h1>
        <p className="mt-1 text-muted">
          Live dashboard — fees, results, and pupils from your database.
        </p>
      </div>

      {/* Stats Cards with Quick Actions Overlay */}
      <div className="mb-10 relative">
        {/* Quick Actions - Positioned on top right */}
        <div className="absolute top-0 right-0 flex gap-2 flex-wrap justify-end z-10">
          <Link href="/admin/students/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors shadow-sm hover:shadow-md">
              <Plus className="h-3.5 w-3.5" />
              <span>Student</span>
            </button>
          </Link>
          <Link href="/admin/teachers/">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors shadow-sm hover:shadow-md">
              <Plus className="h-3.5 w-3.5" />
              <span>Teacher</span>
            </button>
          </Link>
          <Link href="/admin/fees/">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors shadow-sm hover:shadow-md">
              <Plus className="h-3.5 w-3.5" />
              <span>Invoice</span>
            </button>
          </Link>
          <Link href="/admin/website/">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors shadow-sm hover:shadow-md">
              <Plus className="h-3.5 w-3.5" />
              <span>Announce</span>
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
      <div className="mb-10 hidden sm:block pt-12">
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
      </div>

      {/* Grid of sections - Responsive: 1 col mobile, 2 col tablet, 2 col desktop */}
      <section className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Payments */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
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
          <ul className="mt-4 divide-y divide-border flex-1">
            {!dashboardData?.recentPayments || dashboardData.recentPayments.length === 0 ? (
              <li className="py-3 text-sm text-muted">No payments yet.</li>
            ) : (
              dashboardData.recentPayments.slice(0, 3).map((p: any, idx: number) => (
                <li key={idx} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <span className="font-medium text-foreground text-sm truncate">{p.invoice?.pupil?.firstName} {p.invoice?.pupil?.lastName}</span>
                  <span className="text-xs text-muted flex-shrink-0">{new Date(p.paidAt || Date.now()).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 text-right min-w-fit">{formatMoney(p.amount, dashboardData?.currency || "NGN")}</span>
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/fees" className="mt-4 flex justify-end items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Latest Students */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
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
          <ul className="mt-4 divide-y divide-border flex-1">
            {!dashboardData?.recentPupils || dashboardData.recentPupils.length === 0 ? (
              <li className="py-3 text-sm text-muted">No new students yet.</li>
            ) : (
              dashboardData.recentPupils.slice(0, 3).map((pupil: any, idx: number) => (
                <li key={idx} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <span className="font-medium text-foreground text-sm truncate">{pupil.firstName} {pupil.lastName}</span>
                  <span className="text-xs text-muted flex-shrink-0">{pupil.class?.name || "Unassigned"} {pupil.class?.arm ? `(${pupil.class.arm})` : ""}</span>
                  <span className="text-xs text-muted flex-shrink-0">
                    {new Date(pupil.createdAt || Date.now()).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/students" className="mt-4 flex justify-end items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Latest Teachers */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
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
          <ul className="mt-4 divide-y divide-border flex-1">
            {!dashboardData?.recentTeachers || dashboardData.recentTeachers.length === 0 ? (
              <li className="py-3 text-sm text-muted">No recent teachers yet.</li>
            ) : (
              dashboardData.recentTeachers.slice(0, 3).map((teacher: any, idx: number) => (
                <li key={idx} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <span className="font-medium text-foreground text-sm truncate">{teacher.name || "Unknown"}</span>
                  <span className="text-xs text-muted truncate flex-shrink-0">{teacher.email || "No email"}</span>
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/teachers" className="mt-4 flex justify-end items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Latest Announcements */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
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
          <ul className="mt-4 divide-y divide-border flex-1">
            {!dashboardData?.recentAnnouncements || dashboardData.recentAnnouncements.length === 0 ? (
              <li className="py-3 text-sm text-muted">No announcements yet.</li>
            ) : (
              dashboardData.recentAnnouncements.slice(0, 3).map((announcement: any, idx: number) => (
                <li key={idx} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <span className="font-medium text-foreground text-sm truncate flex-1">{announcement.title || "Untitled"}</span>
                  <span className="text-xs text-muted flex-shrink-0">
                    {new Date(announcement.publishedAt || announcement.createdAt || Date.now()).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/website" className="mt-4 flex justify-end items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}