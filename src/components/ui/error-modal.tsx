"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type ModalType = "error" | "success";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
  type?: ModalType;
  action?: {
    label: string;
    onClick: () => void;
  };
  onSuccessAction?: () => void; // For success modal primary button
  confirmLabel?: string;
}

export function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
  details,
  type = "error",
  action,
  onSuccessAction,
  confirmLabel,
}: ErrorModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDetails(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSuccess = type === "success";
  const defaultTitle = isSuccess ? "Success!" : "Something went wrong";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;
  const iconBgColor = isSuccess ? "bg-brand/20" : "bg-error/20";
  const iconColor = isSuccess ? "text-brand" : "text-error";
  const headerBgColor = isSuccess ? "from-brand/10 to-brand/5" : "from-brand/10 to-brand/5";
  const buttonBgColor = isSuccess ? "bg-brand hover:bg-brand-hover" : "bg-brand hover:bg-brand-hover";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-lg">
        {/* Header */}
        <div className={`border-b border-border bg-gradient-to-r ${headerBgColor} px-6 py-4`}>
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBgColor}`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{title || defaultTitle}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-foreground">{message}</p>

          {details && (
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm font-medium text-brand hover:text-brand-hover"
              >
                {showDetails ? "Hide details" : "Show details"}
              </button>
              {showDetails && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs font-mono text-muted">{details}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-background px-6 py-4 flex gap-3">
          {action && (
            <button
              type="button"
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="flex-1 rounded-lg border border-brand bg-transparent px-4 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand-light"
            >
              {action.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (isSuccess && onSuccessAction) {
                onSuccessAction();
              }
              onClose();
            }}
            className={`flex-1 rounded-lg ${buttonBgColor} px-4 py-2.5 text-sm font-medium text-white transition-colors`}
          >
            {confirmLabel ?? (isSuccess ? "Login Now" : "Try again")}
          </button>
        </div>
      </div>
    </div>
  );
}
