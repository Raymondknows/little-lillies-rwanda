"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GraduationCap, ChevronRight, AlertCircle, Download, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";

interface Result {
  subject: string;
  caScore?: number;
  testScore?: number;
  examScore?: number;
  totalScore?: number;
  grade?: string;
  position?: number;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
}

export default function ParentResultsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('latest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch results when child changes
  useEffect(() => {
    if (!selectedChildId) return;

    async function fetchResults() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(
          `${backendUrl}/api/parent/results?childId=${selectedChildId}&termId=${selectedTerm}`,
          {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="rounded-lg border border-error bg-error/10 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error</h3>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div>
        <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-sm">
          <GraduationCap className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No children linked to this account</p>
        </div>
      </div>
    );
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Academic Results</h1>
        <p className="mt-1 text-muted">View your child's grades and performance</p>
      </div>

      {/* Child & Term Selector */}
      {children.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6 mb-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <GraduationCap className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="font-semibold text-foreground">Results Filter</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Select Child:
              </label>
              <div className="flex flex-wrap gap-2">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedChild?.id === child.id
                        ? "bg-brand text-white shadow-sm"
                        : "bg-background text-foreground border border-border hover:border-brand/50"
                    }`}
                  >
                    {child.firstName} {child.lastName}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Select Term:
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="latest">Latest Term</option>
                <option value="q1">Q1</option>
                <option value="q2">Q2</option>
                <option value="q3">Q3</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedChild && (
        <>
          {/* Results Table */}
          {results.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-sm">
              <GraduationCap className="h-12 w-12 text-muted mx-auto mb-3" />
              <p className="text-muted">No results available yet for this term</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 p-6 border-b border-border bg-background">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="font-semibold text-foreground">Results for {selectedChild?.firstName} {selectedChild?.lastName}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background">
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Subject</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">CA</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">Test</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">Exam</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">Total</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">Grade</th>
                      <th className="px-6 py-3 text-center font-semibold text-foreground">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-background/50 transition">
                        <td className="px-6 py-3 font-medium text-foreground">{result.subject}</td>
                        <td className="px-6 py-3 text-center text-foreground">{result.caScore || '-'}</td>
                        <td className="px-6 py-3 text-center text-foreground">{result.testScore || '-'}</td>
                        <td className="px-6 py-3 text-center text-foreground">{result.examScore || '-'}</td>
                        <td className="px-6 py-3 text-center font-bold text-brand">
                          {result.totalScore || '-'}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-foreground">{result.grade || '-'}</td>
                        <td className="px-6 py-3 text-center text-foreground">{result.position || '-'}</td>
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
