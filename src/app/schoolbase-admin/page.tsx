import { redirect } from "next/navigation";
import { getPlatformAdminDashboardData } from "@/lib/platform-admin";
import { SchoolTable } from "@/components/platform-admin/school-table";
import { ThemeToggle } from "@/components/platform-admin/theme-toggle";
import PlatformOverviewSlideOut from "@/components/platform-admin/overview-slideout";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

import { getPlatformAdminSession } from "@/lib/auth";

export default async function PlatformAdminDashboardPage() {
  const session = await getPlatformAdminSession();
  if (!session) {
    redirect("/schoolbase-admin/login");
  }

  const data = await getPlatformAdminDashboardData();

  const stats = [
    { label: "Total schools", value: data.schoolCount, accent: "bg-brand/10 text-brand" },
    { label: "Active schools", value: data.activeCount, accent: "bg-emerald-100 text-emerald-700" },
    { label: "Trial schools", value: data.trialCount, accent: "bg-sky-100 text-sky-700" },
    { label: "Suspended schools", value: data.suspendedCount, accent: "bg-amber-100 text-amber-800" },
    { label: "Total students", value: data.studentCount, accent: "bg-indigo-100 text-indigo-700" },
    { label: "Total teachers", value: data.teacherCount, accent: "bg-violet-100 text-violet-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Manage every registered school across Africa, monitor onboarding, and take action instantly from a single platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PlatformOverviewSlideOut countryBreakdown={data.countryBreakdown} recentSchools={data.recentSchools.map((s: any) => ({
            id: s.id,
            name: s.name,
            country: s.country,
            plan: s.plan,
            createdAt: s.createdAt.toISOString(),
            status: s.status,
            isVerified: s.isVerified ?? false,
            trialEndsAt: s.trialEndsAt?.toISOString() ?? null,
          }))} compact />
          <ThemeToggle />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-border bg-surface p-6 shadow-sm shadow-slate-200/50">
            <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stat.accent}`}>
              {stat.label}
            </div>
            <p className="mt-4 text-4xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      

      <SchoolTable initialSchools={data.recentSchools.map((school: any) => ({
        id: school.id,
        name: school.name,
        logoUrl: school.logoUrl,
        country: school.country,
        email: school.email,
        phone: school.phone,
        plan: school.plan,
        status: school.status,
        isVerified: school.isVerified ?? false,
        trialEndsAt: school.trialEndsAt?.toISOString() ?? null,
        createdAt: school.createdAt.toISOString(),
      }))}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
          <div className="mt-4 overflow-x-auto">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted">No platform activity yet.</p>
            ) : (
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-background text-left text-xs uppercase tracking-[0.15em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentActivity.map((activity: any) => (
                    <tr key={activity.id} className="hover:bg-brand/5 transition-colors">
                      <td className="px-4 py-4 font-semibold text-foreground">{activity.event}</td>
                      <td className="px-4 py-4 text-muted">{activity.details}</td>
                      <td className="px-4 py-4 text-xs text-muted">{formatDate(activity.createdAt.toISOString())}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground">Support queue</h2>
          <p className="mt-1 text-sm text-muted">Open requests from schools and contact requests.</p>
          <div className="mt-4 overflow-x-auto">
            {data.supportRequests.length === 0 ? (
              <p className="text-sm text-muted">No outstanding support requests.</p>
            ) : (
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-background text-left text-xs uppercase tracking-[0.15em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">School</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.supportRequests.map((request: any) => (
                    <tr key={request.id} className="hover:bg-brand/5 transition-colors">
                      <td className="px-4 py-4 font-semibold text-foreground">{request.subject}</td>
                      <td className="px-4 py-4 text-muted">{request.school?.name ?? "Unknown school"}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-foreground">{request.priority}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-amber-800">{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
