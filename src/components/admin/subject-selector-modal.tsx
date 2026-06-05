"use client";

import { useState, useMemo } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreInputRow } from "./score-input-row";
import { pupilName } from "@/lib/format";

export interface Subject {
  id: string;
  name: string;
}

export interface StudentEntryPupil {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo?: string | null;
  photoUrl?: string | null;
  classId?: string | null;
  class?: { name: string; arm?: string | null } | null;
}

interface GradingScale {
  id: string;
  grade: string;
  minScore: number;
  maxScore: number;
}

interface StudentEntryModalProps {
  isOpen: boolean;
  pupil: StudentEntryPupil | null;
  subjects: Subject[];
  gradingScales: GradingScale[];
  selectedSubjects: string[];
  onAddSubject: (subjectId: string) => void;
  onRemoveSubject: (index: number) => void;
  onScoreUpdate: (pupilId: string, subjectId: string, ca: number | null, test: number | null, exam: number | null, comment: string) => void;
  selectedScores?: Record<string, { ca: number | null; test: number | null; exam: number | null; comment: string }>;
  onClose: () => void;
}

export function StudentEntryModal({
  isOpen,
  pupil,
  subjects,
  gradingScales,
  selectedSubjects,
  onAddSubject,
  onRemoveSubject,
  onScoreUpdate,
  selectedScores,
  onClose,
}: StudentEntryModalProps) {
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);

  if (!isOpen || !pupil) return null;

  const availableSubjects = subjects.filter(
    (s) => !selectedSubjects.includes(s.id)
  );

  const className = pupil.class
    ? `${pupil.class.name}${pupil.class.arm ? ` ${pupil.class.arm}` : ""}`
    : "Unassigned";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-2xl w-full h-full sm:w-11/12 sm:h-11/12 sm:max-w-4xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-4">
            {pupil.photoUrl ? (
              <img
                src={pupil.photoUrl}
                alt={`${pupil.firstName} ${pupil.lastName}`}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background text-xs text-muted">
                No photo
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {pupilName(pupil.firstName, pupil.lastName)}
              </h2>
              <p className="text-sm text-muted">
                {pupil.admissionNo} • {className}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition"
          >
            <X className="w-6 h-6 text-muted" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Subjects List */}
            {selectedSubjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted mb-4">No subjects selected yet</p>
                <Button
                  type="button"
                  onClick={() => setShowSubjectSelector(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Subject
                </Button>
              </div>
            ) : (
              <>
                {selectedSubjects.map((subjectId, index) => {
                  const subject = subjects.find((s) => s.id === subjectId);
                  const key = `${pupil.id}|${subjectId}`;
                  const scores = selectedScores?.[key] ?? ({} as any);
                  return (
                    <div key={`${pupil.id}-${subjectId}`} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          {subject?.name || "Unknown Subject"}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveSubject(index)}
                          className="p-2 text-error hover:bg-error-light rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="bg-background/50 rounded-lg p-4">
                        {subject && (
                          <ScoreInputRow
                            pupilId={pupil.id}
                            pupilName={pupilName(pupil.firstName, pupil.lastName)}
                            subjectId={subjectId}
                            subjectName={subject.name}
                            gradingScale={gradingScales}
                            defaultCa={scores.ca ?? undefined}
                            defaultTest={scores.test ?? undefined}
                            defaultExam={scores.exam ?? undefined}
                            defaultComment={scores.comment ?? undefined}
                            onScoreUpdate={onScoreUpdate}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add More Subjects Button */}
                {availableSubjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSubjectSelector(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-brand text-brand hover:bg-brand-light transition"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Subject
                  </button>
                )}
              </>
            )}
          </div>

          {/* Subject Selector - Inside Modal */}
          {showSubjectSelector && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-semibold text-foreground mb-3">
                Select Subject to Add
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSubjects.length === 0 ? (
                  <p className="text-sm text-muted col-span-full">
                    All subjects already selected
                  </p>
                ) : (
                  availableSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => {
                        onAddSubject(subject.id);
                        setShowSubjectSelector(false);
                      }}
                      className="px-4 py-2 rounded-lg border border-border hover:bg-brand-light hover:border-brand transition text-sm font-medium"
                    >
                      {subject.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border p-6 bg-background/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-border hover:bg-background transition font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
