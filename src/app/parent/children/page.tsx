"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, CreditCard, AlertCircle, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";

interface AttendanceData {
  todayStatus: string | null;
  todayDate: string | null;
  attendancePercentage: number | null;
  recentRecords: Array<{ date: string; status: string }>;
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        
        const res = await fetch(`${backendUrl}/api/parent/children`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Failed to load children');
        }

        const data = await res.json();
        setChildren(data.children || []);

        // Fetch attendance for each child
        const attendanceData: Record<string, AttendanceData> = {};
        for (const child of data.children || []) {
          try {
            const attendanceRes = await fetch(`${backendUrl}/api/parent/attendance/${child.id}`, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            if (attendanceRes.ok) {
              const attendanceInfo = await attendanceRes.json();
              attendanceData[child.id] = attendanceInfo;
              console.log(`Attendance for ${child.id}:`, attendanceInfo);
            } else {
              console.warn(`Attendance endpoint returned ${attendanceRes.status} for child ${child.id}`);
            }
          } catch (err) {
            console.error(`Error loading attendance for child ${child.id}:`, err);
          }
        }
        setAttendance(attendanceData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading children:", err);
        setError(err instanceof Error ? err.message : 'Failed to load children');
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
          <p className="mt-4 text-muted">Loading children...</p>
        </div>
      </div>
    );
  }

  const getAttendanceColor = (status: string | null) => {
    if (!status) return 'text-muted';
    if (status === 'PRESENT') return 'text-success';
    if (status === 'ABSENT') return 'text-error';
    if (status === 'LATE') return 'text-warning';
    if (status === 'EXCUSED') return 'text-brand';
    return 'text-muted';
  };

  const getAttendanceIcon = (status: string | null) => {
    if (!status) return null;
    if (status === 'PRESENT') return <CheckCircle className="h-4 w-4" />;
    if (status === 'ABSENT') return <XCircle className="h-4 w-4" />;
    if (status === 'LATE') return <Clock className="h-4 w-4" />;
    return null;
  };

  const formatStatus = (status: string | null) => {
    if (!status) return 'Not marked';
    if (status === 'PRESENT') return 'Present';
    if (status === 'ABSENT') return 'Absent';
    if (status === 'LATE') return 'Late';
    if (status === 'EXCUSED') return 'Excused';
    return status;
  };

  return (
    <div className="space-y-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground">My Children</h1>
        <p className="mt-2 text-muted">
          {children.length === 1 ? "1 child registered" : `${children.length} children registered`}
        </p>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {children.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface p-12 text-center shadow-sm">
          <Users className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No children registered yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child) => {
            const childAttendance = attendance[child.id];
            return (
              <div
                key={child.id}
                className="rounded-3xl border border-border bg-surface shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-4 p-4 sm:p-5 border-b border-border">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-foreground truncate">{child.firstName} {child.lastName}</p>
                    <p className="text-xs text-muted truncate">Admission: <span className="font-semibold text-foreground">{child.admissionNo}</span></p>
                  </div>
                  <div className="space-y-2 text-right">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold ${
                      child.status === 'ACTIVE' ? 'border-success bg-success/10 text-success' : 'border-warning bg-warning/10 text-warning'
                    }`}>
                      {child.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted">
                      {child.class?.name || 'Class'} {child.class?.section || ''}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 p-4 sm:p-5 border-b border-border">
                  <div className="rounded-3xl bg-white p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted mb-2">Fee Due</p>
                    <p className={`text-lg font-semibold ${child.outstandingFee > 0 ? 'text-error' : 'text-success'}`}>
                      {formatMoney(child.outstandingFee || 0)}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted mb-2">Attendance</p>
                    {childAttendance?.attendancePercentage != null ? (
                      <p className="text-lg font-semibold text-brand">{childAttendance.attendancePercentage}%</p>
                    ) : (
                      <p className="text-xs text-muted font-medium">No records</p>
                    )}
                  </div>
                  <div className="rounded-3xl bg-white p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted mb-2">Today</p>
                    {childAttendance?.todayStatus ? (
                      <div className={`flex items-center justify-center gap-1 text-lg font-semibold ${getAttendanceColor(childAttendance.todayStatus)}`}>
                        {getAttendanceIcon(childAttendance.todayStatus)}
                        <span className="text-sm">{formatStatus(childAttendance.todayStatus)}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted font-medium">Not marked</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 sm:p-5 space-y-3">
                  <Link
                    href={`/parent/results?childId=${child.id}`}
                    className="flex items-center justify-center gap-2 w-full rounded-3xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground hover:bg-background transition"
                  >
                    <BookOpen className="h-4 w-4" />
                    View Grades
                  </Link>
                  <Link
                    href={`/parent/invoices?childId=${child.id}`}
                    className="flex items-center justify-center gap-2 w-full rounded-3xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand/90 transition"
                  >
                    <CreditCard className="h-4 w-4" />
                    View Fees
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
