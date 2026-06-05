"use client";

import { useState } from "react";
import { useTransition } from "react";
import { returnAssessmentToDraftForm } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";

export function ReturnToDraftButton({ assessmentId }: { assessmentId: string }) {
  const [pending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for returning to draft");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("assessmentId", assessmentId);
        formData.append("reason", reason);
        await returnAssessmentToDraftForm(formData);
        setResult({ success: true });
        setTimeout(() => {
          setShowDialog(false);
          setReason("");
          setResult(null);
        }, 1500);
      } catch (err: any) {
        setResult({ error: err.message || "Failed to return to draft" });
      }
    });
  };

  return (
    <>
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => setShowDialog(true)}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        {pending ? "Returning…" : "Return to Draft"}
      </Button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg border border-border bg-surface p-6 shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Return to Draft</h3>

            {result?.error ? (
              <div className="flex items-start gap-2 mb-4 p-3 rounded-lg border border-destructive bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{result.error}</p>
              </div>
            ) : result?.success ? (
              <div className="flex items-start gap-2 mb-4 p-3 rounded-lg border border-success bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success">Returned to draft successfully!</p>
              </div>
            ) : null}

            {!result?.success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium mb-2">
                    Reason for returning to draft
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Corrections needed in Mathematics scores"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    rows={3}
                    disabled={pending}
                  />
                  <p className="text-xs text-muted mt-1">
                    This will notify teachers and create an audit trail
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDialog(false);
                      setReason("");
                      setResult(null);
                    }}
                    disabled={pending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    type="submit"
                    disabled={pending || !reason.trim()}
                  >
                    {pending ? "Returning…" : "Return to Draft"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
