"use client";

import { useEffect, useState } from "react";
import { GraduationCap, AlertCircle, ChevronRight, Filter } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import Link from "next/link";

interface Result {
  id: string;
  subject: string;
  assessmentId: string;
  caScore?: number;
  testScore?: number;
  examScore?: number;
  totalScore?: number;
  grade?: string;
}

interface Term {
  id: string;
  name: string;
  sortOrder?: number;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
}

interface Assessment {
  id: string;
  name: string;
  status: string;
  term?: Term;
  createdAt?: string;
  results: Result[];
}

export default function ParentResultsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch children on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/parent/children`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error("Failed to fetch children");
        const data = await response.json();
        setChildren(data.children || []);

        // Auto-select first child
        if (data.children && data.children.length > 0) {
          setSelectedChildId(data.children[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // Fetch terms
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/parent/terms`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error("Failed to fetch terms");
        const data = await response.json();
        setTerms(data.terms || []);
      } catch (err) {
        console.error('Error fetching terms:', err);
      }
    };

    fetchTerms();
  }, []);

  // Fetch results when child or term changes
  useEffect(() => {
    if (!selectedChildId) return;

    async function fetchResults() {
      try {
        const backendUrl = getBackendUrl();
        const termParam = selectedTerm ? `&termId=${selectedTerm.id}` : '';
        const response = await fetch(
          `${backendUrl}/api/parent/results?childId=${selectedChildId}${termParam}`,
          {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setAssessments(data.assessments || []);
          if (data.term && !selectedTerm) {
            setSelectedTerm(data.term);
          }
        }
      } catch (err) {
        console.error('Error fetching results:', err);
      }
    }

    fetchResults();
  }, [selectedChildId, selectedTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
        <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600">No children linked to this account</p>
      </div>
    );
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-bold text-slate-900">Academic Results</h1>
        <p className="mt-1 text-sm text-slate-600">View your child's grades and assessment performance</p>
      </div>

      {/* Filters */}
      {children.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h2 className="font-semibold text-slate-900">Filter Results</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Child Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Select Child:
              </label>
              <div className="flex flex-wrap gap-2">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setSelectedChildId(child.id);
                      setSelectedTerm(null);
                      setResults([]);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedChild?.id === child.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-900 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {child.firstName} {child.lastName}
                  </button>
                ))}
              </div>
            </div>

            {/* Term Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Select Term:
              </label>
              <select
                value={selectedTerm?.id || ''}
                onChange={(e) => {
                  const termId = e.target.value;
                  if (termId === '') {
                    setSelectedTerm(null);
                  } else {
                    const term = terms.find(t => t.id === termId);
                    setSelectedTerm(term || null);
                  }
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Latest Term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {selectedChild && (
        <>
          {results.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
              <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">
                {selectedTerm 
                  ? `No results available for ${selectedTerm.name}`
                  : 'No results available yet'
                }
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden hover:shadow-sm transition-shadow">
              {/* Table Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50">
                <GraduationCap className="h-5 w-5 text-slate-600" />
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Results for {selectedChild.firstName} {selectedChild.lastName}
                  </h2>
                  {selectedTerm && (
                    <p className="text-xs text-slate-600 mt-1">{selectedTerm.name}</p>
                  )}
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Subject/Assessment</th>
                      <th className="px-6 py-3 text-center font-semibold text-slate-900">CA</th>
                      <th className="px-6 py-3 text-center font-semibold text-slate-900">Test</th>
                      <th className="px-6 py-3 text-center font-semibold text-slate-900">Exam</th>
                      <th className="px-6 py-3 text-center font-semibold text-slate-900">Total</th>
                      <th className="px-6 py-3 text-center font-semibold text-slate-900">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition">
                        <td className="px-6 py-3 font-medium text-slate-900">{result.subject}</td>
                        <td className="px-6 py-3 text-center text-slate-600">
                          {result.caScore !== undefined && result.caScore !== null ? result.caScore : '—'}
                        </td>
                        <td className="px-6 py-3 text-center text-slate-600">
                          {result.testScore !== undefined && result.testScore !== null ? result.testScore : '—'}
                        </td>
                        <td className="px-6 py-3 text-center text-slate-600">
                          {result.examScore !== undefined && result.examScore !== null ? result.examScore : '—'}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-blue-600">
                          {result.totalScore !== undefined && result.totalScore !== null ? result.totalScore : '—'}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-slate-900">
                          {result.grade || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
