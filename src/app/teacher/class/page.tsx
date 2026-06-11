'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Users, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';

interface Class {
  id: string;
  name: string;
  arm?: string;
  phase?: string;
  studentCount: number;
}

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  email: string;
  status?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const DEFAULT_ITEMS_PER_PAGE = 20;

export default function ClassPage() {
  const searchParams = useSearchParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination and filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

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

        // Auto-select first class or from URL param
        const classId = searchParams.get('id');
        if (classId) {
          const cls = data.classes.find((c: Class) => c.id === classId);
          if (cls) setSelectedClass(cls);
        } else if (data.classes.length > 0) {
          setSelectedClass(data.classes[0]);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadClasses();
  }, [searchParams]);

  // Load students when class changes
  useEffect(() => {
    if (!selectedClass || !selectedClass.id) {
      setStudents([]);
      return;
    }

    async function loadStudents() {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/teacher/classes/${selectedClass!.id}/students`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load students');
        const data = await res.json();
        setStudents(data.students || []);
        setCurrentPage(1);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setStudents([]);
      }
    }

    loadStudents();
  }, [selectedClass]);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    
    const query = searchQuery.toLowerCase();
    return students.filter((student) => {
      const fullName = student.name.toLowerCase();
      const admNo = (student.admissionNumber || '').toLowerCase();
      const emailStr = (student.email || '').toLowerCase();
      
      return fullName.includes(query) || admNo.includes(query) || emailStr.includes(query);
    });
  }, [students, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: students.length,
      active: students.filter(s => s.status === 'ACTIVE' || !s.status).length,
      inactive: students.filter(s => s.status === 'INACTIVE').length,
    };
  }, [students]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Class</h1>
        <p className="mt-1 text-muted">View class overview and manage students</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Class Selection */}
      {classes.length > 1 && (
        <div className="bg-surface rounded-lg border border-border p-6">
          <label className="block text-sm font-medium text-foreground mb-3">Select Class</label>
          <select
            value={selectedClass?.id || ''}
            onChange={(e) => {
              const cls = classes.find((c) => c.id === e.target.value);
              setSelectedClass(cls || null);
            }}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
                {cls.arm ? ` - ${cls.arm}` : ''}
                {cls.studentCount ? ` (${cls.studentCount})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Class Overview Card */}
      {selectedClass && (
        <div className="rounded-lg border border-border bg-gradient-to-br from-brand/5 to-brand/2 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{selectedClass.name}</h2>
              {selectedClass.arm && <p className="text-sm text-muted mt-1">Arm: {selectedClass.arm}</p>}
              {selectedClass.phase && <p className="text-sm text-muted">Phase: {selectedClass.phase}</p>}
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
              <BookOpen className="h-6 w-6 text-brand" />
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {selectedClass && (
        <div className="hidden sm:grid grid-cols-3 gap-3">
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <Users className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total Students</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted">In this class</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <CheckCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Active</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.active}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted">Enrolled students</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <TrendingUp className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Inactive</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.inactive}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted">Withdrawn or on leave</p>
          </div>
        </div>
      )}

      {/* Search and Controls */}
      {selectedClass && students.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="Search by name, admission number, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Results Info */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
            <p className="text-muted">
              Showing {paginatedStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
              {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            <label className="text-muted whitespace-nowrap">
              Rows per page
              <select
                value={itemsPerPage}
                onChange={handlePageSizeChange}
                className="ml-2 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Admission No.</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="border-t border-border hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
                    <td className="px-4 py-3 text-muted text-sm">{student.admissionNumber || '—'}</td>
                    <td className="px-4 py-3 text-muted text-sm">{student.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        student.status === 'INACTIVE'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {student.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="sm:hidden space-y-2">
            {paginatedStudents.map((student) => (
              <div
                key={student.id}
                className="rounded-lg border border-border bg-surface px-3 py-3 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-medium text-sm text-foreground truncate">{student.name}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                    student.status === 'INACTIVE'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {student.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted">
                  <p>Admission: {student.admissionNumber || '—'}</p>
                  <p>Email: {student.email || '—'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2.5 py-1.5 text-sm font-medium rounded-lg transition ${
                        currentPage === pageNum
                          ? 'bg-brand text-white'
                          : 'border border-border text-foreground hover:bg-background'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty States */}
      {selectedClass && students.length === 0 && (
        <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center sm:px-6">
          <Users className="h-12 w-12 text-muted/40 mx-auto mb-3" />
          <p className="text-muted">No students in this class</p>
        </div>
      )}

      {!selectedClass && (
        <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center sm:px-6">
          <Users className="h-12 w-12 text-muted/40 mx-auto mb-3" />
          <p className="text-muted">Select a class to view student roster</p>
        </div>
      )}

      {selectedClass && filteredStudents.length === 0 && searchQuery && (
        <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center sm:px-6">
          <p className="text-muted">No students found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
