'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Clock, Save, Loader2 } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  studentCount: number;
}

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  email: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export default function AttendancePage() {
  const searchParams = useSearchParams();

  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(
    searchParams.get('id') || ''
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [attendance, setAttendance] = useState<
    Record<string, AttendanceRecord>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          'http://localhost:3006';

        const res = await fetch(
          `${backendUrl}/api/teacher/classes`,
          {
            credentials: 'include',
          }
        );

        if (!res.ok) throw new Error('Failed to load classes');

        const data = await res.json();
        setClasses(data.classes);

        if (data.classes.length > 0 && !selectedClass) {
          setSelectedClass(data.classes[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadClasses();
  }, []);

  // Load students
  useEffect(() => {
    if (!selectedClass) return;

    async function loadStudents() {
      try {
        setError(null);

        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          'http://localhost:3006';

        const res = await fetch(
          `${backendUrl}/api/teacher/classes/${selectedClass}/students`,
          {
            credentials: 'include',
          }
        );

        if (!res.ok) throw new Error('Failed to load students');

        const data = await res.json();
        setStudents(data.students);

        const initial: Record<string, AttendanceRecord> = {};

        data.students.forEach((s: Student) => {
          initial[s.id] = {
            studentId: s.id,
            status: 'PRESENT',
          };
        });

        setAttendance(initial);
      } catch (err: any) {
        setError(err.message);
      }
    }

    loadStudents();
  }, [selectedClass]);

  const handleStatusChange = (
    studentId: string,
    status: AttendanceRecord['status']
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleSave = async () => {
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        'http://localhost:3006';

      const res = await fetch(
        `${backendUrl}/api/teacher/attendance`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: selectedClass,
            date,
            attendanceData: Object.values(attendance),
          }),
        }
      );

      if (!res.ok) throw new Error('Failed to save attendance');

      setSuccess('Attendance saved successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const total = students.length;
  const present = Object.values(attendance).filter(
    (a) => a.status === 'PRESENT'
  ).length;

  const absent = Object.values(attendance).filter(
    (a) => a.status === 'ABSENT'
  ).length;

  const late = Object.values(attendance).filter(
    (a) => a.status === 'LATE'
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Attendance Register
        </h1>

        <p className="text-muted mt-2">
          Track and manage student attendance efficiently
        </p>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex gap-3">
          <CheckCircle2 className="text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-4">
        <Stat label="Students" value={total} />
        <Stat label="Present" value={present} color="text-green-600" />
        <Stat label="Absent" value={absent} color="text-red-600" />
        <Stat label="Late" value={late} color="text-amber-600" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-6 grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm text-muted">Class</label>
          <select
            className="w-full mt-2 rounded-xl border border-border bg-background px-3 py-3"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-muted">Date</label>
          <input
            type="date"
            className="w-full mt-2 rounded-xl border border-border bg-background px-3 py-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-brand text-white py-3 font-medium hover:bg-brand-hover flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Student List */}
      {students.length > 0 ? (
        <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex justify-between">
            <div>
              <h2 className="font-semibold">Class Register</h2>
              <p className="text-sm text-muted">
                {students.length} students
              </p>
            </div>

            <Clock className="text-brand" />
          </div>

          <div className="divide-y divide-border">
            {students.map((s) => (
              <div
                key={s.id}
                className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted">
                    {s.admissionNumber}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleStatusChange(s.id, status)
                        }
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition
                          ${
                            attendance[s.id]?.status === status
                              ? 'bg-brand text-white border-brand'
                              : 'bg-background border-border hover:bg-black/5'
                          }
                        `}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        selectedClass && (
          <div className="rounded-2xl border border-border bg-surface/40 p-10 text-center">
            <p className="text-muted">No students found</p>
          </div>
        )
      )}
    </div>
  );
}

/* Small stat component */
function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color || ''}`}>
        {value}
      </p>
    </div>
  );
}