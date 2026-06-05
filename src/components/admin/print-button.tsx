"use client";

interface PrintButtonProps {
  label?: string;
}

export function PrintButton({ label = "Print receipt" }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-sm font-medium text-brand hover:underline"
    >
      {label}
    </button>
  );
}
