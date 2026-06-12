"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, ChevronRight } from "lucide-react";

interface Assessment {
  id: string;
  name: string;
  status: string;
  term: { name: string };
  publishedAt?: string;
}

interface Child {
  id: string;
  name: string;
  admissionNo: string;
  assessments: Assessment[];
}

export default function ParentResultsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/parent/children");
        if (!response.ok) throw new Error("Failed to fetch children");
        const data = await response.json();
        setChildren(data.children || []);

        // Auto-select first child
        if (data.children && data.children.length > 0) {
          setSelectedChildId(data.children[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="text-center text-muted">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <GraduationCap className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
          <p className="text-muted">No children linked to this account</p>
        </div>
      </div>
    );
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const publishedAssessments = selectedChild?.assessments?.filter(
    (a) => a.status === "PUBLISHED"
  ) || [];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Results & Report Cards</h1>
          <p className="text-muted mt-2">View your child's academic performance</p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mb-8 rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium mb-3">Select Child:</p>
            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedChild?.id === child.id
                      ? "bg-brand text-white"
                      : "border border-border bg-background hover:bg-background/80"
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedChild && (
          <>
            {/* Child Info Card */}
            <div className="mb-8 rounded-lg border border-border bg-surface p-6">
              <h2 className="text-xl font-bold">{selectedChild.name}</h2>
              <p className="text-sm text-muted">Admission No: {selectedChild.admissionNo}</p>
            </div>

            {/* Assessments List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Published Assessments</h3>

              {publishedAssessments.length === 0 ? (
                <div className="rounded-lg border border-border bg-surface p-12 text-center">
                  <p className="text-muted">No published assessment results available yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {publishedAssessments.map((assessment) => (
                    <Link
                      key={assessment.id}
                      href={`/parent/results/${assessment.id}/${selectedChild.id}`}
                    >
                      <div className="rounded-lg border border-border bg-surface p-6 hover:border-brand hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{assessment.name}</h4>
                            <p className="text-sm text-muted mt-1">{assessment.term.name}</p>
                            {assessment.publishedAt && (
                              <p className="text-xs text-muted mt-2">
                                Published:{" "}
                                {new Date(assessment.publishedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 flex items-center gap-3">
                            <Badge variant="success">Published</Badge>
                            <ChevronRight className="w-5 h-5 text-muted" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
