"use client";

import { getBackendUrl } from "@/lib/backend-url";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, CheckCircle, AlertCircle, Clock, Send, TrendingUp, ArrowUpRight, Download, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SubscriptionModal from "@/components/subscription-modal";

interface ClassData {
  id: string;
  name: string;
  phase: string;
  arm?: string;
}

interface Pupil {
  pupilId: string;
  name: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  guardians: Array<{ id: string; name: string; phone?: string; email?: string }>;
}

interface AttendanceData {
  date: string;
  classId: string;
  className: string;
  pupils: Pupil[];
  totalPupils: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

interface AttendanceSummaryRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  pupil: {
    id: string;
    firstName: string;
    lastName: string;
  };
  class: {
    id: string;
    name: string;
  };
}

interface AttendanceSummaryData {
  summary: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
  };
  records: AttendanceSummaryRecord[];
}

const PHASE_ORDER = ["EARLY_YEARS", "PRIMARY", "SECONDARY"];
const PHASE_LABELS: { [key: string]: string } = {
  EARLY_YEARS: "Early Years",
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
};

export default function AttendancePage() {
  const router = useRouter();
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [summaryData, setSummaryData] = useState<AttendanceSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [modifications, setModifications] = useState<{ [key: string]: "PRESENT" | "ABSENT" | "LATE" }>({});
  const [notificationMode, setNotificationMode] = useState<"ALL" | "ABSENT" | "LATE">("ALL");
  const [classesLoading, setClassesLoading] = useState(true);

  // Fetch classes on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/classes/data`, {
          credentials: "include",
        });
        if (!response.ok) {
          // Check for subscription blocking
          if (response.status === 403) {
            const errorBody = await response.json().catch(() => null);
            if (errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
              setSubscriptionBlocked({ reason: errorBody.reason || 'Your school subscription is not active' });
              setClassesLoading(false);
              return;
            }
          }
          setError("Failed to load classes");
        } else {
          const data = await response.json();
          const sorted = (data.classes || []).sort((a: any, b: any) => {
            const phaseOrder = PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase);
            if (phaseOrder !== 0) return phaseOrder;
            return a.name.localeCompare(b.name);
          });
          setAllClasses(sorted);
          if (sorted.length > 0 && selectedClass === "ALL") {
            setSelectedPhase("ALL");
          }
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setError("Failed to load classes");
      } finally {
        setClassesLoading(false);
      }
    }
    fetchClasses();
  }, []);

  // Filter classes by phase
  const filteredClasses = useMemo(() => {
    if (selectedPhase === "ALL") return allClasses;
    return allClasses.filter((cls) => cls.phase === selectedPhase);
  }, [allClasses, selectedPhase]);

  useEffect(() => {
    if (selectedClass === "ALL") return;
    if (!filteredClasses.some((cls) => cls.id === selectedClass)) {
      const fallbackClass = filteredClasses[0] || allClasses[0];
      if (fallbackClass) {
        setSelectedClass(fallbackClass.id);
      }
    }
  }, [allClasses, filteredClasses, selectedClass]);

  // Fetch attendance data when class or date changes
  useEffect(() => {
    if (!selectedClass) return;

    async function fetchAttendance() {
      setLoading(true);
      setError(null);
      try {
        const backendUrl = getBackendUrl();
        if (selectedClass === "ALL") {
          const response = await fetch(
            `${backendUrl}/api/admin/attendance/summary?fromDate=${selectedDate}&toDate=${selectedDate}`,
            { credentials: "include" }
          );
          if (response.ok) {
            const data = await response.json();
            setSummaryData(data);
            setAttendanceData(null);
            setModifications({});
          } else {
            throw new Error("Failed to load attendance summary");
          }
        } else {
          const response = await fetch(
            `${backendUrl}/api/admin/attendance/data?classId=${selectedClass}&date=${selectedDate}`,
            { credentials: "include" }
          );
          if (response.ok) {
            const data = await response.json();
            setAttendanceData(data);
            setSummaryData(null);
            setModifications({});
          } else {
            throw new Error("Failed to load attendance");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attendance");
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, [selectedClass, selectedDate]);

  const toggleStatus = (pupilId: string) => {
    const current = modifications[pupilId] || attendanceData?.pupils.find((p) => p.pupilId === pupilId)?.status;
    const statusOrder: Array<"PRESENT" | "ABSENT" | "LATE"> = ["PRESENT", "ABSENT", "LATE"];
    const currentIndex = statusOrder.indexOf(current || "PRESENT");
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    setModifications({ ...modifications, [pupilId]: nextStatus });
  };

  const handleSaveAttendance = async () => {
    if (!attendanceData || selectedClass === "ALL") return;

    setSaving(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();

      const attendanceArray = attendanceData.pupils.map((pupil) => ({
        pupilId: pupil.pupilId,
        status: modifications[pupil.pupilId] || pupil.status,
      }));

      const response = await fetch(`${backendUrl}/api/admin/attendance/mark`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          attendance: attendanceArray,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save attendance");
      }

      setSuccess(true);
      setModifications({});

      const refreshResponse = await fetch(
        `${backendUrl}/api/admin/attendance/data?classId=${selectedClass}&date=${selectedDate}`,
        { credentials: "include" }
      );
      if (refreshResponse.ok) {
        setAttendanceData(await refreshResponse.json());
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleSendNotifications = async () => {
    if (!attendanceData || selectedClass === "ALL") return;

    setNotifying(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/attendance/notify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          notificationType: notificationMode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notifications");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notifications");
    } finally {
      setNotifying(false);
    }
  };

  const stats = useMemo(() => {
    if (selectedClass === "ALL") {
      return {
        present: summaryData?.summary.presentCount || 0,
        absent: summaryData?.summary.absentCount || 0,
        late: summaryData?.summary.lateCount || 0,
        total: summaryData?.summary.totalRecords || 0,
      };
    }
    if (!attendanceData) return { present: 0, absent: 0, late: 0, total: 0 };
    return {
      present: attendanceData.presentCount,
      absent: attendanceData.absentCount,
      late: attendanceData.lateCount,
      total: attendanceData.totalPupils,
    };
  }, [attendanceData, summaryData, selectedClass]);

  const hasModifications = Object.keys(modifications).length > 0;

  const exportCSV = () => {
    const escapeCell = (value: string | number | null | undefined) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    let rows: string[][] = [];

    if (selectedClass === "ALL" && summaryData) {
      rows = [
        ["Date", "Class", "Student", "Status"],
        ...summaryData.records.map((record) => [
          record.date,
          record.class.name,
          `${record.pupil.firstName} ${record.pupil.lastName}`,
          record.status,
        ]),
        ["", "", "", ""],
        ["Summary", "Count", "", ""],
        ["Present", String(summaryData.summary.presentCount), "", ""],
        ["Absent", String(summaryData.summary.absentCount), "", ""],
        ["Late", String(summaryData.summary.lateCount), "", ""],
        ["Total Records", String(summaryData.summary.totalRecords), "", ""],
      ];
    } else if (attendanceData) {
      rows = [
        ["Student", "Status"],
        ...attendanceData.pupils.map((pupil) => [pupil.name, pupil.status]),
        ["", "", ""],
        ["Present", String(attendanceData.presentCount), ""],
        ["Absent", String(attendanceData.absentCount), ""],
        ["Late", String(attendanceData.lateCount), ""],
        ["Total", String(attendanceData.totalPupils), ""],
      ];
    }

    if (rows.length === 0) return;

    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = selectedClass === "ALL" ? `attendance-summary-${selectedDate}.csv` : `attendance-${selectedClass}-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} />;
  }

  if (classesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-8 w-8 text-brand" />
          Attendance Management
        </h1>
        <p className="mt-1 text-muted">Track and manage student attendance by class and date</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => router.push("/admin/attendance/summary")} variant="secondary" className="gap-2">
          <BarChart2 className="h-4 w-4" />
          View Summary
        </Button>
        <Button onClick={exportCSV} variant="secondary" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
          ✓ Operation completed successfully
        </div>
      )}

      {/* Phase Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <label className="text-sm font-medium text-muted">Phase:</label>
          <button
            onClick={() => setSelectedPhase("ALL")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              selectedPhase === "ALL"
                ? "bg-brand text-white"
                : "bg-background text-muted hover:bg-surface"
            }`}
          >
            All Phases
          </button>
          {PHASE_ORDER.map((phase) => (
            <button
              key={phase}
              onClick={() => {
                setSelectedPhase(phase);
                const nextClass = allClasses.find((cls) => cls.phase === phase);
                if (nextClass) {
                  setSelectedClass(nextClass.id);
                }
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedPhase === phase
                  ? "bg-brand text-white"
                  : "bg-background text-muted hover:bg-surface"
              }`}
            >
              {PHASE_LABELS[phase]}
            </button>
          ))}
        </div>
      </div>

      {/* Class & Date Selector */}
      {classesLoading ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted">Loading classes...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  const selected = allClasses.find((c) => c.id === e.target.value);
                  if (selected) setSelectedPhase(selected.phase);
                  if (e.target.value === "ALL") setSelectedPhase("ALL");
                }}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="ALL">All Classes</option>
                {filteredClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.arm || ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={() => window.location.reload()} variant="secondary" className="w-full">
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          {selectedClass === "ALL" && summaryData && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="border-b border-border bg-background px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">School Attendance Summary</h2>
                <p className="text-sm text-muted">Attendance records for {new Date(selectedDate).toLocaleDateString()}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Class</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summaryData.records.map((record) => {
                      const statusColor =
                        record.status === "PRESENT"
                          ? "bg-green-100 text-green-800"
                          : record.status === "ABSENT"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800";

                      return (
                        <tr key={record.id} className="hover:bg-surface/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-foreground">{record.class.name}</td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{record.pupil.firstName} {record.pupil.lastName}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedClass !== "ALL" && attendanceData && (
            <div className="hidden sm:grid grid-cols-4 gap-3">
              <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                    <Users className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted">Total Pupils</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{stats.total}</p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
                </div>
                <p className="mt-2 text-[11px] text-muted">All students</p>
              </div>

              <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                    <CheckCircle className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted">Present</p>
                    <p className="mt-1 text-lg font-bold text-green-600">{stats.present}</p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
                </div>
                <p className="mt-2 text-[11px] text-muted">{stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(0) : 0}% of class</p>
              </div>

              <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                    <AlertCircle className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted">Absent</p>
                    <p className="mt-1 text-lg font-bold text-red-600">{stats.absent}</p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
                </div>
                <p className="mt-2 text-[11px] text-muted">Not present</p>
              </div>

              <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                    <Clock className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted">Late</p>
                    <p className="mt-1 text-lg font-bold text-orange-600">{stats.late}</p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
                </div>
                <p className="mt-2 text-[11px] text-muted">Marked late</p>
              </div>
            </div>
          )}

          {/* Mobile Stats */}
          {selectedClass !== "ALL" && attendanceData && (
            <div className="sm:hidden space-y-3">
              <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                    <Users className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted">Total Pupils</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                    <CheckCircle className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted">Present</p>
                    <p className="mt-1 text-lg font-bold text-green-600">{stats.present}</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                    <AlertCircle className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted">Absent</p>
                    <p className="mt-1 text-lg font-bold text-red-600">{stats.absent}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Grid */}
          {loading ? (
            <div className="text-center py-12 text-muted">Loading attendance...</div>
          ) : selectedClass !== "ALL" && attendanceData?.pupils && attendanceData.pupils.length > 0 ? (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-background">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {attendanceData.pupils.map((pupil) => {
                        const status = modifications[pupil.pupilId] || pupil.status;
                        const isModified = pupil.pupilId in modifications;
                        const statusColor =
                          status === "PRESENT"
                            ? "bg-green-100 text-green-800"
                            : status === "ABSENT"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800";

                        return (
                          <tr
                            key={pupil.pupilId}
                            className={`hover:bg-surface/50 transition-colors ${isModified ? "ring-2 ring-brand/50" : ""}`}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-foreground">{pupil.name}</td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => toggleStatus(pupil.pupilId)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${statusColor} cursor-pointer hover:opacity-80`}
                              >
                                {status}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-col sm:flex-row">
                <Button
                  onClick={handleSaveAttendance}
                  disabled={selectedClass === "ALL" || !hasModifications || saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
                <div className="flex gap-2 flex-1">
                  <select
                    value={notificationMode}
                    onChange={(e) => setNotificationMode(e.target.value as "ALL" | "ABSENT" | "LATE")}
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                  >
                    <option value="ALL">Notify All</option>
                    <option value="ABSENT">Notify Absent Only</option>
                    <option value="LATE">Notify Late Only</option>
                  </select>
                  <Button
                    onClick={handleSendNotifications}
                    disabled={selectedClass === "ALL" || notifying}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {notifying ? "Sending..." : "Send Notifications"}
                  </Button>
                </div>
              </div>
            </>
          ) : !loading && selectedClass !== "ALL" && attendanceData ? (
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <p className="text-muted">No pupils in this class</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}