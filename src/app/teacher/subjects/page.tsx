'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, BookOpen, Users } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  studentCount: number;
}

interface TeacherSubject {
  subject: Subject;
  classes: Class[];
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
        const res = await fetch(`${backendUrl}/api/teacher/dashboard`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to load data');
        const data = await res.json();

        setSubjects(data.subjects || []);
        if (data.subjects.length > 0) {
          setSelectedSubject(data.subjects[0]);
        }

        // Group classes by subject
        const grouped = data.subjects.map((subj: Subject) => ({
          subject: subj,
          classes: data.classes || [],
        }));

        setTeacherSubjects(grouped);
      } catch (err: any) {
        setError(err.message);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
        <p className="mt-1 text-gray-600">Manage your assigned subjects and classes</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => setSelectedSubject(subject)}
              className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                selectedSubject?.id === subject.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{subject.name}</p>
                </div>
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No subjects assigned yet</p>
        </div>
      )}

      {/* Selected Subject Details */}
      {selectedSubject && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Classes for {selectedSubject.name}</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {teacherSubjects
              .find((ts) => ts.subject.id === selectedSubject.id)
              ?.classes.map((cls) => (
                <div key={cls.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{cls.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4" />
                        {cls.studentCount} students
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-600">No classes found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
