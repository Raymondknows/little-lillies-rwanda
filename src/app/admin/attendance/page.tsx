"use client";

import { getBackendUrl } from "@/lib/backend-url";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Users, CheckCircle, AlertCircle, Clock, Send, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function AttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [classes, setClasses] = useState<Array<{ id: string; name: string; arm?: string }>>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [modifications, setModifications] = useState<{ [key: string]: "PRESENT" | "ABSENT" | "LATE" }>({});
  const [notificationMode, setNotificationMode] = useState<"ALL" | "ABSENT" | "LATE">("ALL");

  // Fetch classes on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/admin/classes`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || []);
          if (data.classes?.length > 0) {
            setSelectedClass(data.classes[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      }
    }
    fetchClasses();
  }, []);

  // Fetch attendance data when class or date changes
  useEffect(() => {
    if (!selectedClass) return;

    async function fetchAttendance() {
      setLoading(true);
      setError(null);
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(
          `${backendUrl}/api/admin/attendance/data?classId=${selectedClass}&date=${selectedDate}`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setAttendanceData(data);
          setModifications({});
        } else {
          throw new Error("Failed to load attendance");
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
    if (!attendanceData) return;

    setSaving(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();

      // Build attendance array with original + modified statuses
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

      // Refresh attendance data
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
    if (!attendanceData) return;

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

      const result = await response.json();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notifications");
    } finally {
      setNotifying(false);
    }
  };

  const stats = useMemo(() => {
    if (!attendanceData) return { present: 0, absent: 0, late: 0, total: 0 };
    return {
      present: attendanceData.presentCount,
      absent: attendanceData.absentCount,
      late: attendanceData.lateCount,
      total: attendanceData.totalPupils,
    };
  }, [attendanceData]);

  const hasModifications = Object.keys(modifications).length > 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
        <p className="mt-1 text-muted">Track and manage student attendance</p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
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

      {/* Summary Stats */}
      {attendanceData && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Pupils</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Absent</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Late</p>
                <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
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

      {/* Attendance Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted">Loading attendance...</div>
      ) : attendanceData ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-surface p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">{attendanceData.className}</h2>
              <p className="text-sm text-muted">{new Date(attendanceData.date).toLocaleDateString()}</p>
            </div>

            <div className="divide-y divide-border">
              {attendanceData.pupils.map((pupil) => {
                const currentStatus = modifications[pupil.pupilId] || pupil.status;
                const isModified = modifications[pupil.pupilId] !== undefined;

                return (
                  <div
                    key={pupil.pupilId}
                    className="flex items-center justify-between p-4 hover:bg-surface/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{pupil.name}</p>
                      {pupil.guardians.length > 0 && (
                        <p className="text-xs text-muted">{pupil.guardians[0].name}</p>
                      )}
                    </div>

                    <button
                      onClick={() => toggleStatus(pupil.pupilId)}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer
                        ${
                          currentStatus === "PRESENT"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : currentStatus === "ABSENT"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        }
                        ${isModified ? "ring-2 ring-brand/50" : ""}
                      `}
                    >
                      {currentStatus}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={handleSaveAttendance}
              disabled={!hasModifications || saving}
              className="flex-1 sm:flex-initial"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>

            <div className="flex gap-2 flex-1 sm:flex-initial">
              <select
                value={notificationMode}
                onChange={(e) => setNotificationMode(e.target.value as any)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="ALL">Notify All</option>
                <option value="ABSENT">Absent Only</option>
                <option value="LATE">Late Only</option>
              </select>

              <Button
                onClick={handleSendNotifications}
                disabled={notifying}
                variant="secondary"
                className="flex-1 sm:flex-initial"
              >
                {notifying ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Notify Parents
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted">Select a class and date to view attendance</p>
        </div>
      )}
    </div>
  );
}