"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Subject {
  id: string;
  name: string;
}

interface ClassSubjectsModalProps {
  classId: string;
  className: string;
  classArm?: string;
  subjects: Subject[];
}

export function ClassSubjectsModal({
  classId,
  className,
  classArm,
  subjects,
}: ClassSubjectsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface"
      >
        View subjects
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {className}
                  {classArm ? ` ${classArm}` : ""}
                </h2>
                <p className="text-xs text-muted mt-1">
                  {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted transition hover:bg-background hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {subjects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted">No subjects assigned</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {subjects.map((subject) => (
                    <li
                      key={subject.id}
                      className="rounded-lg border border-border bg-background px-4 py-3 transition hover:bg-background/75"
                    >
                      <p className="font-medium text-foreground">{subject.name}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-3 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-surface"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
