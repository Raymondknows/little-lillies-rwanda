'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';

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
    fetchStatistics();
  }, [assessmentId]);

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
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Class Statistics</h3>
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

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-600">Total Students</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalStudents}</p>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-600">Pass Rate</p>
          <p className="text-2xl font-bold text-green-900">
            {statistics.passRate.toFixed(1)}%
          </p>
          <p className="text-xs text-green-700">
            {statistics.passCount} of {stats.totalStudents} passed
          </p>
        </div>

        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm font-medium text-purple-600">Average Score</p>
          <p className="text-2xl font-bold text-purple-900">
            {statistics.averageScore.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Score Range */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-4 font-semibold text-gray-900">Score Distribution</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Highest Score</span>
              <span className="font-semibold text-gray-900">
                {statistics.highestScore.toFixed(2)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{
                  width: `${(statistics.highestScore / 100) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average</span>
              <span className="font-semibold text-gray-900">
                {statistics.averageScore.toFixed(2)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: `${(statistics.averageScore / 100) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Median</span>
              <span className="font-semibold text-gray-900">
                {statistics.medianScore.toFixed(2)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-yellow-500"
                style={{
                  width: `${(statistics.medianScore / 100) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Lowest Score</span>
              <span className="font-semibold text-gray-900">
                {statistics.lowestScore.toFixed(2)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-red-500"
                style={{
                  width: `${(statistics.lowestScore / 100) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      {Object.keys(statistics.gradeDistribution).length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-4 font-semibold text-gray-900">Grade Distribution</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statistics.gradeDistribution)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([grade, count]) => (
                <Badge key={grade} variant="secondary" className="text-base">
                  {grade}: {count}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Standard Deviation</p>
          <p className="text-xl font-semibold text-gray-900">
            {statistics.standardDeviation.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
