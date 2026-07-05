"use client";

import { useState } from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, CheckCircle2 } from "lucide-react";

export function PublishButton({ assessmentId }: { assessmentId: string }) {
  const [pending, startTransition] = useTransition();
  const [showValidation, setShowValidation] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handlePublish = async () => {
    setShowValidation(true);
    startTransition(async () => {
      try {
        setStatus('idle');
        setMessage(null);

        const response = await fetch(`/api/admin/assessments/${assessmentId}/publish`, {
          method: 'POST',
          credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errorText = data?.error || 'Failed to publish assessment';
          setStatus('error');
          setMessage(errorText);
          return;
        }

        setStatus('success');
        setMessage('Published successfully');
        setTimeout(() => setShowValidation(false), 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to publish assessment');
      }
    });
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

      {showValidation && message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            status === 'error'
              ? 'border-destructive bg-destructive/10 text-destructive'
              : 'border-success bg-success/10 text-success'
          }`}
        >
          <div className="flex items-center gap-2">
            {status === 'error' ? (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
