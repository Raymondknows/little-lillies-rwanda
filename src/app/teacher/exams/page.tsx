'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ClipboardCheck, Plus, Loader2 } from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';

interface Class {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  title: string;
  date: string;
  totalMarks: number;
}

export default function ExamsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ borderColor: '#0A66C2', borderBottomColor: '#0A66C2', borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: '2px' }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
        <p className="mt-1 text-gray-600">Create and manage exams for your classes</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Select Class */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:border-transparent" style={{
            boxShadow: 'var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) #0A66C2 !important'
          }}
        >
          <option value="">Choose a class...</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Create Exam Button */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <button className="w-full px-6 py-3 text-white rounded-lg font-medium flex items-center justify-center gap-2" style={{ backgroundColor: '#0A66C2' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#084C99'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0A66C2'}>
          <Plus className="h-5 w-5" />
          Create New Exam
        </button>
      </div>

      {/* Exams List */}
      {exams.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Exams</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {exams.map((exam) => (
              <div key={exam.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{exam.title}</p>
                    <p className="text-sm text-gray-600">{exam.totalMarks} marks</p>
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(exam.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No exams yet</p>
        </div>
      )}
    </div>
  );
}
