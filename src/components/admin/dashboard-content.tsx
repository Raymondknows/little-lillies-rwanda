'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/format';
import { DashboardCardsCarousel } from '@/components/admin/dashboard-cards-carousel';

export function AdminDashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        
        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load dashboard');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error loading dashboard</h1>
          <p className="text-muted mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!data?.school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">School not found</h1>
          <p className="text-muted">Please log in with a valid school account.</p>
        </div>
      </div>
    );
  }

  const { school, invoices, pupilCount, classCount, readyAssessment, recentPayments, recentPupils, recentTeachers, recentAnnouncements } = data;

  const outstanding = invoices.reduce(
    (sum: number, inv: any) => sum + Math.max(0, inv.amountDue - inv.amountPaid),
    0,
  );
  const attentionCount = invoices.filter((i: any) =>
    ['SENT', 'PART_PAID', 'OVERDUE'].includes(i.status),
  ).length;

  const stats = [
    {
      label: 'Outstanding fees',
      value: formatMoney(outstanding, school.currency),
      sub: `${attentionCount} invoices need attention`,
      href: '/admin/fees',
      iconName: 'creditcard' as const,
    },
    {
      label: 'Results to publish',
      value: readyAssessment?.name ?? 'None pending',
      sub: readyAssessment ? 'Ready for approval' : 'All caught up',
      href: '/admin/results',
      iconName: 'graduationcap' as const,
    },
    {
      label: 'Active pupils',
      value: String(pupilCount),
      sub: `${school.enabledPhases?.length ?? 0} phases enabled`,
      href: '/admin/students',
      iconName: 'users' as const,
    },
    {
      label: 'Classes',
      value: String(classCount),
      sub: 'Manage grade groups and sections',
      href: '/admin/classes',
      iconName: 'layers' as const,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Good morning, {school.name}
        </h1>
        <p className="mt-1 text-muted">
          Live dashboard — fees, results, and pupils from your database.
        </p>
      </div>

      <DashboardCardsCarousel stats={stats} />

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold text-foreground">Recent payments</h2>
          <ul className="mt-3 divide-y divide-border">
            {recentPayments.length === 0 ? (
              <li className="py-3 text-sm text-muted">No payments yet.</li>
            ) : (
              recentPayments.map((p: any) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-1 border-b border-border pb-2 pt-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">
                      {p.invoice ? `${p.invoice.pupil.firstName} ${p.invoice.pupil.lastName}` : 'Unknown student'}
                    </span>
                    <span className="text-sm font-semibold text-success">
                      {formatMoney(p.amount, school.currency)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>{p.invoice?.invoiceNo ?? 'No invoice'}</span>
                    <span>{new Date(p.paidAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 text-right">
            <Link href="/admin/fees" className="text-sm font-semibold text-brand hover:text-brand/80">
              View all payments
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold text-foreground">Recent students</h2>
          <ul className="mt-3 divide-y divide-border">
            {recentPupils.length === 0 ? (
              <li className="py-3 text-sm text-muted">No students yet.</li>
            ) : (
              recentPupils.map((p: any) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-1 border-b border-border pb-2 pt-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">
                      {p.firstName} {p.lastName}
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    {p.class?.name} {p.class?.arm ?? ''}
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 text-right">
            <Link href="/admin/students" className="text-sm font-semibold text-brand hover:text-brand/80">
              View all students
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
