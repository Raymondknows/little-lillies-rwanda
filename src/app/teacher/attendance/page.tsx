'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Clock, Save, Loader2, Users, TrendingUp } from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [attendance, setAttendance] = useState<
    Record<string, AttendanceRecord>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter and paginate students (calculate early before effects)
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter((s) => 
      s.name.toLowerCase().includes(query) ||
      s.admissionNumber.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(0, currentPage - 2);
    return i + start + 1;
  }).filter(n => n <= totalPages);

  // Ensure current page doesn't exceed total pages
  const effectiveCurrentPage = Math.min(currentPage, totalPages);

  // Load classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const backendUrl = getBackendUrl();

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

        const backendUrl = getBackendUrl();

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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
  const excused = Object.values(attendance).filter(
    (a) => a.status === 'EXCUSED'
  ).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Attendance Register
        </h1>
        <p className="text-muted mt-2">
          Track and manage student attendance efficiently
        </p>
      </div>

      {/* Error / Success Messages */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex gap-3">
          <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="hidden sm:grid grid-cols-5 gap-3">
        <StatCard label="Total" value={total} icon={<Users className="h-4 w-4 text-brand" />} />
        <StatCard label="Present" value={present} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} />
        <StatCard label="Absent" value={absent} icon={<AlertCircle className="h-4 w-4 text-red-600" />} />
        <StatCard label="Late" value={late} icon={<Clock className="h-4 w-4 text-amber-600" />} />
        <StatCard label="Excused" value={excused} icon={<TrendingUp className="h-4 w-4 text-blue-600" />} />
      </div>

      {/* Mobile Summary Stats Cards */}
      <div className="sm:hidden space-y-3">
        <StatCard label="Total" value={total} icon={<Users className="h-4 w-4 text-brand" />} />
        <StatCard label="Present" value={present} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} />
        <StatCard label="Absent" value={absent} icon={<AlertCircle className="h-4 w-4 text-red-600" />} />
        <StatCard label="Late" value={late} icon={<Clock className="h-4 w-4 text-amber-600" />} />
        <StatCard label="Excused" value={excused} icon={<TrendingUp className="h-4 w-4 text-blue-600" />} />
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm text-muted font-medium">Class</label>
            <select
              className="w-full mt-2 rounded-xl border border-border bg-background px-3 py-3 text-foreground"
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
            <label className="text-sm text-muted font-medium">Date</label>
            <input
              type="date"
              className="w-full mt-2 rounded-xl border border-border bg-background px-3 py-3 text-foreground"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-brand text-white py-3 font-medium hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name, admission number, or email..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
      />

      {/* Student List */}
      {filteredStudents.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-3xl border border-border bg-surface/60 backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-foreground">Class Register</h2>
                <p className="text-sm text-muted">
                  Showing {paginatedStudents.length} of {filteredStudents.length} students
                </p>
              </div>
              <Clock className="text-brand" />
            </div>

            <div className="divide-y divide-border">
              {paginatedStudents.map((s) => (
                <div
                  key={s.id}
                  className="px-6 py-5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="text-sm text-muted">
                      {s.admissionNumber}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap justify-end flex-shrink-0">
                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleStatusChange(s.id, status)
                          }
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition whitespace-nowrap
                            ${
                              attendance[s.id]?.status === status
                                ? 'bg-brand text-white border-brand'
                                : 'bg-background border-border hover:bg-muted/20'
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

          {/* Mobile List View */}
          <div className="sm:hidden space-y-3">
            {paginatedStudents.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-4"
              >
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted mt-1">{s.admissionNumber}</p>
                <div className="flex gap-2 flex-wrap mt-3">
                  {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleStatusChange(s.id, status)
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition
                          ${
                            attendance[s.id]?.status === status
                              ? 'bg-brand text-white border-brand'
                              : 'bg-background border-border'
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={handlePageSizeChange}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-muted">per page</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, effectiveCurrentPage - 1))}
                  disabled={effectiveCurrentPage === 1}
                  className="px-3 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/10"
                >
                  Previous
                </button>

                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                      effectiveCurrentPage === num
                        ? 'bg-brand text-white border-brand'
                        : 'border-border hover:bg-muted/10'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, effectiveCurrentPage + 1))}
                  disabled={effectiveCurrentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/10"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        selectedClass && (
          <div className="rounded-2xl border border-border bg-surface/40 p-10 text-center">
            <Users className="h-12 w-12 text-muted/30 mx-auto mb-3" />
            <p className="text-muted">No students found</p>
          </div>
        )
      )}
    </div>
  );
}

/* Stat Card Component */
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-4 flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}