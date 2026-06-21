"use client";

import { useState, useEffect, Fragment } from "react";
import { BookOpen } from "lucide-react";

interface Pupil {
  id: string;
  name: string;
  className?: string;
}

interface ScoreEntry {
  pupilId: string;
  caScore: number | null;
  testScore: number | null;
  examScore: number | null;
}

interface Subject {
  id: string;
  name: string;
}

const calculateGrade = (totalScore: number | null): string | null => {
  if (totalScore === null) return null;
  if (totalScore >= 70) return "A";
  if (totalScore >= 60) return "B";
  if (totalScore >= 50) return "C";
  if (totalScore >= 45) return "D";
  if (totalScore >= 40) return "E";
  return "F";
};

export function AssessmentScores({
  assessmentId,
  pupils,
  existingResults,
}: {
  assessmentId: string;
  pupils: Pupil[];
  existingResults: Record<string, any>;
}) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [scores] = useState<Record<string, ScoreEntry>>(() => {
    const initial: Record<string, ScoreEntry> = {};
    pupils.forEach((pupil) => {
      const existing = existingResults[pupil.id];
      initial[pupil.id] = {
        pupilId: pupil.id,
        caScore: existing?.caScore ?? null,
        testScore: existing?.testScore ?? null,
        examScore: existing?.examScore ?? null,
      };
    });
    return initial;
  });

  // Load available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const res = await fetch("/api/admin/subjects");
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
          if (data.subjects?.length > 0) {
            setSelectedSubject(data.subjects[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const groupedPupils = Array.from(
    pupils.reduce((groups, pupil) => {
      const groupKey = pupil.className || "Class not assigned";
      const group = groups.get(groupKey) ?? { className: groupKey, pupils: [] as Pupil[] };
      group.pupils.push(pupil);
      groups.set(groupKey, group);
      return groups;
    }, new Map<string, { className: string; pupils: Pupil[] }>())
  ).sort((a, b) => a[1].className.localeCompare(b[1].className));

  const calculateTotal = (caScore: number | null, testScore: number | null, examScore: number | null) => {
    if (caScore === null || testScore === null || examScore === null) return null;
    return (caScore * 0.2 + testScore * 0.3 + examScore * 0.5).toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        Admin view only: scores are not editable here. Total and grade will display from stored results.
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
          <BookOpen className="w-4 h-4" />
          <span>Subject (Optional)</span>
        </div>
        {loadingSubjects ? (
          <div className="text-sm text-muted animate-pulse">Loading subjects...</div>
        ) : subjects.length > 0 ? (
          <select
            value={selectedSubject}
            disabled
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">-- No Subject (General Assessment) --</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted">No subjects available</p>
        )}
        {selectedSubject && (
          <p className="text-xs text-muted mt-2">Scores will be saved for: <strong>{selectedSubject}</strong></p>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-3 py-2 font-medium sm:px-4">Student</th>
              <th className="px-3 py-2 font-medium text-center sm:px-4">CA (20%)</th>
              <th className="px-3 py-2 font-medium text-center sm:px-4">Test (30%)</th>
              <th className="px-3 py-2 font-medium text-center sm:px-4">Exam (50%)</th>
              <th className="px-3 py-2 font-medium text-center sm:px-4">Total</th>
              <th className="px-3 py-2 font-medium text-center sm:px-4">Grade</th>
            </tr>
          </thead>
          <tbody>
            {groupedPupils.map(([classKey, group], groupIndex) => (
              <Fragment key={classKey}>
                <tr className={groupIndex === 0 ? "bg-background" : "bg-brand/5"}>
                  <td colSpan={5} className="px-3 py-2 text-sm font-semibold text-brand sm:px-4">
                    Class: {group.className} · {group.pupils.length} student{group.pupils.length === 1 ? "" : "s"}
                  </td>
                </tr>
                {group.pupils.map((pupil) => {
                  const score = scores[pupil.id];
                  const total = calculateTotal(score.caScore, score.testScore, score.examScore);
                  const grade = existingResults[pupil.id]?.grade ?? calculateGrade(total ? parseFloat(total) : null);

                  return (
                    <tr key={pupil.id} className="border-t border-border hover:bg-background/50">
                      <td className="px-3 py-2 font-medium sm:px-4">{pupil.name}</td>
                      <td className="px-3 py-2 text-center border-x border-border sm:px-4">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*([.,][0-9]+)?"
                          value={score.caScore ?? ""}
                          disabled
                          className="w-16 rounded border border-border bg-background px-2 py-1 text-xs text-center"
                        />
                      </td>
                      <td className="px-3 py-2 text-center border-x border-border sm:px-4">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*([.,][0-9]+)?"
                          value={score.testScore ?? ""}
                          disabled
                          className="w-16 rounded border border-border bg-background px-2 py-1 text-xs text-center"
                        />
                      </td>
                      <td className="px-3 py-2 text-center border-x border-border sm:px-4">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*([.,][0-9]+)?"
                          value={score.examScore ?? ""}
                          disabled
                          className="w-16 rounded border border-border bg-background px-2 py-1 text-xs text-center"
                        />
                      </td>
                      <td className="px-3 py-2 text-center font-semibold sm:px-4">{existingResults[pupil.id]?.totalScore ?? total ?? "—"}</td>
                      <td className="px-3 py-2 text-center sm:px-4">{existingResults[pupil.id]?.grade ?? (grade || "—")}</td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
