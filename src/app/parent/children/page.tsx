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
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
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
      // Support multiple possible API shapes: { children: [...] } or { data: [...] } or direct array
      const childrenList = data.children || data.data || (Array.isArray(data) ? data : null) || [];
      setChildren(childrenList || []);

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

      // Fetch attendance for each child (use normalized children list)
      const attendanceData: Record<string, AttendanceData> = {};
      for (const child of childrenList || []) {
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

  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Fetch richer profile (dob, guardians) for selected child if available
  const [childProfiles, setChildProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!selectedChildId) return;

    const fetchProfile = async () => {
      try {
        const backendUrl = getBackendUrl();
        // Try common profile endpoints; backend may expose one of these
        const candidates = [
          `${backendUrl}/api/parent/children/${selectedChildId}`,
          `${backendUrl}/api/parent/children/${selectedChildId}/profile`,
          `${backendUrl}/api/parent/children/${selectedChildId}/summary`,
        ];

        for (const url of candidates) {
          try {
            const res = await fetch(url, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) continue;
            const data = await res.json();
            // Normalize: some endpoints return { data: {...} } or direct object
            const profile = data.data || data || {};
            if (Object.keys(profile).length === 0) continue;
            setChildProfiles((prev) => ({ ...prev, [selectedChildId]: profile }));
            return;
          } catch (err) {
            // try next candidate
            continue;
          }
        }
      } catch (err) {
        console.error('Error fetching child profile:', err);
      }
    };

    fetchProfile();
  }, [selectedChildId]);

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
            <div key={i} className="rounded-[20px] border border-border bg-surface overflow-hidden space-y-4 p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 rounded-3xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-slate-100 rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="rounded-lg bg-background p-3">
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">My Children</h1>
          <p className="mt-1 text-sm text-muted">{children.length === 1 ? "1 child registered" : `${children.length} children registered`}</p>
        </div>

        {error && (
          <div className="rounded-[12px] border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: list */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-[12px] border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted">Students</p>
                    <p className="text-lg font-semibold text-foreground">{children.length}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    placeholder="Search by name or admission no..."
                    onChange={() => {}}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="rounded-[12px] border border-border bg-surface overflow-hidden">
                <div className="divide-y divide-border max-h-[60vh] overflow-auto">
                  {children.map((c) => {
                    const isSelected = selectedChildId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChildId(c.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-background transition ${isSelected ? 'bg-background' : ''}`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 overflow-hidden">
                          {c.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.photoUrl} alt={`${c.firstName} ${c.lastName}`} className="h-10 w-10 object-cover" />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center">{(c.firstName || '').charAt(0)}</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{[c.lastName, c.firstName].filter(Boolean).join(' ')}</p>
                          <p className="text-xs text-muted truncate">{c.admissionNo || '—'}</p>
                        </div>
                        <div className="ml-auto text-xs text-muted">{c.class?.name || ''}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Right: detail */}
          <main className="lg:col-span-8">
            {selectedChildId ? (
              (() => {
                const child = children.find((x) => x.id === selectedChildId)!;
                const childAttendance = attendance[child.id];
                return (
                  <div className="rounded-[12px] border border-border bg-surface shadow-sm overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 p-6 border-b border-border">
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-background text-2xl font-semibold text-foreground overflow-hidden">
                          {child.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={child.photoUrl} alt={`${child.firstName} ${child.lastName}`} className="h-20 w-20 object-cover" />
                          ) : (
                            <div className="h-20 w-20 flex items-center justify-center text-2xl font-semibold">{(child.firstName || '').charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em] text-muted">Student</p>
                          <h2 className="text-2xl font-bold text-foreground">{[child.lastName, child.firstName].filter(Boolean).join(' ')}</h2>
                          <p className="text-sm text-muted mt-1">Admission: <span className="font-medium text-foreground">{child.admissionNo}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href={`/parent/results?childId=${child.id}`} className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">View Grades</Link>
                        <Link href={`/parent/invoices?childId=${child.id}`} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground">View Fees</Link>
                      </div>
                    </div>

                    <div className="p-6 grid gap-6 lg:grid-cols-3">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="rounded-md bg-background p-4">
                            <p className="text-xs text-muted uppercase">Fee Due</p>
                            <p className="mt-2 text-xl font-semibold text-foreground break-words">{formatMoney(child.outstandingFee || 0, currency)}</p>
                          </div>
                          <div className="rounded-md bg-background p-4">
                            <p className="text-xs text-muted uppercase">Attendance</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">{childAttendance?.attendancePercentage != null ? `${childAttendance.attendancePercentage}%` : 'No records'}</p>
                          </div>
                          <div className="rounded-md bg-background p-4">
                            <p className="text-xs text-muted uppercase">Today</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">{childAttendance?.todayStatus ? formatStatus(childAttendance.todayStatus) : getSmartStatusMessage(null, schoolHours)}</p>
                          </div>
                        </div>

                        {childAttendance?.recentRecords && childAttendance.recentRecords.length > 0 && (
                          <div className="rounded-md bg-background p-4">
                            <p className="text-sm font-semibold text-foreground mb-3">Attendance Trend</p>
                            <div className="h-32 flex items-end gap-1">
                              {childAttendance.recentRecords.slice(0, 30).reverse().map((r, idx) => (
                                <div key={idx} className="flex-1 h-full flex items-end">
                                  <div className={`w-full rounded-t-sm ${r.status === 'PRESENT' ? 'bg-brand' : r.status === 'LATE' ? 'bg-brand/70' : r.status === 'ABSENT' ? 'bg-error/60' : 'bg-brand/50'}`} style={{height: r.status === 'PRESENT' ? '100%' : r.status === 'LATE' ? '75%' : r.status === 'EXCUSED' ? '50%' : '20%'}} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <aside className="space-y-4">
                        <div className="rounded-md bg-background p-4">
                          <p className="text-xs text-muted">Class</p>
                          <p className="mt-2 font-semibold text-foreground">{child.class?.name ?? '—'} {child.class?.section ?? ''}</p>
                        </div>
                        <div className="rounded-md bg-background p-4">
                          <p className="text-xs text-muted">DOB</p>
                          <p className="mt-2 font-semibold text-foreground">{(childProfiles[child.id]?.dateOfBirth ?? child.dateOfBirth) ? new Date((childProfiles[child.id]?.dateOfBirth ?? child.dateOfBirth) as string).toLocaleDateString() : '—'}</p>
                        </div>
                        <div className="rounded-md bg-background p-4">
                          <p className="text-xs text-muted">Guardian</p>
                          <p className="mt-2 font-semibold text-foreground">{
                            (() => {
                              const profile = childProfiles[child.id] || {};
                              const first = profile?.guardians?.[0]?.guardian?.firstName || profile?.guardians?.[0]?.firstName || profile?.guardian?.firstName || child.guardians?.[0]?.guardian?.firstName || child.guardians?.[0]?.firstName;
                              const last = profile?.guardians?.[0]?.guardian?.lastName || profile?.guardians?.[0]?.lastName || profile?.guardian?.lastName || child.guardians?.[0]?.guardian?.lastName || child.guardians?.[0]?.lastName;
                              return first ? `${first} ${last || ''}`.trim() : '—';
                            })()
                          }</p>
                        </div>
                      </aside>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="rounded-[12px] border border-border bg-surface p-8 text-center">
                <Users className="h-12 w-12 text-muted mx-auto mb-3" />
                <p className="text-muted">Select a child to view details</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </ParentPageShell>
  );
}
