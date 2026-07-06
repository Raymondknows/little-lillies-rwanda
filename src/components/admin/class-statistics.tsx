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
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Class Statistics</h3>
          <p className="text-sm text-muted">Detailed class performance analytics</p>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Average Score</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{statistics.averageScore.toFixed(1)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Class average</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Pass Rate</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{statistics.passRate.toFixed(1)}%</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">{statistics.passCount} passed</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-800">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Total Students</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{stats.totalStudents}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Students with results</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-800">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Median Score</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{statistics.medianScore.toFixed(1)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Middle score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1.4fr)]">
        <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Score Range</p>
              <p className="text-3xl font-semibold text-foreground mt-2">
                {(statistics.highestScore - statistics.lowestScore).toFixed(1)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">High</p>
                <p className="text-lg font-semibold text-foreground mt-2">
                  {statistics.highestScore.toFixed(1)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Low</p>
                <p className="text-lg font-semibold text-foreground mt-2">
                  {statistics.lowestScore.toFixed(1)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Avg.</p>
                <p className="text-lg font-semibold text-foreground mt-2">
                  {statistics.averageScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-6 shadow-sm transition hover:border-brand/50 hover:shadow-md overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Grade Distribution</h2>
            </div>
            <div className="text-sm text-slate-600">
              Total: <span className="font-semibold text-slate-900">{stats.totalResults}</span>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(statistics.gradeDistribution)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([grade, count]) => {
                const maxGradeCount = Math.max(...Object.values(statistics.gradeDistribution), 0);
                const percentageOfMax = maxGradeCount > 0 ? (count / maxGradeCount) * 100 : 0;
                const totalPercentage = stats.totalResults > 0 ? (count / stats.totalResults) * 100 : 0;
                return (
                  <div key={grade}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900">Grade {grade}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{count} students</span>
                        <span className="text-xs text-slate-500">({totalPercentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
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
