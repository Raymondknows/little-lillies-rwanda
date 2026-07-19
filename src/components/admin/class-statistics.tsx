'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Activity, Users, BarChart3 } from 'lucide-react';

const GRADE_COLOR_MAP: Record<string, string> = {
  A: '#0A66C2',
  B: '#0F766E',
  C: '#EAAB0C',
  D: '#EA580C',
  E: '#C2410C',
  F: '#BE123C',
};

interface ClassStatisticsProps {
  assessmentId: string;
  schoolId: string;
}

interface ClassStats {
  assessmentId: string;
  totalStudents: number;
  totalResults: number;
  statistics: {
    highestScore: number;
    lowestScore: number;
    averageScore: number;
    medianScore: number;
    standardDeviation: number;
    passCount: number;
    passRate: number;
    gradeDistribution: Record<string, number>;
  };
}

export function ClassStatistics({ assessmentId, schoolId }: ClassStatisticsProps) {
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) return;
    fetchStatistics();
  }, [assessmentId, schoolId]);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/report-cards/assessment/${assessmentId}/statistics`,
        {
          headers: { 'x-school-id': schoolId },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading statistics...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { statistics } = stats;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Class Statistics</h3>
          <p className="text-sm text-gray-600">Simple view of performance for this assessment.</p>
        </div>
        <Button
          onClick={() => {
            const response = fetch(`/api/pdf-reports/ranking/${assessmentId}`, {
              headers: { 'x-school-id': schoolId },
            });
            response.then(async (r) => {
              const blob = await r.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `class-ranking-${assessmentId}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            });
          }}
          className="gap-2 text-sm"
        >
          <Download size={16} />
          Class Ranking PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Average</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{statistics.averageScore.toFixed(1)}</p>
          <p className="mt-1 text-xs text-gray-500">Class average</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Pass Rate</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{statistics.passRate.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-gray-500">{statistics.passCount} passed</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Students</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
          <p className="mt-1 text-xs text-gray-500">Distinct pupils</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Median</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{statistics.medianScore.toFixed(1)}</p>
          <p className="mt-1 text-xs text-gray-500">Middle score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1.1fr)]">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Score Range</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{(statistics.highestScore - statistics.lowestScore).toFixed(1)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">High</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{statistics.highestScore.toFixed(1)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">Low</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{statistics.lowestScore.toFixed(1)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">Avg</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{statistics.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Grade Distribution</h2>
            <span className="text-sm text-gray-500">{stats.totalResults} entries</span>
          </div>

          <div className="space-y-3">
            {Object.entries(statistics.gradeDistribution)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([grade, count]) => {
                const maxGradeCount = Math.max(...Object.values(statistics.gradeDistribution), 0);
                const percentageOfMax = maxGradeCount > 0 ? (count / maxGradeCount) * 100 : 0;
                const totalPercentage = stats.totalResults > 0 ? (count / stats.totalResults) * 100 : 0;
                return (
                  <div key={grade}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Grade {grade}</span>
                      <span className="text-sm text-gray-500">{count} ({totalPercentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentageOfMax}%`,
                          backgroundColor: GRADE_COLOR_MAP[grade] || '#0A66C2',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
