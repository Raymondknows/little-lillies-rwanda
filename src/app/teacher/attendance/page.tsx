'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Grid3X3,
  Loader2,
  List,
  Search,
  Users,
  X,
} from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';
import { ErrorModal } from '@/components/ui/error-modal';

interface Class {
  id: string;
  name: string;
  studentCount: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  email?: string;
  status?: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

type ViewMode = 'grid' | 'list';

export default function AttendancePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveModalType, setSaveModalType] = useState<'success' | 'error'>('success');
  const [saveModalTitle, setSaveModalTitle] = useState('Attendance saved');
  const [saveModalMessage, setSaveModalMessage] = useState('');
  const [attendanceAlreadyTaken, setAttendanceAlreadyTaken] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const admissionNo = (student.admissionNo || '').toLowerCase();
      return fullName.includes(query) || admissionNo.includes(query);
    });
  }, [students, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startItem = filteredStudents.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, filteredStudents.length);
  const paginatedStudents = filteredStudents.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  useEffect(() => {
    async function loadClasses() {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/teacher/classes`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to load classes');

        const data = await res.json();
        setClasses(data.classes || []);

        if (data.classes?.length > 0) {
          setSelectedClass(data.classes[0].id);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    }

    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setAttendance({});
      return;
    }

    async function loadStudents() {
      try {
        setError(null);
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/teacher/classes/${selectedClass}/students`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to load students');

        const data = await res.json();
        setStudents(data.students || []);

        const initial: Record<string, AttendanceRecord> = {};
        (data.students || []).forEach((student: Student) => {
          initial[student.id] = { studentId: student.id, status: 'PRESENT' };
        });

        setAttendance(initial);
        setCurrentPage(1);
      } catch (err: any) {
        setError(err?.message || 'Failed to load students');
        setStudents([]);
      }
    }

    loadStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass || !date) return;

    async function checkAttendance() {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(
          `${backendUrl}/api/teacher/attendance/check?classId=${selectedClass}&date=${date}`,
          { credentials: 'include' },
        );

        if (!res.ok) throw new Error('Failed to check attendance');

        const data = await res.json();
        setAttendanceAlreadyTaken(Boolean(data.exists));
      } catch (err) {
        console.error('Error checking attendance:', err);
        setAttendanceAlreadyTaken(false);
      }
    }

    checkAttendance();
  }, [selectedClass, date]);

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

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

      setSaveModalType('success');
      setSaveModalTitle('Attendance saved');
      setSaveModalMessage('Attendance was saved successfully.');
      setSaveModalOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to save attendance');
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
  const present = Object.values(attendance).filter((entry) => entry.status === 'PRESENT').length;
  const absent = Object.values(attendance).filter((entry) => entry.status === 'ABSENT').length;
  const late = Object.values(attendance).filter((entry) => entry.status === 'LATE').length;
  const selectedClassName = classes.find((cls) => cls.id === selectedClass)?.name;
  const selectedClassInfo = classes.find((cls) => cls.id === selectedClass) || null;

  return (
    <div className="px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
        <header>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Attendance</h1>
              <p className="mt-1 text-sm text-muted">Mark and track student attendance by class and date.</p>
            </div>
          </div>
        </header>

        <section className="rounded-[24px] border border-border/70 bg-surface/80 p-4 shadow-sm sm:p-5">
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Selected Class
              </p>

              {selectedClassInfo ? (
                <>
                  <h2 className="mt-1 text-xl font-semibold text-foreground">
                    {selectedClassInfo.name}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-sm font-medium text-brand">
                      {selectedClassInfo.studentCount} students
                    </span>
                  </div>
                </>
              ) : (
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  No class selected
                </h2>
              )}
            </div>

            {classes.length > 1 && (
              <div className="w-full sm:w-64">
                <label htmlFor="class-selector" className="mb-1.5 block text-xs font-medium text-muted">
                  Class
                </label>

                <div className="relative">
                  <select
                    id="class-selector"
                    value={selectedClass}
                    onChange={(event) => {
                      setSelectedClass(event.target.value);
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none rounded-[20px] border border-border bg-background px-4 py-3 pr-10 text-sm font-medium text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                  >
                    {classes.map((teacherClass) => (
                      <option key={teacherClass.id} value={teacherClass.id}>
                        {teacherClass.name}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {(error || attendanceAlreadyTaken) && (
          <div className="space-y-3">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-800">Unable to save attendance</p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {attendanceAlreadyTaken && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-900">Attendance Already Recorded</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Attendance for {selectedClassName || 'this class'} on {new Date(date).toLocaleDateString()} has already been recorded.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <section className="rounded-[24px] border border-border/70 bg-surface/80 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Register details</h2>
              <p className="mt-1 text-sm text-muted">Select class and date before marking attendance.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/teacher/attendance/summary')}
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View summary
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Class</p>
                <div className="rounded-[20px] border border-border bg-background px-4 py-3 text-sm text-foreground">
                  {selectedClassName || 'Select a class'}
                </div>
              </div>

              <label className="block text-sm font-medium text-foreground">
                Date
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="mt-2 w-full rounded-[20px] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </label>
            </div>

            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || attendanceAlreadyTaken || !selectedClass}
                className="w-full rounded-[20px] bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save attendance'}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-4">
          <article className="rounded-[20px] border border-border/70 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Total Students</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{total}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">Students assigned to the selected class.</p>
          </article>

          <article className="rounded-[20px] border border-border/70 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Present</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{present}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">Marked present for the selected date.</p>
          </article>

          <article className="rounded-[20px] border border-border/70 bg-gradient-to-br from-red-500/10 to-red-600/5 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Absent</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{absent}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">Marked absent for the selected date.</p>
          </article>

          <article className="rounded-[20px] border border-border/70 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Late</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{late}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">Marked late for the selected date.</p>
          </article>
        </section>

        <section className="rounded-[24px] border border-border/70 bg-surface/80 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Students</h2>
              <p className="mt-1 text-sm text-muted">Search and mark attendance for each student below.</p>
            </div>
            <div className="text-sm text-muted">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search students by name or admission number..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition hover:bg-surface hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    viewMode === 'list'
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>List</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    viewMode === 'grid'
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  <span>Grid</span>
                </button>
              </div>

              <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(event) => {
                    setItemsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand/10"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {startItem}-{endItem} of {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/70 px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Users className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">No students found</p>
              <p className="mt-1 text-sm text-muted">
                {searchQuery ? `No students match "${searchQuery}".` : 'There are currently no students in this class.'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <>
                  <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border sm:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="border-b border-border bg-background">
                          <tr>
                            <th className="px-4 py-3 font-medium text-muted">Student</th>
                            <th className="px-4 py-3 font-medium text-muted">Admission #</th>
                            <th className="px-4 py-3 font-medium text-muted">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {paginatedStudents.map((student) => {
                            const studentName = `${student.firstName} ${student.lastName}`.trim() || `Student ${student.admissionNo || student.id}`;
                            return (
                              <tr key={student.id} className="bg-surface transition-colors hover:bg-background/60">
                                <td className="px-4 py-3.5 font-medium text-foreground">{studentName}</td>
                                <td className="px-4 py-3.5 text-muted">{student.admissionNo || '—'}</td>
                                <td className="px-4 py-3.5">
                                  <div className="flex flex-wrap gap-2">
                                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((status) => {
                                      const isActive = attendance[student.id]?.status === status;
                                      return (
                                        <button
                                          key={status}
                                          type="button"
                                          onClick={() => handleStatusChange(student.id, status)}
                                          disabled={attendanceAlreadyTaken}
                                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                                            isActive
                                              ? {
                                                  PRESENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                  ABSENT: 'bg-red-100 text-red-700 border-red-200',
                                                  LATE: 'bg-amber-100 text-amber-700 border-amber-200',
                                                  EXCUSED: 'bg-blue-100 text-blue-700 border-blue-200',
                                                }[status]
                                              : 'bg-background text-muted border-border hover:border-brand/50 disabled:opacity-50 disabled:cursor-not-allowed'
                                          }`}
                                        >
                                          {status}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 sm:hidden">
                    {paginatedStudents.map((student) => {
                      const studentName = `${student.firstName} ${student.lastName}`.trim() || `Student ${student.admissionNo || student.id}`;
                      return (
                        <div key={student.id} className="rounded-2xl border border-border bg-background p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-sm text-foreground">{studentName}</p>
                              <p className="mt-1 text-xs text-muted">{student.admissionNo || '—'}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((status) => {
                              const isActive = attendance[student.id]?.status === status;
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, status)}
                                  disabled={attendanceAlreadyTaken}
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                                    isActive
                                      ? {
                                          PRESENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                          ABSENT: 'bg-red-100 text-red-700 border-red-200',
                                          LATE: 'bg-amber-100 text-amber-700 border-amber-200',
                                          EXCUSED: 'bg-blue-100 text-blue-700 border-blue-200',
                                        }[status]
                                      : 'bg-background text-muted border-border disabled:opacity-50 disabled:cursor-not-allowed'
                                  }`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedStudents.map((student) => {
                    const studentName = `${student.firstName} ${student.lastName}`.trim() || `Student ${student.admissionNo || student.id}`;
                    return (
                      <div key={student.id} className="rounded-2xl border border-border bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand/5 hover:shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{studentName}</p>
                            <p className="mt-1 truncate text-xs text-muted">{student.admissionNo || '—'}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted border border-border">
                            {attendance[student.id]?.status || 'Not set'}
                          </span>
                        </div>
                        <div className="mt-4 border-t border-border pt-3">
                          <div className="flex flex-wrap gap-2">
                            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((status) => {
                              const isActive = attendance[student.id]?.status === status;
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, status)}
                                  disabled={attendanceAlreadyTaken}
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                                    isActive
                                      ? {
                                          PRESENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                          ABSENT: 'bg-red-100 text-red-700 border-red-200',
                                          LATE: 'bg-amber-100 text-amber-700 border-amber-200',
                                          EXCUSED: 'bg-blue-100 text-blue-700 border-blue-200',
                                        }[status]
                                      : 'bg-background text-muted border-border disabled:opacity-50 disabled:cursor-not-allowed'
                                  }`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted">
                    Page {safeCurrentPage} of {totalPages}
                  </p>

                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={safeCurrentPage === 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </button>

                    <div className="hidden items-center gap-1 sm:flex">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                        let pageNumber: number;

                        if (totalPages <= 5) {
                          pageNumber = index + 1;
                        } else if (safeCurrentPage <= 3) {
                          pageNumber = index + 1;
                        } else if (safeCurrentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + index;
                        } else {
                          pageNumber = safeCurrentPage - 2 + index;
                        }

                        return (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`h-9 min-w-[2.25rem] rounded-lg px-2.5 text-xs font-medium transition ${
                              safeCurrentPage === pageNumber
                                ? 'bg-brand text-white shadow-sm'
                                : 'border border-border text-foreground hover:bg-background'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
        <ErrorModal
          isOpen={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          title={saveModalTitle}
          message={saveModalMessage}
          type={saveModalType}
          confirmLabel={saveModalType === 'success' ? 'Done' : 'Review'}
        />
      </div>
    </div>
  );
}
