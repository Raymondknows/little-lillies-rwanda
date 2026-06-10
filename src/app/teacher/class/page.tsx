'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Users, BookOpen } from 'lucide-react';
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

export default function ClassPage() {
  const searchParams = useSearchParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!selectedClass || !selectedClass.id) return;

    async function loadStudents() {
      try {
        const backendUrl = getBackendUrl();
        const classId = selectedClass?.id;
        if (!classId) return;
        
        const res = await fetch(`${backendUrl}/api/teacher/classes/${classId}/students`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load students');
        const data = await res.json();
        setStudents(data.students);
      } catch (err: any) {
        setError(err.message);
      }
    }

    loadStudents();
  }, [selectedClass]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Class</h1>
        <p className="mt-1 text-gray-600">Manage your class and students</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Class Selection */}
      {classes.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select
            value={selectedClass?.id || ''}
            onChange={(e) => {
              const cls = classes.find((c) => c.id === e.target.value);
              setSelectedClass(cls || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Class Overview */}
      {selectedClass && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h2>
              <p className="mt-2 text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {students.length} Students
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      )}

      {/* Students List */}
      {selectedClass && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Class Roster</h3>
          </div>

          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Admission No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{student.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{student.admissionNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-600">No students in this class</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
