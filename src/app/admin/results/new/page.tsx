"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const PHASE_OPTIONS = [
  { value: "EARLY_YEARS", label: "Early Years" },
  { value: "PRIMARY", label: "Primary" },
  { value: "SECONDARY", label: "Secondary" },
];

export default function NewAssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [termsLoading, setTermsLoading] = useState(true);

  // Fetch terms on mount
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await fetch("/api/admin/terms");
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        setTerms(data.terms || []);
      } catch (err) {
        console.error("Error fetching terms:", err);
        setTerms([]);
      } finally {
        setTermsLoading(false);
      }
    };
    fetchTerms();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const termId = formData.get("termId") as string;
    const phase = formData.get("phase") as string;

    try {
      const res = await fetch("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, termId, phase }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create assessment");
      }

      const assessment = await res.json();
      router.push(`/admin/results/${assessment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/admin/results" className="text-sm text-brand hover:underline">
        ← Back to results
      </Link>

      <div className="mt-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-muted">Create a new assessment</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Create assessment</h1>
        </div>

        {termsLoading ? (
          <div className="text-center text-muted">Loading terms...</div>
        ) : terms.length === 0 ? (
          <div className="rounded-2xl border border-warning bg-warning/10 p-5 text-sm text-warning">
            No terms found. Please set up an academic year and terms first.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Assessment name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Q1 Exam 2026, Mid-Term Test"
                required
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Term *</label>
              <select
                name="termId"
                required
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select a term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Phase *</label>
              <select
                name="phase"
                required
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select a phase</option>
                {PHASE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create assessment"}
              </Button>
              <Link href="/admin/results">
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
