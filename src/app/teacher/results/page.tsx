'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Save, Loader2 } from 'lucide-react';

interface Class {
  id: string;
  name: string;
}

interface Assessment {
  id: string;
  title: string;
  type: string;
  totalScore: number;
}

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
}

interface Result {
  studentId: string;
  score: number;
}

export default function ResultsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [results, setResults] = useState<Record<string, Result>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
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

  // Load assessments and students when class changes
  useEffect(() => {
    if (!selectedClass) return;

    async function loadData() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';

        const [assessRes, studentsRes] = await Promise.all([
          fetch(`${backendUrl}/api/teacher/assessments/${selectedClass}`, {
            credentials: 'include',
          }),
          fetch(`${backendUrl}/api/teacher/classes/${selectedClass}/students`, {
            credentials: 'include',
          }),
        ]);

        if (!assessRes.ok || !studentsRes.ok) throw new Error('Failed to load data');

        const assessData = await assessRes.json();
        const studentData = await studentsRes.json();

        setAssessments(assessData.assessments || []);
        setStudents(studentData.students || []);
        setSelectedAssessment('');
        setResults({});
      } catch (err: any) {
        setError(err.message);
      }
    }

    loadData();
  }, [selectedClass]);

  // Load results when assessment changes
  useEffect(() => {
    if (!selectedClass || !selectedAssessment) return;

    async function loadResults() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
        const res = await fetch(`${backendUrl}/api/teacher/results/${selectedClass}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load results');
        const data = await res.json();

        // Filter results for selected assessment
        const filteredResults: Record<string, Result> = {};
        students.forEach((student) => {
          const existingResult = data.results?.find(
            (r: any) => r.studentId === student.id && r.assessmentId === selectedAssessment
          );
          filteredResults[student.id] = {
            studentId: student.id,
            score: existingResult?.score || 0,
          };
        });

        setResults(filteredResults);
      } catch (err: any) {
        setError(err.message);
      }
    }

    loadResults();
  }, [selectedAssessment, selectedClass, students]);

  const handleScoreChange = (studentId: string, score: number) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: { studentId, score },
    }));
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedAssessment) {
      setError('Please select class and assessment');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
      const scores = Object.values(results);

      const res = await fetch(`${backendUrl}/api/teacher/results`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          assessmentId: selectedAssessment,
          scores,
        }),
      });

      if (!res.ok) throw new Error('Failed to save results');
      setSuccess('Results saved successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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

  const selectedAssessmentData = assessments.find((a) => a.id === selectedAssessment);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enter Results</h1>
        <p className="mt-1 text-gray-600">Record student assessment scores</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a class...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment</label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              disabled={!selectedClass}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select an assessment...</option>
              {assessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title} ({assessment.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Entry */}
      {selectedAssessmentData && students.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              {selectedAssessmentData.title} (Max: {selectedAssessmentData.totalScore})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Student
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">
                    Score / {selectedAssessmentData.totalScore}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.admissionNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max={selectedAssessmentData.totalScore}
                        value={results[student.id]?.score || ''}
                        onChange={(e) =>
                          handleScoreChange(student.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-3 py-2 border border-gray-300 rounded text-right text-gray-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Results
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
