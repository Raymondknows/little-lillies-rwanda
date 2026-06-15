'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Clock, Save, Loader2, Users } from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';

interface Class {
  id: string;
  name: string;
  studentCount: number;
}

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  email: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter and paginate students
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter((s) => 
      s.name.toLowerCase().includes(query) ||
      (s.admissionNo || '').toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Load classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/teacher/classes`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load classes');
        const data = await res.json();
        setClasses(data.classes);
        if (data.classes.length > 0) {
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
        const backendUrl = getBackendUrl();
        const res = await fetch(
          `${backendUrl}/api/teacher/classes/${selectedClass}/students`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error('Failed to load students');
        const data = await res.json();
        setStudents(data.students);
        const initial: Record<string, AttendanceRecord> = {};
        data.students.forEach((s: Student) => {
          initial[s.id] = { studentId: s.id, status: 'PRESENT' };
        });
        setAttendance(initial);
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadStudents();
  }, [selectedClass]);

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
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
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/teacher/attendance`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          date,
          attendanceData: Object.values(attendance),
        }),
      });
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const total = students.length;
  const present = Object.values(attendance).filter((a) => a.status === 'PRESENT').length;
  const absent = Object.values(attendance).filter((a) => a.status === 'ABSENT').length;
  const late = Object.values(attendance).filter((a) => a.status === 'LATE').length;
  const excused = Object.values(attendance).filter((a) => a.status === 'EXCUSED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Register</h1>
        <p className="mt-1 text-muted">Mark and track student attendance by class and date</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="rounded-xl border border-error bg-error/10 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error</h3>
            <p className="text-sm text-error/80">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-success bg-success/10 p-4 flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-success">Success</h3>
            <p className="text-sm text-success/80">{success}</p>
          </div>
        </div>
      )}

      {/* Summary Cards - Desktop */}
      <div className="hidden sm:grid grid-cols-4 gap-3">
        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <Users className="h-4 w-4 text-brand" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Total Students</p>
              <p className="mt-1 text-lg font-bold text-foreground">{total}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">In this class</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Present</p>
              <p className="mt-1 text-lg font-bold text-foreground">{present}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">{total > 0 ? Math.round((present / total) * 100) : 0}% present</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Absent</p>
              <p className="mt-1 text-lg font-bold text-foreground">{absent}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">{total > 0 ? Math.round((absent / total) * 100) : 0}% absent</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Late</p>
              <p className="mt-1 text-lg font-bold text-foreground">{late}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">{total > 0 ? Math.round((late / total) * 100) : 0}% late</p>
        </div>
      </div>

      {/* Summary Cards - Mobile */}
      <div className="sm:hidden space-y-3">
        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <Users className="h-4 w-4 text-brand" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Total Students</p>
              <p className="mt-1 text-lg font-bold text-foreground">{total}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">In this class</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Present</p>
              <p className="mt-1 text-lg font-bold text-foreground">{present}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">{total > 0 ? Math.round((present / total) * 100) : 0}% present</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Absent</p>
              <p className="mt-1 text-lg font-bold text-foreground">{absent}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">{total > 0 ? Math.round((absent / total) * 100) : 0}% absent</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Late</p>
              <p className="mt-1 text-lg font-bold text-foreground">{late}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">{total > 0 ? Math.round((late / total) * 100) : 0}% late</p>
        </div>
      </div>

      {/* Actions & Search Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filters - Left */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2 flex-1">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Class</label>
            <select
              className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Date</label>
            <input
              type="date"
              className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Search & Save Button - Right */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2 flex-1 sm:flex-1">
          <input
            type="text"
            placeholder="Search by name or admission..."
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <button
            onClick={handleSave}
            disabled={saving || !selectedClass}
            className="rounded-lg bg-brand text-white px-4 py-2 font-semibold text-sm hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Attendance
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing {paginatedStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
          {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        <label className="text-sm text-muted whitespace-nowrap">
          Rows per page
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="ml-2 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      {/* Table */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center sm:px-6 sm:py-12">
          <Users className="h-12 w-12 text-muted/30 mx-auto mb-4" />
          <p className="text-sm text-muted">No students found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border bg-surface mb-6">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Student</th>
                  <th className="px-4 py-2 font-medium">Admission #</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="border-t border-border hover:bg-background/50 transition-colors">
                    <td className="px-4 py-2 font-medium text-foreground">{student.name}</td>
                    <td className="px-4 py-2 text-muted">{student.admissionNo || '—'}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                              attendance[student.id]?.status === status
                                ? {
                                    PRESENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                    ABSENT: 'bg-red-100 text-red-700 border-red-200',
                                    LATE: 'bg-amber-100 text-amber-700 border-amber-200',
                                    EXCUSED: 'bg-blue-100 text-blue-700 border-blue-200',
                                  }[status]
                                : 'bg-background text-muted border-border hover:border-brand/50'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2 mb-6">
            {paginatedStudents.map((student) => (
              <div
                key={student.id}
                className="rounded-lg border border-border bg-surface px-3 py-2 hover:bg-background/50 transition-colors"
              >
                <div className="mb-2">
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-muted mt-1">{student.admissionNo || '—'}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(student.id, status)}
                      className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                        attendance[student.id]?.status === status
                          ? {
                              PRESENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                              ABSENT: 'bg-red-100 text-red-700 border-red-200',
                              LATE: 'bg-amber-100 text-amber-700 border-amber-200',
                              EXCUSED: 'bg-blue-100 text-blue-700 border-blue-200',
                            }[status]
                          : 'bg-background text-muted border-border'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}