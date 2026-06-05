"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface ScoreRowProps {
  pupilId: string;
  pupilName: string;
  subjectId: string;
  subjectName: string;
  defaultCa?: number;
  defaultTest?: number;
  defaultExam?: number;
  defaultComment?: string;
  gradingScale: Array<{ minScore: number; maxScore: number; grade: string }>;
  onScoreUpdate?: (pupilId: string, subjectId: string, ca: number | null, test: number | null, exam: number | null, comment: string) => void;
}

export function ScoreInputRow({
  pupilId,
  pupilName,
  subjectId,
  subjectName,
  defaultCa,
  defaultTest,
  defaultExam,
  defaultComment,
  gradingScale,
  onScoreUpdate,
}: ScoreRowProps) {
  const [ca, setCa] = useState(defaultCa ?? "");
  const [test, setTest] = useState(defaultTest ?? "");
  const [exam, setExam] = useState(defaultExam ?? "");
  const [comment, setComment] = useState(defaultComment ?? "");

  // Calculate total and grade in real-time
  const caNum = typeof ca === "number" ? ca : (ca ? Number(ca) : 0);
  const testNum = typeof test === "number" ? test : (test ? Number(test) : 0);
  const examNum = typeof exam === "number" ? exam : (exam ? Number(exam) : 0);
  const total = caNum + testNum + examNum;

  // Find grade from grading scale
  const grade =
    gradingScale.find(
      (s) => total >= s.minScore && total <= s.maxScore,
    )?.grade ?? "—";

  // Notify parent whenever scores change
  useEffect(() => {
    if (onScoreUpdate) {
      const caVal = ca === "" ? null : Number(ca);
      const testVal = test === "" ? null : Number(test);
      const examVal = exam === "" ? null : Number(exam);
      onScoreUpdate(pupilId, subjectId, caVal, testVal, examVal, comment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ca, test, exam, comment, pupilId, subjectId]);

  const getGradeColor = (g: string) => {
    if (g === "—") return "default";
    if (g === "A") return "success";
    if (["B", "C"].includes(g)) return "brand";
    if (["D", "E"].includes(g)) return "warning";
    return "error";
  };

  return (
    <div key={`${pupilId}-${subjectId}`} className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted">{subjectName}</p>
          <p className="text-xs text-muted/70">{pupilName}</p>
        </div>
      </div>

      {/* Score row */}
      <div className="grid gap-2 rounded-lg border border-border bg-background p-2 sm:grid-cols-6">
        <div className="flex flex-col">
          <label className="text-xs text-muted">CA</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={ca}
            onChange={(e) => setCa(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-sm font-mono focus:border-brand focus:outline-none"
            placeholder="—"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-muted">Test</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={test}
            onChange={(e) => setTest(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-sm font-mono focus:border-brand focus:outline-none"
            placeholder="—"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-muted">Exam</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-sm font-mono focus:border-brand focus:outline-none"
            placeholder="—"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-muted">Total</label>
          <div className="mt-1 flex items-center justify-center rounded border border-border bg-surface px-2 py-1 text-sm font-mono font-semibold text-foreground">
            {total > 0 ? total : "—"}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-muted">Grade</label>
          <div className="mt-1 flex items-center justify-center">
            <Badge variant={getGradeColor(grade)}>{grade}</Badge>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-muted">Comment</label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-white px-2 py-1 text-xs focus:border-brand focus:outline-none"
            placeholder="Optional note"
          />
        </div>
      </div>
    </div>
  );
}
