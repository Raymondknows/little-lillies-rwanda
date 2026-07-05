'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, BookOpen, TrendingUp, CheckCircle, Grid3X3, List } from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';

interface Subject {
  id: string;
  name: string;
  code?: string;
}

type ViewMode = 'grid' | 'list';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const DEFAULT_ITEMS_PER_PAGE = 20;

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    async function loadSubjects() {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/teacher/subjects`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load subjects');
        const data = await res.json();
        setSubjects(data.subjects || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSubjects();
  }, []);

  // Filter subjects based on search
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    
    const query = searchQuery.toLowerCase();
    return subjects.filter((subject) => {
      const fullName = subject.name.toLowerCase();
      const code = (subject.code || '').toLowerCase();
      
      return fullName.includes(query) || code.includes(query);
    });
  }, [subjects, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: subjects.length,
    };
  }, [subjects]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / itemsPerPage));
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Subjects</h1>
        <p className="mt-1 text-muted">View and manage the subjects you teach</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      {!error && subjects.length > 0 && (
        <>
          <div className="hidden sm:grid grid-cols-3 gap-3">
            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                  <BookOpen className="h-4 w-4 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Total Subjects</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                  <CheckCircle className="h-4 w-4 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Active</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                  <TrendingUp className="h-4 w-4 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Results Available</p>
                  <p className="mt-1 text-lg font-bold text-foreground">—</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Summary Cards */}
          <div className="sm:hidden space-y-3">
            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                  <BookOpen className="h-4 w-4 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Total Subjects</p>
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
                  <p className="text-xs text-muted">Active</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                  <TrendingUp className="h-4 w-4 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted">Results Available</p>
                  <p className="mt-1 text-lg font-bold text-foreground">—</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Search, View Toggle, and Pagination Controls */}
      {!error && subjects.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="Search subjects by name or code..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === 'grid'
                    ? 'bg-brand text-white'
                    : 'bg-background text-muted hover:bg-surface border border-border'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-brand text-white'
                    : 'bg-background text-muted hover:bg-surface border border-border'
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>
          </div>

          {/* Results Info and Page Size */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
            <p className="text-muted">
              Showing {paginatedSubjects.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
              {Math.min(currentPage * itemsPerPage, filteredSubjects.length)} of {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            <label className="text-muted whitespace-nowrap">
              Items per page
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
        </>
      )}

      {/* Grid View */}
      {!error && paginatedSubjects.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {paginatedSubjects.map((subject) => (
            <div
              key={subject.id}
              className="rounded-lg border border-border bg-surface p-6 hover:shadow-md hover:border-brand/50 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
                  <BookOpen className="h-5 w-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{subject.name}</h3>
                  {subject.code && <p className="text-xs text-muted mt-1">Code: {subject.code}</p>}
                </div>
              </div>
              <Link
                href="/teacher/results"
                className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand/90 transition-colors w-full"
              >
                View Results
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* List View - Desktop Table */}
      {!error && paginatedSubjects.length > 0 && viewMode === 'list' && (
        <div className="hidden sm:block overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubjects.map((subject) => (
                <tr key={subject.id} className="border-t border-border hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{subject.name}</td>
                  <td className="px-4 py-3 text-muted text-sm">{subject.code || '—'}</td>
                  <td className="px-4 py-3">
                    <Link
                      href="/teacher/results"
                      className="inline-flex items-center justify-center rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-brand transition hover:bg-brand/5"
                    >
                      Results
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* List View - Mobile Cards */}
      {!error && paginatedSubjects.length > 0 && viewMode === 'list' && (
        <div className="sm:hidden space-y-2">
          {paginatedSubjects.map((subject) => (
            <div
              key={subject.id}
              className="rounded-lg border border-border bg-surface px-3 py-3 hover:bg-background/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground">{subject.name}</p>
                  {subject.code && <p className="text-xs text-muted mt-1">Code: {subject.code}</p>}
                </div>
              </div>
              <Link
                href="/teacher/results"
                className="inline-flex items-center justify-center rounded-full border border-border bg-white px-2.5 py-1 text-xs font-semibold text-brand transition hover:bg-brand/5"
              >
                Results
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!error && subjects.length > 0 && totalPages > 1 && (
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

      {/* Empty State */}
      {!error && subjects.length === 0 && (
        <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center sm:px-6">
          <BookOpen className="h-12 w-12 text-muted/40 mx-auto mb-3" />
          <p className="text-muted">No subjects assigned to you</p>
        </div>
      )}
    </div>
  );
}
