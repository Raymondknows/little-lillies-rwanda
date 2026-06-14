'use client';

import { getBackendUrl } from '@/lib/backend-url';

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
        const backendUrl = getBackendUrl();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Subjects</h1>
        <p className="mt-1 text-muted">Manage your assigned subjects and classes</p>
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
                  ? 'border-brand bg-brand/5'
                  : 'border-border bg-surface hover:border-brand/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{subject.name}</p>
                </div>
                <BookOpen className="h-5 w-5 text-brand" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted/50 mx-auto mb-3" />
          <p className="text-muted">No subjects assigned yet</p>
        </div>
      )}

      {/* Selected Subject Details */}
      {selectedSubject && (
        <div className="bg-surface rounded-lg border border-border overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border bg-background">
            <h2 className="font-semibold text-foreground">Classes for {selectedSubject.name}</h2>
          </div>

          <div className="divide-y divide-border">
            {teacherSubjects
              .find((ts) => ts.subject.id === selectedSubject.id)
              ?.classes.map((cls) => (
                <div key={cls.id} className="px-6 py-4 hover:bg-background transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{cls.name}</p>
                      <p className="text-sm text-muted flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4" />
                        {cls.studentCount} students
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
              <div className="px-6 py-8 text-center">
                <p className="text-muted">No classes found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
