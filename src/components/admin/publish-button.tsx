"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorModal } from "@/components/ui/error-modal";
import { Bell, AlertCircle, CheckCircle2 } from "lucide-react";

export function PublishButton({ assessmentId }: { assessmentId: string }) {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalType, setModalType] = useState<'success' | 'error'>('error');
  const [modalDetails, setModalDetails] = useState<string | undefined>(undefined);

  const handlePublish = async () => {
    setPending(true);
    try {
      setStatus('idle');
      setMessage(null);
      setModalOpen(false);

      const response = await fetch(`/api/admin/assessments/${assessmentId}/publish`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorText = data?.details?.reason || data?.error || 'Failed to publish assessment';
        setStatus('error');
        setMessage(errorText);
        setModalType('error');
        setModalTitle('Publish Failed');
        setModalDetails(data?.details?.reason || undefined);
        setModalOpen(true);
        return;
      }

      setStatus('success');
      setMessage('Published successfully');
      setModalType('success');
      setModalTitle('Published');
      setModalDetails(undefined);
      setModalOpen(true);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to publish assessment';
      setStatus('error');
      setMessage(errorText);
      setModalType('error');
      setModalTitle('Publish Failed');
      setModalDetails(undefined);
      setModalOpen(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        disabled={pending || status === 'success'}
        onClick={handlePublish}
        variant={status === 'error' ? 'destructive' : 'default'}
      >
        <Bell className="mr-2 h-4 w-4" />
        {pending ? 'Publishing…' : status === 'success' ? 'Published!' : 'Publish to parents'}
      </Button>

      <ErrorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={message || ''}
        details={modalDetails}
        type={modalType}
        confirmLabel={modalType === 'success' ? 'Okay' : 'Review'}
      />
    </div>
  );
}
