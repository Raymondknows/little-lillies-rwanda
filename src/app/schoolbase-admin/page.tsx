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
  Plus,
  Activity,
  Mail,
  Clock,
  MessageCircle,
  ShieldCheck,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminPageShell from "@/components/admin-page-shell";
import AdminSkeleton from "@/components/ui/skeleton";
import { getBackendUrl } from "@/lib/backend-url";

export default function PlatformOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [trialSchools, setTrialSchools] = useState<any[]>([]);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardMessage, setDashboardMessage] = useState<string | null>(null);
  const [reminding, setReminding] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [cardScroll, setCardScroll] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();

        const [statsRes, schoolsRes, activityRes, emailRes, trialRes, supportRes] = await Promise.all([
          fetch(`${backendUrl}/schoolbase-admin/api/stats`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${backendUrl}/schoolbase-admin/api/schools?limit=5`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${backendUrl}/schoolbase-admin/api/audit-logs?limit=5`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${backendUrl}/schoolbase-admin/api/email-logs?limit=5`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${backendUrl}/schoolbase-admin/api/schools?status=TRIAL&limit=5`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${backendUrl}/schoolbase-admin/api/support`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        const [statsData, schoolsData, activityData, emailData, trialData, supportData] = await Promise.all([
          statsRes.json(),
          schoolsRes.json(),
          activityRes.json(),
          emailRes.json(),
          trialRes.json(),
          supportRes.json(),
        ]);

        setStats(statsData);
        setSchools(schoolsData.schools || []);
        setActivityLogs(activityData.logs || []);
        setEmailLogs(emailData.logs || []);
        setTrialSchools(trialData.schools || []);
        setSupportRequests(supportData.supportRequests || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading platform data:", err);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const sendSetupReminders = async () => {
    setReminding(true);
    setDashboardMessage(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/schoolbase-admin/api/reminders`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      const result = await response.json();
      if (!response.ok) {
        setDashboardMessage(result.message || "Failed to send reminders.");
      } else {
        setDashboardMessage(`Sent reminders to ${result.sentCount ?? result.total ?? "incomplete"} incomplete schools.`);
      }
    } catch (error) {
      setDashboardMessage(error instanceof Error ? error.message : "Failed to send reminders.");
    } finally {
      setReminding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSkeleton />
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
    <AdminPageShell
      title="Platform Overview"
      subtitle="Manage all schools and monitor platform health"
      actions={
        <button
          type="button"
          onClick={() => setIsPanelOpen(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#0A66C2] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0952a4]"
        >
          Open admin panel
        </button>
      }
    >
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
      <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Link href="/schoolbase-admin/schools">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <Building2 className="h-4 w-4 mr-2" />
            View Schools
          </button>
        </Link>
        <Link href="/schoolbase-admin/email-center">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </button>
        </Link>
        <Link href="/schoolbase-admin/support">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <MessageCircle className="h-4 w-4 mr-2" />
            View Support
          </button>
        </Link>
        <button
          type="button"
          onClick={sendSetupReminders}
          disabled={reminding}
          className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0952a4] transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Bell className="h-4 w-4 mr-2" />
          Send setup reminders
        </button>
      </div>

      {isPanelOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsPanelOpen(false)}
          />
          <div className={`relative ml-auto flex h-full w-full max-w-4xl flex-col overflow-hidden bg-surface shadow-2xl transition-transform duration-300 ease-out ${
            isPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Feature panel</p>
                <h2 className="text-2xl font-semibold text-foreground">Admin insights</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="rounded-full p-2 text-muted transition hover:bg-border hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Recent activity</h3>
                    <p className="text-sm text-muted">Audit events and school actions.</p>
                  </div>
                  <Link href="/schoolbase-admin/audit" className="text-sm font-semibold text-brand hover:text-brand/80">
                    View all
                  </Link>
                </div>
                <div className="grid gap-3">
                  {activityLogs.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">No activity recorded yet.</div>
                  ) : (
                    activityLogs.map((log: any) => (
                      <div key={log.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{log.event.replace(/_/g, ' ')}</p>
                            <p className="mt-1 text-xs text-muted">{log.details}</p>
                          </div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {log.school?.name ? (
                          <p className="mt-3 text-xs text-muted">School: {log.school.name}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Recent emails</h3>
                    <p className="text-sm text-muted">Latest outbound email events.</p>
                  </div>
                  <Link href="/schoolbase-admin/email-logs" className="text-sm font-semibold text-brand hover:text-brand/80">
                    View logs
                  </Link>
                </div>
                <div className="grid gap-3">
                  {emailLogs.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">No email activity recorded.</div>
                  ) : (
                    emailLogs.map((log: any) => (
                      <div key={log.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{log.subject}</p>
                            <p className="mt-1 text-xs text-muted">{log.emailType}</p>
                          </div>
                          <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                            {new Date(log.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted">{log.recipientEmail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Trial schools</h3>
                    <p className="text-sm text-muted">Schools currently on trial.</p>
                  </div>
                  <Link href="/schoolbase-admin/schools?status=TRIAL" className="text-sm font-semibold text-brand hover:text-brand/80">
                    View all
                  </Link>
                </div>
                <div className="grid gap-3">
                  {trialSchools.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">No trial schools to show.</div>
                  ) : (
                    trialSchools.map((school: any) => (
                      <div key={school.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{school.name}</p>
                            <p className="mt-1 text-xs text-muted">{school.country}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{school.userCount || 0} users</p>
                            <p className="text-xs text-muted">
                              Ends {school.trialEndsAt ? new Date(school.trialEndsAt).toLocaleDateString() : 'n/a'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Open support requests</h3>
                    <p className="text-sm text-muted">Recent tickets from schools.</p>
                  </div>
                  <Link href="/schoolbase-admin/support" className="text-sm font-semibold text-brand hover:text-brand/80">
                    View all
                  </Link>
                </div>
                <div className="grid gap-3">
                  {supportRequests.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">No open support requests at the moment.</div>
                  ) : (
                    supportRequests.slice(0, 5).map((request: any) => (
                      <div key={request.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                        <p className="text-sm font-semibold text-foreground">{request.subject}</p>
                        <p className="mt-1 text-xs text-muted">{request.school?.name || 'Unknown school'} • {request.priority}</p>
                        <p className="mt-2 text-xs text-muted line-clamp-2">{request.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
    </AdminPageShell>
  );
}
