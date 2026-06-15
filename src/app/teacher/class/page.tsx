'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Users, BookOpen, TrendingUp, CheckCircle, Grid3X3, List } from 'lucide-react';
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
  admissionNo: string;
  email: string;
  status?: string;
}

type ViewMode = 'grid' | 'list';

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
  const [viewMode, setViewMode] = useState<ViewMode>('list');

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
      const admNo = (student.admissionNo || '').toLowerCase();
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

      {/* Class Selection & Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {classes.length > 1 && (
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-medium text-muted mb-2">Select Class</label>
            <select
              value={selectedClass?.id || ''}
              onChange={(e) => {
                const cls = classes.find((c) => c.id === e.target.value);
                setSelectedClass(cls || null);
              }}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
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
        
        {selectedClass && (
          <div>
            <h2 className="text-lg font-bold text-foreground">{selectedClass.name}</h2>
            {selectedClass.arm && <p className="text-xs text-muted">{selectedClass.arm}{selectedClass.phase && ` • ${selectedClass.phase}`}</p>}
          </div>
        )}
      </div>

      {/* Summary Stats - Compact Row */}
      {selectedClass && (
        <div className="hidden sm:grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-brand/10 ring-1 ring-brand/20">
                <Users className="h-3.5 w-3.5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted">Total</p>
                <p className="text-sm font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-brand/10 ring-1 ring-brand/20">
                <CheckCircle className="h-3.5 w-3.5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted">Active</p>
                <p className="text-sm font-bold text-foreground">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-brand/10 ring-1 ring-brand/20">
                <TrendingUp className="h-3.5 w-3.5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted">Inactive</p>
                <p className="text-sm font-bold text-foreground">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Controls */}
      {selectedClass && students.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <input
              type="text"
              placeholder="Search by name, admission number, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />

            <div className="flex gap-1.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                  viewMode === 'grid'
                    ? 'bg-brand text-white'
                    : 'bg-background text-muted hover:bg-surface border border-border'
                }`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-brand text-white'
                    : 'bg-background text-muted hover:bg-surface border border-border'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
            </div>

            <label className="text-muted whitespace-nowrap text-xs">
              <span className="hidden sm:inline">Show</span>
              <select
                value={itemsPerPage}
                onChange={handlePageSizeChange}
                className="ml-1.5 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between text-xs text-muted">
            <p>
              Showing {paginatedStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
              {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-lg border border-border bg-surface p-6 hover:shadow-md hover:border-brand/50 transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
                      <Users className="h-5 w-5 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">{student.name}</h3>
                      <p className="text-xs text-muted mt-1 truncate">Admission: {student.admissionNo || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-xs text-muted">
                    <p className="truncate">Email: {student.email || '—'}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full w-full justify-center ${
                    student.status === 'INACTIVE'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {student.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* List View - Desktop Table */}
          {viewMode === 'list' && (
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
                    <td className="px-4 py-3 text-muted text-sm">{student.admissionNo || '—'}</td>
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
          )}

          {/* List View - Mobile Cards */}
          {viewMode === 'list' && (
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
                  <p>Admission: {student.admissionNo || '—'}</p>
                  <p>Email: {student.email || '—'}</p>
                </div>
              </div>
            ))}
            </div>
          )}

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
