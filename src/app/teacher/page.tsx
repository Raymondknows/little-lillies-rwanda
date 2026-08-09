'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FileText,
  ClipboardList,
  Bell,
  AlertCircle,
  BookOpen,
  Gauge,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  getTeacherDashboard,
  getTeacherDashboardMetrics,
  type TeacherDashboardData,
  detectSchoolPhase,
} from '@/lib/teacher-utils';
import { SubscriptionBlockedError } from '@/lib/subscription-utils';
import SubscriptionModal from '@/components/subscription-modal';

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const dashboardData = await getTeacherDashboard();
        const metrics = await getTeacherDashboardMetrics(dashboardData.classes).catch(() => ({
          pendingResultAssessments: 0,
          pendingAttendanceRegisters: 0,
          publishedAnnouncements: 0,
        }));

        setData({ ...dashboardData, metrics });
      } catch (err: any) {
        console.error('Error loading teacher dashboard:', err);
        
        // Check if it's a subscription error
        if (err instanceof SubscriptionBlockedError) {
          setSubscriptionBlocked({ reason: err.reason });
        } else {
          setError(err.message || 'Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-brand"></div>
          <p className="mt-4 text-sm text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
          No data available
        </div>
      </div>
    );
  }

  const schoolPhase = detectSchoolPhase(data.school);
  const metrics = data.metrics ?? {
    pendingResultAssessments: 0,
    pendingAttendanceRegisters: 0,
    publishedAnnouncements: 0,
  };
  const pendingAssessmentCount = metrics.pendingResultAssessments;
  const pendingAttendanceCount = metrics.pendingAttendanceRegisters;
  const announcementCount = metrics.publishedAnnouncements;

  const statCards = [
    {
      label: 'Open result assessments',
      value: String(pendingAssessmentCount),
      sub: pendingAssessmentCount === 1 ? 'Assessment needs attention' : 'Assessments needing entry',
      icon: FileText,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      accent: 'from-blue-500/10 to-blue-600/5',
    },
    {
      label: 'Attendance not submitted',
      value: String(pendingAttendanceCount),
      sub: pendingAttendanceCount === 1 ? 'Class still needs today’s mark' : 'Classes still need today’s mark',
      icon: ClipboardList,
      color: 'bg-violet-50',
      iconColor: 'text-violet-600',
      accent: 'from-violet-500/10 to-violet-600/5',
    },
    {
      label: 'Published announcements',
      value: String(announcementCount),
      sub: announcementCount === 1 ? 'Recent school update' : 'Published school updates',
      icon: Bell,
      color: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accent: 'from-amber-500/10 to-amber-600/5',
    },
  ];

  const quickActions = [
    { href: '/teacher/attendance', label: 'Attendance', icon: ClipboardList },
    { href: '/teacher/results', label: 'Results', icon: FileText },
    { href: '/teacher/subjects', label: 'Subjects', icon: BookOpen },
    { href: '/teacher/class', label: 'Classes', icon: Gauge },
  ];

  return (
    <div className="px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
        <section className="px-1 py-1 sm:px-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome back, {data.teacher.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
            {data.school?.name} • {schoolPhase}
          </p>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {statCards.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <article
                key={idx}
                className={`rounded-[20px] border border-border/70 bg-gradient-to-br ${stat.accent} p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${stat.color}`}>
                    <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{stat.sub}</p>
              </article>
            );
          })}
        </section>

        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-brand px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-brand/90"
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>

        <section className="rounded-[24px] border border-border/70 bg-surface/80 p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Your classes</h2>
              <p className="mt-1 text-sm text-muted">Manage the classes assigned to you.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {data.classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/teacher/class?id=${cls.id}`}
                className="group flex items-center justify-between rounded-2xl border border-border bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{cls.name}</p>
                    <p className="mt-1 text-sm text-muted">{cls.phase}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{cls.studentCount}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Students</p>
                </div>
              </Link>
            ))}
          </div>

          {data.classes.length === 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-background/70 px-6 py-8 text-center text-sm text-muted">
              No classes assigned yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

