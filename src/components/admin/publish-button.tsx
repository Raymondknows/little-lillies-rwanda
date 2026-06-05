"use client";

import { useState } from "react";
import { useTransition } from "react";
import { publishAssessment } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export function PublishButton({ assessmentId }: { assessmentId: string }) {
  const [pending, startTransition] = useTransition();
  const [showValidation, setShowValidation] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handlePublish = async () => {
    setShowValidation(true);
    startTransition(async () => {
      const result = await publishAssessment(assessmentId);
      setValidationResult(result);
      
      // If successful, close the validation display after 2 seconds
      if (result.success) {
        setTimeout(() => setShowValidation(false), 2000);
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        disabled={pending || validationResult?.success}
        onClick={handlePublish}
        variant={validationResult?.error ? "destructive" : "default"}
      >
        <Bell className="mr-2 h-4 w-4" />
        {pending ? "Validating…" : validationResult?.success ? "Published!" : "Publish to parents"}
      </Button>

      {showValidation && validationResult && (
        <div className={`rounded-lg border p-3 text-sm ${
          validationResult.error
            ? "border-destructive bg-destructive/10"
            : "border-success bg-success/10"
        }`}>
          {validationResult.error ? (
            <>
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">{validationResult.error}</p>
                  {validationResult.summary && (
                    <p className="text-xs text-destructive/70 mt-1">
                      {validationResult.summary.completedStudents}/{validationResult.summary.totalStudents} students complete • {validationResult.summary.issueCount} issues
                    </p>
                  )}
                </div>
              </div>
              
              {validationResult.issues && validationResult.issues.length > 0 && (
                <div className="space-y-1">
                  <button
                    onClick={() => setShowValidation(!showValidation)}
                    className="flex items-center gap-1 text-xs text-destructive/80 hover:text-destructive font-medium"
                  >
                    {showValidation ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    View {validationResult.issues.length} issues
                  </button>
                  
                  {showValidation && (
                    <ul className="space-y-1 mt-2 ml-4 list-disc list-inside text-destructive/70 text-xs">
                      {validationResult.issues.slice(0, 10).map((issue: string, i: number) => (
                        <li key={i}>{issue}</li>
                      ))}
                      {validationResult.issues.length > 10 && (
                        <li className="text-destructive font-medium">
                          +{validationResult.issues.length - 10} more issues
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </>
          ) : validationResult.success ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              <span className="text-success font-medium">Published successfully!</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
