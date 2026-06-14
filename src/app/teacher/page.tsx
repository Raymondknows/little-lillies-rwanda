'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FileText,
  ClipboardList,
  Bell,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { getTeacherDashboard, type TeacherDashboardData, detectSchoolPhase } from '@/lib/teacher-utils';

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const dashboardData = await getTeacherDashboard();
        setData(dashboardData);
      } catch (err: any) {
        console.error('Error loading teacher dashboard:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
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
          <p className="mt-4 text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted">No data available</p>
        </div>
      </div>
    );
  }

  const schoolPhase = detectSchoolPhase(data.school);
  const pendingAssessmentCount = 0; // Can be enhanced with assessment status
  const pendingAttendanceCount = data.classes.length;
  const announcementCount = 0; // Can be fetched from backend

  const statCards = [
    {
      label: "Pending result entries",
      value: String(pendingAssessmentCount),
      sub: "Awaiting submission",
      icon: FileText,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Attendance registers today",
      value: String(pendingAttendanceCount),
      sub: "Classes to mark",
      icon: ClipboardList,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Current announcements",
      value: String(announcementCount),
      sub: "New messages",
      icon: Bell,
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {data.teacher.name}</h1>
        <p className="mt-1 text-muted">Your teaching workspace for {data.school?.name}</p>
      </div>

      {/* Stats Cards - Desktop */}
      <div className="mb-10 hidden sm:block">
        <div className="grid grid-cols-3 gap-4">
          {statCards.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div key={idx} className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
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
            );
          })}
        </div>
      </div>

      {/* Stats Cards - Mobile */}
      <div className="sm:hidden mb-10">
        {statCards.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="block mb-3">
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
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link href="/teacher/attendance">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <ClipboardList className="h-4 w-4 mr-2" />
            Mark Attendance
          </button>
        </Link>
        <Link href="/teacher/class">
          <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium shadow-sm hover:shadow-md">
            <FileText className="h-4 w-4 mr-2" />
            View Classes
          </button>
        </Link>
      </div>

      {/* Your Classes Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Classes</h2>
          <p className="mt-1 text-muted">Manage and view your assigned classes.</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          {/* Desktop Table */}
          <table className="hidden sm:table w-full text-left text-sm">
            <thead className="border-b border-border bg-background text-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Class</th>
                <th className="px-6 py-3 font-semibold">Phase</th>
                <th className="px-6 py-3 font-semibold">Students</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.classes.map((cls) => (
                <tr key={cls.id} className="border-t border-border hover:bg-background transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{cls.name}</td>
                  <td className="px-6 py-4 text-muted">{cls.phase}</td>
                  <td className="px-6 py-4 text-muted">{cls.studentCount}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/teacher/class?id=${cls.id}`}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium rounded transition-colors bg-brand text-white hover:bg-brand/90"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card */}
          <div className="sm:hidden divide-y divide-border">
            {data.classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/teacher/class?id=${cls.id}`}
                className="block p-4 hover:bg-background transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{cls.name}</p>
                    <p className="text-xs text-muted mt-1">
                      {cls.phase} • {cls.studentCount} students
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right ml-2">
                    <p className="text-xs font-medium text-brand">View</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data.classes.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-muted">No classes assigned yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

