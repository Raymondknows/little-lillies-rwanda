"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface Pupil {
  id: string;
  name: string;
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
  const [scores, setScores] = useState<Record<string, ScoreEntry>>(() => {
    const initial: Record<string, ScoreEntry> = {};
    pupils.forEach((pupil) => {
      const existing = existingResults[pupil.id];
      initial[pupil.id] = {
        pupilId: pupil.id,
        caScore: existing?.caScore || null,
        testScore: existing?.testScore || null,
        examScore: existing?.examScore || null,
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
          // Auto-select first subject if available
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

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleScoreChange = (pupilId: string, field: string, value: string) => {
    setScores((prev) => ({
      ...prev,
      [pupilId]: {
        ...prev[pupilId],
        [field]: value ? parseFloat(value) : null,
      },
    }));
  };

  const calculateTotal = (caScore: number | null, testScore: number | null, examScore: number | null) => {
    if (caScore === null || testScore === null || examScore === null) return null;
    return (caScore * 0.2 + testScore * 0.3 + examScore * 0.5).toFixed(1);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const entries = Object.values(scores).filter(
        (s) => s.caScore !== null || s.testScore !== null || s.examScore !== null
      );

      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          subject: selectedSubject || null,
          entries: entries.map((e) => ({
            ...e,
            totalScore:
              e.caScore && e.testScore && e.examScore
                ? parseFloat((e.caScore * 0.2 + e.testScore * 0.3 + e.examScore * 0.5).toFixed(1))
                : null,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save scores");
      }

      setMessage({ type: "success", text: "Scores saved successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save scores",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Subject Selector */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4" />
            <span>Subject (Optional)</span>
          </div>
        </label>
        {loadingSubjects ? (
          <div className="text-sm text-muted animate-pulse">Loading subjects...</div>
        ) : subjects.length > 0 ? (
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </tr>
          </thead>
          <tbody>
            {pupils.map((pupil) => {
              const score = scores[pupil.id];
              const total = calculateTotal(score.caScore, score.testScore, score.examScore);

              return (
                <tr key={pupil.id} className="border-t border-border hover:bg-background/50">
                  <td className="px-3 py-2 font-medium sm:px-4">{pupil.name}</td>
                  <td className="px-3 py-2 text-center sm:px-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={score.caScore ?? ""}
                      onChange={(e) => handleScoreChange(pupil.id, "caScore", e.target.value)}
                      className="w-16 rounded border border-border bg-background px-2 py-1 text-xs"
                      placeholder="0-100"
                    />
                  </td>
                  <td className="px-3 py-2 text-center sm:px-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={score.testScore ?? ""}
                      onChange={(e) => handleScoreChange(pupil.id, "testScore", e.target.value)}
                      className="w-16 rounded border border-border bg-background px-2 py-1 text-xs"
                      placeholder="0-100"
                    />
                  </td>
                  <td className="px-3 py-2 text-center sm:px-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={score.examScore ?? ""}
                      onChange={(e) => handleScoreChange(pupil.id, "examScore", e.target.value)}
                      className="w-16 rounded border border-border bg-background px-2 py-1 text-xs"
                      placeholder="0-100"
                    />
                  </td>
                  <td className="px-3 py-2 text-center font-semibold sm:px-4">{total || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save scores"}
        </Button>
      </div>
    </div>
  );
}
