'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  action: string;
  changes?: Record<string, any>;
  changedBy: string;
  changedAt: string;
  resultId: string;
  pupilId: string;
}

interface AuditTrailProps {
  assessmentId: string;
}

const actionColors: Record<string, { bg: string; text: string; icon: string }> = {
  SCORE_ENTERED: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '📝' },
  SCORE_EDITED: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '✏️' },
  GRADE_CALCULATED: { bg: 'bg-green-50', text: 'text-green-700', icon: '📊' },
  POSITION_CALCULATED: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🏆' },
  LOCKED: { bg: 'bg-red-50', text: 'text-red-700', icon: '🔒' },
  UNLOCKED: { bg: 'bg-orange-50', text: 'text-orange-700', icon: '🔓' },
  PUBLISHED: { bg: 'bg-green-50', text: 'text-green-700', icon: '✅' },
  UNPUBLISHED: { bg: 'bg-gray-50', text: 'text-gray-700', icon: '↩️' },
};

export function AuditTrail({ assessmentId }: AuditTrailProps) {
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    // First, try to get schoolId from session, then localStorage
    const initializeSchoolId = async () => {
      try {
        const response = await fetch('/api/admin/session');
        if (response.ok) {
          const sessionData = await response.json();
          const sid = sessionData.session?.schoolId;
          if (sid) {
            setSchoolId(sid);
            return;
          }
        }
      } catch (err) {
        console.debug('Session fetch failed, falling back to localStorage');
      }

      // Fallback to localStorage
      const localSchoolId = localStorage.getItem('schoolId');
      if (localSchoolId) {
        setSchoolId(localSchoolId);
      }
    };

    initializeSchoolId();
  }, []);

  useEffect(() => {
    if (schoolId) {
      loadAuditTrail();
    }
  }, [assessmentId, schoolId]);

  const loadAuditTrail = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);
      setError(null);
      
      const url = `/api/results/assessment/${assessmentId}/audits`;
      console.debug(`Loading audit trail from: ${url} with schoolId: ${schoolId}`);
      
      const response = await fetch(url, {
        headers: {
          'x-school-id': schoolId,
        },
      });

      // 404 is acceptable - just means no audits exist yet
      if (response.status === 404) {
        setAudits([]);
        setError(null);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Audit trail error (${response.status}):`, errorText);
        throw new Error(
          `Failed to load audit trail (${response.status})${
            response.status === 400 ? ' - Missing school ID' : ''
          }`
        );
      }

      const data = await response.json();
      setAudits(data.audits || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error loading audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-6 w-6 animate-spin text-gray-400" />
        <p className="ml-2 text-gray-600">Loading audit trail...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">Error</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No audit trail available yet</p>
      </div>
    );
  }

  // Group audits by action type for timeline view
  const timeline = [...audits].reverse();

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <h3 className="font-semibold text-gray-900">Action Timeline</h3>
        <Badge variant="outline">{audits.length} actions</Badge>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {timeline.map((audit, index) => {
          const colors = actionColors[audit.action] || {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            icon: '📌',
          };

          return (
            <div key={audit.id} className="flex gap-4">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm ${colors.bg}`}>
                  {colors.icon}
                </div>
                {index < timeline.length - 1 && (
                  <div className="w-1 h-12 bg-gray-200 mt-2"></div>
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 rounded-lg p-4 ${colors.bg} border ${colors.bg === 'bg-gray-50' ? 'border-gray-200' : 'border-transparent'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${colors.text}`}>
                      {audit.action.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      By {audit.changedBy} on{' '}
                      {format(new Date(audit.changedAt), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                {/* Changes */}
                {audit.changes && Object.keys(audit.changes).length > 0 && (
                  <div className="mt-3 text-xs space-y-1">
                    {Object.entries(audit.changes).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-mono text-gray-500">{key}:</span>
                        <span className="font-mono text-gray-700">
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="mt-6 grid grid-cols-4 gap-4 text-center">
        {Object.entries(
          timeline.reduce(
            (acc, audit) => {
              acc[audit.action] = (acc[audit.action] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          )
        ).map(([action, count]) => (
          <div key={action} className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-600">{action.replace(/_/g, ' ')}</p>
            <p className="text-lg font-bold text-gray-900">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
