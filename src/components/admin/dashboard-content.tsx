'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, GraduationCap, Users, TrendingUp } from 'lucide-react';

interface DashboardData {
  invoices: Array<{ amountDue: number; amountPaid: number; status: string }>;
  pupilCount: number;
  classCount: number;
  readyAssessment: number | null;
  recentPayments: Array<{
    id: string;
    amount: number;
    paidAt: string;
    method: string;
    recordedBy: string;
    invoice: {
      invoiceNo: string;
      pupil: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  recentPupils: Array<{
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    class: { name: string };
  }>;
  recentTeachers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    body: string;
    publishedAt: string;
  }>;
  outstanding: number;
  attentionCount: number;
}

export function AdminDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const sessionData = await response.json();
        if (sessionData.session?.schoolId) {
          setSchoolId(sessionData.session.schoolId);
        }
      } catch (err) {
        console.error('Failed to get session:', err);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (!schoolId) return;

    const fetchDashboard = async () => {
      try {
        const response = await fetch(`/api/admin/dashboard`, {
          headers: {
            'x-school-id': schoolId,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
        setError(null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [schoolId]);

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
      <div className="p-8">
        <div className="rounded-lg bg-red-50 p-4 flex gap-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const paidInvoices = data.invoices.filter(inv => inv.status === 'PAID').length;
  const overDueInvoices = data.invoices.filter(inv => inv.status === 'OVERDUE').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome to Dashboard</h1>
        <p className="text-muted mt-2">Here's an overview of your school's key metrics</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Students Card */}
        <Link
          href="/admin/students"
          className="rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Total Students</p>
              <p className="text-2xl font-bold text-foreground mt-2">{data.pupilCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Link>

        {/* Classes Card */}
        <Link
          href="/admin/classes"
          className="rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Classes</p>
              <p className="text-2xl font-bold text-foreground mt-2">{data.classCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Link>

        {/* Paid Invoices Card */}
        <Link
          href="/admin/fees"
          className="rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Paid Invoices</p>
              <p className="text-2xl font-bold text-foreground mt-2">{paidInvoices}</p>
              <p className="text-xs text-muted mt-2">of {data.invoices.length} total</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Link>

        {/* Outstanding Fees Card */}
        <Link
          href="/admin/fees"
          className="rounded-xl border border-border bg-surface p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Outstanding Fees</p>
              <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(data.outstanding)}</p>
              <p className="text-xs text-muted mt-2">{overDueInvoices} overdue</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Payments */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Payments</h2>
            <Link href="/admin/fees" className="text-brand text-sm hover:underline">
              View All
            </Link>
          </div>
          {data.recentPayments.length > 0 ? (
            <div className="space-y-4">
              {data.recentPayments.slice(0, 5).map(payment => (
                <div key={payment.id} className="flex items-start justify-between pb-4 border-b border-border last:border-b-0">
                  <div>
                    <p className="font-medium text-foreground">
                      {payment.invoice.pupil.firstName} {payment.invoice.pupil.lastName}
                    </p>
                    <p className="text-sm text-muted">{payment.invoice.invoiceNo} • Recorded by {payment.recordedBy}</p>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No recent payments</p>
          )}
        </div>

        {/* Alerts & Summary */}
        <div className="space-y-6">
          {/* Attention Items */}
          {data.attentionCount > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900">Action Required</h3>
                  <p className="text-sm text-orange-700 mt-2">{data.attentionCount} items need attention</p>
                  <Link href="/admin/fees" className="text-orange-600 text-sm font-medium mt-3 inline-block hover:underline">
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Summary */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-semibold text-foreground mb-4">Key Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Total Invoices</span>
                <span className="font-medium text-foreground">{data.invoices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Paid</span>
                <span className="font-medium text-emerald-600">{paidInvoices}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Overdue</span>
                <span className="font-medium text-orange-600">{overDueInvoices}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="text-sm font-medium text-foreground">Outstanding</span>
                <span className="font-bold text-orange-600">{formatCurrency(data.outstanding)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Additions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recently Added Students</h2>
            <Link href="/admin/students" className="text-brand text-sm hover:underline">
              View All
            </Link>
          </div>
          {data.recentPupils.length > 0 ? (
            <div className="space-y-3">
              {data.recentPupils.slice(0, 4).map(pupil => (
                <div key={pupil.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div>
                    <p className="font-medium text-foreground">
                      {pupil.firstName} {pupil.lastName}
                    </p>
                    <p className="text-sm text-muted">{pupil.class.name}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{pupil.admissionNo}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No recent students</p>
          )}
        </div>

        {/* Recent Teachers */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Staff Members</h2>
            <Link href="/admin/staff" className="text-brand text-sm hover:underline">
              Manage
            </Link>
          </div>
          {data.recentTeachers.length > 0 ? (
            <div className="space-y-3">
              {data.recentTeachers.slice(0, 4).map(teacher => (
                <div key={teacher.id} className="py-3 border-b border-border last:border-b-0">
                  <p className="font-medium text-foreground">{teacher.name}</p>
                  <p className="text-sm text-muted">{teacher.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No staff members</p>
          )}
        </div>
      </div>

      {/* Announcements */}
      {data.recentAnnouncements.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Latest Announcements</h2>
            <Link href="/admin/announcements" className="text-brand text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {data.recentAnnouncements.slice(0, 3).map(announcement => (
              <div key={announcement.id} className="pb-4 border-b border-border last:border-b-0">
                <h3 className="font-medium text-foreground">{announcement.title}</h3>
                <p className="text-sm text-muted mt-2 line-clamp-2">{announcement.body}</p>
                <p className="text-xs text-muted mt-2">
                  {new Date(announcement.publishedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
