'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FileText,
  ClipboardList,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { getTeacherDashboard, type TeacherDashboardData, detectSchoolPhase } from '@/lib/teacher-utils';

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const dashboardData = await getTeacherDashboard();
        setData(dashboardData);
      } catch (err: any) {
        console.error('Error loading teacher dashboard:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ borderColor: '#0A66C2', borderBottomColor: '#0A66C2', borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: '2px' }}></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const schoolPhase = detectSchoolPhase(data.school);
  const pendingAssessmentCount = 0; // Can be enhanced with assessment status
  const pendingAttendanceCount = data.classes.length;
  const announcementCount = 0; // Can be fetched from backend

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">Teacher workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">{data.teacher.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Your teaching workspace is scoped to assigned classes, subjects, and the tasks you need to finish today.
            </p>
          </div>
          <Link
            href="/teacher/results"
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition w-full sm:w-auto"
          >
            View Results
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 shadow-sm ring-1 ring-gray-200">
                <FileText className="h-5 w-5" style={{ color: '#0A66C2' }} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">Pending result entries</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{pendingAssessmentCount}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 shadow-sm ring-1 ring-gray-200">
                <ClipboardList className="h-5 w-5" style={{ color: '#0A66C2' }} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">Attendance registers today</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{pendingAttendanceCount}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 shadow-sm ring-1 ring-gray-200">
                <Bell className="h-5 w-5" style={{ color: '#0A66C2' }} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">Current announcements</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{announcementCount}</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/teacher/attendance"
            className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#0A66C220' }}>
                <ClipboardList className="h-5 w-5" style={{ color: '#0A66C2' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Mark Attendance</p>
              </div>
            </div>
          </Link>

          <Link
            href="/teacher/class"
            className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">View Classes</p>
              </div>
            </div>
          </Link>

          <Link
            href="/teacher/assessments"
            className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Assessments</p>
              </div>
            </div>
          </Link>

          <Link
            href="/teacher/profile"
            className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Profile</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Your Classes Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your Classes</h2>
          <p className="mt-2 text-sm text-gray-600">Manage and view your assigned classes.</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {/* Desktop Table */}
          <table className="hidden sm:table w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Class</th>
                <th className="px-6 py-3 font-medium">Phase</th>
                <th className="px-6 py-3 font-medium">Students</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.classes.map((cls) => (
                <tr key={cls.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{cls.name}</td>
                  <td className="px-6 py-4 text-gray-600">{cls.phase}</td>
                  <td className="px-6 py-4 text-gray-600">{cls.studentCount}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/teacher/class?id=${cls.id}`}
                      className="text-white px-4 py-2 text-xs font-medium rounded-lg transition inline-block" style={{ backgroundColor: '#0A66C2' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#084C99'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0A66C2'}
                    >
                      View Class
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card */}
          <div className="sm:hidden divide-y divide-gray-200">
            {data.classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/teacher/class?id=${cls.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{cls.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {cls.phase} • {cls.studentCount} students
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right ml-2">
                    <p className="text-xs font-medium" style={{ color: '#0A66C2' }}>View</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data.classes.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-600">No classes assigned yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

