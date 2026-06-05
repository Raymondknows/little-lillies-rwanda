"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Edit2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentEntryModal, type StudentEntryPupil } from "./subject-selector-modal";
import { pupilName } from "@/lib/format";
import { saveResultMarks } from "@/app/admin/actions";

interface Pupil {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo?: string | null;
  photoUrl?: string | null;
  classId?: string | null;
  class?: { name: string; arm?: string | null } | null;
}

interface Subject {
  id: string;
  name: string;
}

interface GradingScale {
  id: string;
  grade: string;
  minScore: number;
  maxScore: number;
}

interface PupilEntry {
  pupilId: string;
  subjects: string[]; // array of subjectIds
}

interface ScoreData {
  [key: string]: {
    ca: number | null;
    test: number | null;
    exam: number | null;
    comment: string;
  };
}

export function ResultsEntryForm({
  pupils,
  allSubjects,
  gradingScales,
  assessmentId,
  existingResults,
  selectedClassId,
  basePath = "admin",
}: {
  pupils: Pupil[];
  allSubjects: Subject[];
  gradingScales: GradingScale[];
  assessmentId: string;
  existingResults?: Array<{
    pupilId: string;
    subjectId: string | null;
    caScore: number | null;
    testScore: number | null;
    examScore: number | null;
    comment: string | null;
  }>;
  selectedClassId?: string;
  basePath?: string;
}) {
  const selectedClassIdProp = selectedClassId;
  const [pupilEntries, setPupilEntries] = useState<Map<string, PupilEntry>>(() => {
    const map = new Map<string, PupilEntry>(
      pupils.map((p) => [p.id, { pupilId: p.id, subjects: [] as string[] }]),
    );
    if (existingResults && existingResults.length > 0) {
      for (const r of existingResults) {
        if (!r.subjectId) continue;
        const entry = map.get(r.pupilId);
        if (entry && !entry.subjects.includes(r.subjectId)) {
          entry.subjects.push(r.subjectId);
        }
      }
    }
    return map;
  });
  const [scoreData, setScoreData] = useState<ScoreData>(() => {
    const out: ScoreData = {};
    if (existingResults && existingResults.length > 0) {
      for (const r of existingResults) {
        if (!r.subjectId) continue;
        const key = `${r.pupilId}|${r.subjectId}`;
        out[key] = {
          ca: r.caScore ?? null,
          test: r.testScore ?? null,
          exam: r.examScore ?? null,
          comment: r.comment ?? "",
        };
      }
    }
    return out;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPupil, setSelectedPupil] = useState<StudentEntryPupil | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleOpenModal = (pupil: Pupil) => {
    setSelectedPupil(pupil);
    setModalOpen(true);
  }; 

  useEffect(() => {
    if (searchParams.get("saved") === "true") {
      setShowSaveSuccess(true);
    }
  }, [searchParams]);

  const handleCloseSuccess = () => {
    setShowSaveSuccess(false);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("saved");
    router.replace(`${pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPupil(null);
  };

  const handleAddSubject = (subjectId: string) => {
    if (selectedPupil) {
      setPupilEntries((prev) => {
        const updated = new Map(prev);
        const entry = updated.get(selectedPupil.id);
        if (entry && !entry.subjects.includes(subjectId)) {
          entry.subjects = [...entry.subjects, subjectId];
        }
        return updated;
      });
    }
  };

  const handleRemoveSubject = (index: number) => {
    if (selectedPupil) {
      setPupilEntries((prev) => {
        const updated = new Map(prev);
        const entry = updated.get(selectedPupil.id);
        if (entry) {
          const subjectId = entry.subjects[index];
          // Also remove score data for this subject
          if (subjectId) {
            const key = `${selectedPupil.id}|${subjectId}`;
            setScoreData((prev) => {
              const updated = { ...prev };
              delete updated[key];
              return updated;
            });
          }
          entry.subjects = entry.subjects.filter((_, i) => i !== index);
        }
        return updated;
      });
    }
  };

  const handleScoreUpdate = useCallback((pupilId: string, subjectId: string, ca: number | null, test: number | null, exam: number | null, comment: string) => {
    const key = `${pupilId}|${subjectId}`;
    setScoreData((prev) => ({
      ...prev,
      [key]: { ca, test, exam, comment },
    }));
  }, []);

  const getSubjectName = (subjectId: string) => {
    return allSubjects.find((s) => s.id === subjectId)?.name || "Unknown";
  };

  const getStudentStatus = (pupilId: string) => {
    const entry = pupilEntries.get(pupilId);
    if (!entry || entry.subjects.length === 0) {
      return { count: 0, label: "No subjects" };
    }
    return { count: entry.subjects.length, label: `${entry.subjects.length} subject${entry.subjects.length > 1 ? "s" : ""}` };
  };

  // Generate entry fields data
  const entryFields = useMemo(() => {
    const entries: string[] = [];
    pupilEntries.forEach((pupilEntry) => {
      pupilEntry.subjects.forEach((subjectId) => {
        if (subjectId) {
          entries.push(`${pupilEntry.pupilId}|${subjectId}`);
        }
      });
    });
    return entries;
  }, [pupilEntries]);

  return (
    <form action={saveResultMarks} className="space-y-8" ref={formRef}>
      <input type="hidden" name="assessmentId" value={assessmentId} />
      {selectedClassIdProp && (
        <input type="hidden" name="classId" value={selectedClassIdProp} />
      )}
      {entryFields.map((entry) => (
        <input
          key={entry}
          type="hidden"
          name="entry"
          value={entry}
        />
      ))}
      
      {/* Hidden score inputs for each pupil-subject combination */}
      {Object.entries(scoreData).map(([key, scores]) => {
        const [pupilId, subjectId] = key.split("|");
        return (
          <div key={key}>
            {scores.ca !== null && (
              <input
                type="hidden"
                name={`ca_${pupilId}_${subjectId}`}
                value={scores.ca}
              />
            )}
            {scores.test !== null && (
              <input
                type="hidden"
                name={`test_${pupilId}_${subjectId}`}
                value={scores.test}
              />
            )}
            {scores.exam !== null && (
              <input
                type="hidden"
                name={`exam_${pupilId}_${subjectId}`}
                value={scores.exam}
              />
            )}
            {scores.comment && (
              <input
                type="hidden"
                name={`comment_${pupilId}_${subjectId}`}
                value={scores.comment}
              />
            )}
          </div>
        );
      })}

      {/* Subject Info Box */}
      <div className="rounded-lg bg-brand-light p-4 border border-brand">
        <p className="text-sm text-foreground">
          <strong>Available subjects:</strong> {allSubjects.length === 0 ? "None configured" : allSubjects.map(s => s.name).join(", ")}
        </p>
      </div>

      {/* Student Entry Modal */}
      <StudentEntryModal
        isOpen={modalOpen}
        pupil={selectedPupil}
        subjects={allSubjects}
        gradingScales={gradingScales}
        selectedSubjects={selectedPupil ? pupilEntries.get(selectedPupil.id)?.subjects || [] : []}
        onAddSubject={handleAddSubject}
        onRemoveSubject={handleRemoveSubject}
        onScoreUpdate={handleScoreUpdate}
        selectedScores={scoreData}
        onClose={handleCloseModal}
      />

      {/* Students List */}
      <div className="space-y-3">
        {pupils.map((pupil) => {
          const className = pupil.class ? `${pupil.class.name}${pupil.class.arm ? ` ${pupil.class.arm}` : ""}` : "Unassigned";
          const status = getStudentStatus(pupil.id);
          const isComplete = status.count > 0;

          return (
            <div
              key={pupil.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 hover:border-brand transition"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {pupil.photoUrl ? (
                  <img
                    src={pupil.photoUrl}
                    alt={`${pupil.firstName} ${pupil.lastName}`}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-xs text-muted flex-shrink-0">
                    No photo
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">
                      {pupilName(pupil.firstName, pupil.lastName)}
                    </p>
                    {isComplete && (
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-xs text-muted mt-1">
                    <span>{pupil.admissionNo || "No admission #"}</span>
                    <Badge variant="secondary">{className}</Badge>
                    <Badge variant="outline">{status.label}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => handleOpenModal(pupil)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition flex-shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Enter Scores</span>
                </button>
                {status.count > 0 && (
                  <Link
                    href={`/${basePath}/results/${assessmentId}/student/${pupil.id}/report`}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground hover:bg-background transition"
                  >
                    View report
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
        <Button type="submit">Save All Marks</Button>
      </div>

      {showSaveSuccess ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-success/10 p-3 text-success">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Marks saved successfully</h3>
                <p className="mt-2 text-sm text-muted">
                  All entered marks have been saved. You can continue editing or review the full assessment report.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={handleCloseSuccess}>
                Close
              </Button>
              <Link href={`/admin/results/${assessmentId}/report`} className="inline-flex justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark">
                View complete report
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
