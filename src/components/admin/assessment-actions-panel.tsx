'use client';

import { useState } from 'react';
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
import { ErrorModal } from '@/components/ui/error-modal';

interface AssessmentActionsProps {
  assessmentId: string;
  status: string;
  workflowState?: string;
  schoolId: string;
  isConfigured: boolean;
  onStatusChange?: (newStatus: string) => void;
}

export function AssessmentActionsPanel({
  assessmentId,
  status,
  workflowState,
  schoolId,
  isConfigured,
  onStatusChange,
}: AssessmentActionsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validationPassed, setValidationPassed] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('Reopen for corrections');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isConfirmingUnlock, setIsConfirmingUnlock] = useState(false);
  const [shouldReloadOnClose, setShouldReloadOnClose] = useState(false);

  const canLockResults = isConfigured && (status === 'VALIDATED' || validationPassed || workflowState === 'VALIDATED');
  const canUnlockResults = status === 'LOCKED' || workflowState === 'LOCKED';
  const canApproveResults = isConfigured && status === 'DRAFT' && (workflowState === 'VALIDATED' || validationPassed);
  const canPublishResults = isConfigured && status === 'APPROVED';

  const approveTitle = !isConfigured
    ? 'Locked until assessment configuration is complete'
    : status !== 'DRAFT'
    ? 'Only draft assessments can be approved'
    : !(workflowState === 'VALIDATED' || validationPassed)
    ? 'Assessment must be validated before it can be approved'
    : undefined;

  const lockTitle = !isConfigured
    ? 'Locked until assessment configuration is complete'
    : !(status === 'VALIDATED' || validationPassed || workflowState === 'VALIDATED')
    ? 'Assessment must be validated before results can be locked'
    : undefined;

  const unlockTitle = !(status === 'LOCKED' || workflowState === 'LOCKED')
    ? 'Assessment must be locked before results can be unlocked'
    : undefined;

  const publishTitle = !isConfigured
    ? 'Locked until assessment configuration is complete'
    : status !== 'APPROVED'
    ? 'Assessment must be approved before results can be published'
    : undefined;
  const handleAction = async (
    action: string,
    endpoint: string,
    body?: any,
    onError?: (errorText: string) => void
  ): Promise<boolean> => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-school-id': schoolId,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `Failed to ${action}`);
      }

      const successText =
        data?.message || `${action} completed successfully.`;

      const validationPayload = data?.validation ??
        (data && typeof data === 'object' && ('isValid' in data || 'errors' in data || 'warnings' in data || 'blockers' in data)
          ? data
          : null);

      if (validationPayload) {
        setValidationResult(validationPayload);
        setShowFeedbackModal(true);
        setShouldReloadOnClose(false);
      } else {
        setMessage({ type: 'success', text: successText });
        setShowFeedbackModal(true);
        setShouldReloadOnClose(Boolean(data.success));
      }

      if (onStatusChange && data.status) {
        onStatusChange(data.status);
      }

      if (data.workflowState) {
        setValidationPassed(data.workflowState === 'VALIDATED');
      }

      if (data.success && validationPayload) {
        setShouldReloadOnClose(false);
      }

      return true;
    } catch (err) {
      const text = err instanceof Error ? err.message : 'An error occurred';
      if (onError) {
        onError(text);
      }
      setMessage({ type: 'error', text });
      setShowFeedbackModal(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockConfirm = async () => {
    setUnlockError(null);
    const trimmed = unlockReason?.trim();
    if (!trimmed) {
      setUnlockError('Please provide a reason for reopening this assessment.');
      return false;
    }
    setIsConfirmingUnlock(true);
    try {
      const success = await handleAction(
        'Unlock Results',
        `/api/results/unlock/${assessmentId}`,
        { reason: trimmed },
        (errorText) => {
          setUnlockError(errorText);
        }
      );

      if (success) {
        setShowUnlockModal(false);
      }

      return success;
    } finally {
      setIsConfirmingUnlock(false);
    }
  };

  const validationIssues = Array.isArray(validationResult?.errors)
    ? validationResult.errors.filter((e: any) => e?.message)
    : [];

  const modalMessage = message?.text ?? (
    validationResult
      ? validationResult.isValid
        ? 'Validation passed. The assessment is ready for the next step.'
        : 'This assessment is not ready yet. Please ask teachers to complete the pending steps below before results can proceed.'
      : ''
  );

  const modalDetails = validationIssues.length > 0
    ? `${validationIssues.map((e: any) => `• ${e.message}`).join('\n')}`
    : undefined;

  const modalType = message?.type === 'success' || validationResult?.isValid ? 'success' : 'error';

  const handleModalClose = () => {
    setShowFeedbackModal(false);
    if (shouldReloadOnClose) {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <div>
          {status === 'DRAFT' && <Badge variant="outline">DRAFT - Editing Allowed</Badge>}
          {status === 'APPROVED' && <Badge variant="default">APPROVED - Ready to Publish</Badge>}
          {status === 'PUBLISHED' && <Badge variant="secondary">PUBLISHED - View Only</Badge>}
          {status === 'LOCKED' && <Badge variant="secondary">LOCKED</Badge>}
        </div>
      </div>

      {/* Modal feedback */}
      <ErrorModal
        isOpen={showFeedbackModal}
        onClose={handleModalClose}
        type={modalType}
        title={validationResult ? (validationResult.isValid ? 'Validation Passed' : 'Pending Action Required') : (message?.type === 'success' ? 'Completed Successfully' : undefined)}
        message={modalMessage}
        details={modalDetails}
        confirmLabel={validationResult && validationResult.isValid ? 'Understood' : (message?.type === 'success' ? 'Understood' : 'Review items')}
      />

      <ErrorModal
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false);
          setUnlockError(null);
        }}
        type="success"
        title="Unlock Results"
        message="Enter a reason for reopening this assessment so it is captured in the audit log."
        confirmLabel="Unlock"
        confirmDisabled={isConfirmingUnlock}
        onConfirm={handleUnlockConfirm}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Teachers will be able to edit results again after unlock. This reason is stored with the audit entry.
          </p>
          <label className="block text-sm font-medium text-foreground">
            Reason
            <textarea
              value={unlockReason}
              onChange={(event) => setUnlockReason(event.target.value)}
              className="mt-2 h-28 w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              placeholder="Enter a short audit reason"
            />
          </label>
          {unlockError && <p className="text-sm text-red-500">{unlockError}</p>}
        </div>
      </ErrorModal>

      {/* Action Buttons - All managed by backend state machine */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            handleAction(
              'Calculate Grades',
              `/api/results/calculate-grades/${assessmentId}`
            )
          }
          disabled={loading || !isConfigured}
          className="h-10 whitespace-nowrap px-4"
          title={!isConfigured ? 'Locked until assessment configuration is complete' : undefined}
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
          disabled={loading || !isConfigured}
          className="h-10 whitespace-nowrap px-4"
          title={!isConfigured ? 'Locked until assessment configuration is complete' : undefined}
        >
          <RefreshCw size={18} />
          Calculate Positions
        </Button>

        <Button
          onClick={() => handleAction('Validate', `/api/results/validate/${assessmentId}`)}
          disabled={loading || !isConfigured}
          variant="outline"
          className="h-10 whitespace-nowrap px-4"
          title={!isConfigured ? 'Locked until assessment configuration is complete' : undefined}
        >
          <AlertCircle size={18} />
          Validate
        </Button>

        <Button
          onClick={() => handleAction('Approve Results', `/api/admin/assessments/${assessmentId}/approve`)}
          disabled={loading || !canApproveResults}
          variant="default"
          className="h-10 whitespace-nowrap px-4"
          title={approveTitle}
        >
          <CheckCircle size={18} />
          Approve Results
        </Button>

        <Button
          onClick={() =>
            handleAction(
              'Lock Results',
              `/api/results/lock/${assessmentId}`
            )
          }
          disabled={loading || !canLockResults}
          variant="outline"
          className="h-10 whitespace-nowrap px-4"
          title={lockTitle}
        >
          <Lock size={18} />
          Lock Results
        </Button>

        <Button
          onClick={() => setShowUnlockModal(true)}
          disabled={loading || !canUnlockResults}
          variant="outline"
          className="h-10 whitespace-nowrap px-4"
          title={unlockTitle}
        >
          <Unlock size={18} />
          Unlock Results
        </Button>

        <Button
          onClick={() =>
            handleAction(
              'Publish Results',
              `/api/admin/assessments/${assessmentId}/publish`
            )
          }
          disabled={loading || !canPublishResults}
          className="h-10 whitespace-nowrap px-4 bg-green-600 hover:bg-green-700"
          title={publishTitle}
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
              disabled={loading || !isConfigured}
            variant="destructive"
            className="h-10 whitespace-nowrap px-4"
              title={!isConfigured ? 'Locked until assessment configuration is complete' : undefined}
          >
            <Unlock size={18} />
            Unpublish
          </Button>
        )}
      </div>
    </div>
  );
}
