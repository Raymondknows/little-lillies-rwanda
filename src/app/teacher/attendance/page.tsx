'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Clock, Save, Loader2, Users, TrendingUp, Maximize2 } from 'lucide-react';
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
      s.admissionNumber.toLowerCase().includes(query)
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
        <p className="mt-2 text-muted">Mark and track student attendance efficiently</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Students"
          value={total}
          percentage={Math.round((total / total) * 100) || 0}
          icon={<Users className="h-5 w-5 text-brand" />}
        />
        <StatCard
          label="Present"
          value={present}
          percentage={total > 0 ? Math.round((present / total) * 100) : 0}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          label="Absent"
          value={absent}
          percentage={total > 0 ? Math.round((absent / total) * 100) : 0}
          icon={<AlertCircle className="h-5 w-5 text-red-600" />}
        />
        <StatCard
          label="Late"
          value={late}
          percentage={total > 0 ? Math.round((late / total) * 100) : 0}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          label="Excused"
          value={excused}
          percentage={total > 0 ? Math.round((excused / total) * 100) : 0}
          icon={<Maximize2 className="h-5 w-5 text-blue-600" />}
        />
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Class</label>
            <select
              className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
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
              className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Search</label>
            <input
              type="text"
              placeholder="Search students..."
              className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder-muted focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSave}
              disabled={saving || !selectedClass}
              className="w-full rounded-lg bg-brand text-white px-4 py-2.5 font-semibold text-sm hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
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
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-background">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-foreground">Register</h2>
              <p className="text-xs text-muted mt-1">
                {filteredStudents.length} student(s) • Page {currentPage} of {totalPages}
              </p>
            </div>
            <div className="text-xs text-muted">
              Items per page:
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 rounded border border-border bg-background px-2 py-1 text-xs"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users className="h-12 w-12 text-muted/30 mx-auto mb-4" />
            <p className="text-muted">No students found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">Admission #</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-muted">{student.admissionNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
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

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-border">
              {paginatedStudents.map((student) => (
                <div key={student.id} className="px-6 py-4 space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">{student.name}</p>
                    <p className="text-xs text-muted mt-1">{student.admissionNumber}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
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
              <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-background">
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
    </div>
  );
}

function StatCard({
  label,
  value,
  percentage,
  icon,
}: {
  label: string;
  value: number;
  percentage: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted uppercase tracking-wider font-semibold">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
          <p className="text-xs text-muted mt-1">{percentage}% rate</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
          {icon}
        </div>
      </div>
    </div>
  );
}