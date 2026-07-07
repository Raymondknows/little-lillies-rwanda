"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

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
  const [showDetails, setShowDetails] = useState(Boolean(details));
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateState, setAnimateState] = useState<"enter" | "exit">("enter");

  const ANIMATION_MS = 320;

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setAnimateState("enter");
      setShowDetails(Boolean(details));
      playOpenTone();
    } else if (shouldRender) {
      setAnimateState("exit");
      playCloseTone();
      const t = setTimeout(() => setShouldRender(false), ANIMATION_MS);
      return () => clearTimeout(t);
    }

    if (!isOpen) {
      setShowDetails(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !shouldRender) return;

    return () => {
      // No automatic dismissal; the modal remains visible until the user explicitly closes it.
    };
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const isSuccess = type === "success";
  const defaultTitle = isSuccess ? "All set" : "Something went wrong";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;
  const BRAND = "#0A66C2";
  const BRAND_DARK = "#084B8A";
  const ICON_BG = "rgba(10,102,194,0.12)";
  const HEADER_BG = "linear-gradient(90deg, rgba(10,102,194,0.12), rgba(10,102,194,0.04))";
  const BUTTON_BG = BRAND;
  const BUTTON_HOVER = BRAND_DARK;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <style>{`
        @keyframes sb_modal_enter { from { transform: translateX(36px) scale(.98); opacity: 0 } to { transform: translateX(0) scale(1); opacity: 1 } }
        @keyframes sb_modal_exit  { from { transform: translateX(0) scale(1); opacity: 1 } to { transform: translateX(36px) scale(.98); opacity: 0 } }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(10,102,194,0.16)]"
        style={{
          animation: `${animateState === "enter" ? "sb_modal_enter" : "sb_modal_exit"} ${ANIMATION_MS}ms cubic-bezier(.2,.9,.2,1)`,
        }}
      >
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-5" style={{ background: HEADER_BG }}>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/70 shadow-sm" style={{ background: isSuccess ? "rgba(16,185,129,0.12)" : ICON_BG }}>
              {isSuccess ? (
                <Sparkles className="h-6 w-6" style={{ color: BRAND }} />
              ) : (
                <Icon className="h-6 w-6" style={{ color: BRAND }} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{title || defaultTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {isSuccess ? "Your request was completed successfully." : "Please review the details below."}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-700">{message}</p>

          {details && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: BRAND }}>
                  {isSuccess ? "Next steps" : "What teachers should do"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs font-medium"
                  style={{ color: BRAND }}
                >
                  {showDetails ? "Hide" : "Show"}
                </button>
              </div>
              {showDetails && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="whitespace-pre-line text-sm text-slate-700">{details}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          {action && (
            <button
              type="button"
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100"
              style={{ borderColor: BUTTON_BG, color: BUTTON_BG }}
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
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: BUTTON_BG }}
          >
            {confirmLabel ?? (isSuccess ? "Understood" : "Try again")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Play short open/close tones using Web Audio API to avoid external assets
function playOpenTone() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    const playTone = (freq: number, duration: number, gain: number, delay = 0) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);
      gainNode.gain.setValueAtTime(0.0001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };

    playTone(880, 0.16, 0.05, 0);
    playTone(1174, 0.16, 0.05, 0.08);

    setTimeout(() => ctx.close(), 700);
  } catch (e) {
    // ignore
  }
}

function playCloseTone() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 420;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.045, now + 0.01);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    o.stop(now + 0.24);
    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    // ignore
  }
}
