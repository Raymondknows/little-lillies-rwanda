"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, CreditCard, AlertCircle, Users, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";
import ParentPageShell from "@/components/parent-page-shell";
import { useEffectiveCurrency, useParentSchool } from "../parent-school-context";

interface AttendanceData {
  todayStatus: string | null;
  todayDate: string | null;
  attendancePercentage: number | null;
  recentRecords: Array<{ date: string; status: string }>;
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceData>>({});
  const [schoolHours, setSchoolHours] = useState<{ start: string; end: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
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

      // Load school info to get school hours
      try {
        const schoolRes = await fetch(`${backendUrl}/api/parent/school`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (schoolRes.ok) {
          const schoolData = await schoolRes.json();
          if (schoolData?.schoolHours) {
            setSchoolHours(schoolData.schoolHours);
          }
        }
      } catch (err) {
        console.error('Error loading school info:', err);
      }

      // Fetch attendance for each child
      const attendanceData: Record<string, AttendanceData> = {};
      for (const child of data.children || []) {
        try {
          const attendanceRes = await fetch(`${backendUrl}/api/parent/attendance/${child.id}?days=30`, {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const { school: parentSchool } = useParentSchool();
  const currency = useEffectiveCurrency(parentSchool);

  if (loading) {
    return (
      <ParentPageShell onRefresh={loadData}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-64 bg-slate-100 rounded animate-pulse"></div>
          </div>
          
          {/* Card skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border border-border bg-surface overflow-hidden space-y-4 p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 rounded-3xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-slate-100 rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="rounded-3xl bg-white p-3">
                    <div className="h-3 w-16 bg-slate-100 rounded mb-2 mx-auto animate-pulse"></div>
                    <div className="h-6 w-20 bg-slate-200 rounded mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ParentPageShell>
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

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  const getSmartStatusMessage = (status: string | null, schoolHours: { start: string; end: string } | null) => {
    if (status) {
      return formatStatus(status);
    }

    // Check if today is weekend
    const today = new Date();
    if (isWeekend(today)) {
      return 'No school today';
    }

    // Check if school day has ended
    if (schoolHours?.end) {
      const [endHour, endMin] = schoolHours.end.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(endHour, endMin, 0, 0);
      
      if (new Date() > endTime) {
        return 'Not marked';
      } else {
        return 'Waiting...';
      }
    }

    return 'Not marked';
  };


  return (
    <ParentPageShell onRefresh={loadData}>
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
                    <p className="text-lg font-semibold text-foreground truncate">{[child.lastName, child.firstName].filter(Boolean).join(' ')}</p>
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
                      {formatMoney(child.outstandingFee || 0, currency)}
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
                      <p className="text-xs text-muted font-medium">{getSmartStatusMessage(null, schoolHours)}</p>
                    )}
                  </div>
                </div>

                {/* Attendance History Chart */}
                {childAttendance?.recentRecords && childAttendance.recentRecords.length > 0 && (
                  <div className="p-4 sm:p-5 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-brand" />
                      <p className="text-sm font-semibold text-foreground">Attendance Trend</p>
                    </div>
                    <div className="bg-gradient-to-br from-brand/5 to-brand/10 rounded-2xl p-4 border border-brand/20">
                      <div className="flex items-end justify-between gap-0.5 h-28">
                        {childAttendance.recentRecords.slice(0, 30).reverse().map((record, idx) => {
                          const dateObj = new Date(record.date);
                          const dayLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          let height = 0;
                          let barColor = 'bg-brand/40';
                          let bgColor = 'bg-brand/10';
                          
                          if (record.status === 'PRESENT') {
                            height = 100;
                            barColor = 'bg-brand';
                            bgColor = 'bg-brand/10';
                          } else if (record.status === 'LATE') {
                            height = 75;
                            barColor = 'bg-brand/70';
                            bgColor = 'bg-brand/5';
                          } else if (record.status === 'EXCUSED') {
                            height = 50;
                            barColor = 'bg-brand/50';
                            bgColor = 'bg-brand/5';
                          } else if (record.status === 'ABSENT') {
                            height = 20;
                            barColor = 'bg-error/60';
                            bgColor = 'bg-error/5';
                          }
                          
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full flex items-end justify-center h-24">
                                <div
                                  className={`w-full rounded-t-md ${barColor} transition-all hover:opacity-80 cursor-pointer shadow-sm`}
                                  style={{ height: `${height}%`, minHeight: height > 0 ? '2px' : '0px' }}
                                  title={`${dateObj.toLocaleDateString()}: ${record.status}`}
                                />
                              </div>
                              <p className="text-[8px] text-muted font-medium text-center leading-tight">{dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-3 border-t border-brand/20 flex gap-4 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm bg-brand"></div>
                          <span className="text-muted">Present</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm bg-brand/70"></div>
                          <span className="text-muted">Late</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm bg-brand/50"></div>
                          <span className="text-muted">Excused</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm bg-error/60"></div>
                          <span className="text-muted">Absent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
    </ParentPageShell>
  );
}
