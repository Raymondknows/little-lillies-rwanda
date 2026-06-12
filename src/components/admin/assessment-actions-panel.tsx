'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle,
  Calculator,
  Lock,
  Unlock,
  Send,
  Download,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface AssessmentActionsProps {
  assessmentId: string;
  status: string;
  schoolId: string;
  onStatusChange?: (newStatus: string) => void;
}

export function AssessmentActionsPanel({
  assessmentId,
  status,
  schoolId,
  onStatusChange,
}: AssessmentActionsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleAction = async (action: string, endpoint: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-school-id': schoolId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || `Failed to ${action}`);
      }

      const data = await response.json();
      setMessage({ type: 'success', text: `${action} completed successfully` });

      if (data.validation) {
        setValidationResult(data.validation);
      }

      if (onStatusChange && data.status) {
        onStatusChange(data.status);
      }

      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div>
          {status === 'DRAFT' && <Badge variant="outline">DRAFT - Editing Allowed</Badge>}
          {status === 'APPROVED' && <Badge variant="default">APPROVED - Ready to Publish</Badge>}
          {status === 'PUBLISHED' && <Badge variant="secondary">PUBLISHED - View Only</Badge>}
          {status === 'LOCKED' && <Badge variant="secondary">LOCKED</Badge>}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Validation Results */}
      {showValidation && validationResult && (
        <div className="space-y-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="font-semibold text-yellow-900">Validation Results</h3>
          {validationResult.isValid ? (
            <p className="flex items-center gap-2 text-green-700">
              <CheckCircle size={18} />
              All validations passed!
            </p>
          ) : (
            <ul className="space-y-2">
              {validationResult.errors?.map((error: any, idx: number) => (
                <li key={idx} className="flex gap-2 text-sm text-yellow-900">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>
                    {error.field}: {error.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Action Buttons - All managed by backend state machine */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Button
          onClick={() =>
            handleAction(
              'Calculate Grades',
              `/api/results/calculate-grades/${assessmentId}`
            )
          }
          disabled={loading}
          className="gap-2"
        >
          <Calculator size={18} />
          Calculate Grades
        </Button>

        <Button
          onClick={() =>
            handleAction(
              'Calculate Positions',
              `/api/results/calculate-positions/${assessmentId}`
            )
          }
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw size={18} />
          Calculate Positions
        </Button>

        <Button
          onClick={async () => {
            setLoading(true);
            try {
              const response = await fetch(`/api/results/validate/${assessmentId}`, {
                method: 'POST',
                headers: { 'x-school-id': schoolId },
              });
              const data = await response.json();
              setValidationResult(data);
              setShowValidation(true);
            } catch (error) {
              setMessage({
                type: 'error',
                text: 'Failed to validate',
              });
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <AlertCircle size={18} />
          Validate
        </Button>

        <Button
          onClick={() =>
            handleAction(
              'Lock Results',
              `/api/results/lock/${assessmentId}`
            )
          }
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <Lock size={18} />
          Lock Results
        </Button>

        <Button
          onClick={() =>
            handleAction(
              'Unlock Results',
              `/api/results/unlock/${assessmentId}`
            )
          }
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <Unlock size={18} />
          Unlock Results
        </Button>

        <Button
          onClick={() =>
            handleAction(
              'Publish Results',
              `/api/results/publish/${assessmentId}`
            )
          }
          disabled={loading}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <Send size={18} />
          Publish Results
        </Button>

        {/* Unpublish */}
        {status === 'PUBLISHED' && (
          <Button
            onClick={() =>
              handleAction(
                'Unpublish Results',
                `/api/results/unpublish/${assessmentId}`
              )
            }
            disabled={loading}
            variant="destructive"
            className="gap-2"
          >
            <Unlock size={18} />
            Unpublish
          </Button>
        )}
      </div>
    </div>
  );
}
