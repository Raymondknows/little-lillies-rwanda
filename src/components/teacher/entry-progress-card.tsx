"use client";

import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EntryProgressCardProps {
  assessmentId: string;
  assessmentName: string;
  phase: string;
  status: string;
  term?: string;
  totalStudents: number;
  entriesComplete: number;
  subjects?: Array<{
    name: string;
    completed: number;
    total: number;
  }>;
  createdDate?: string;
}

export default function EntryProgressCard({
  assessmentId,
  assessmentName,
  phase,
  status,
  term,
  totalStudents,
  entriesComplete,
  subjects = [],
  createdDate,
}: EntryProgressCardProps) {
  const completionPercent = Math.round((entriesComplete / totalStudents) * 100);
  const isLowCompletion = completionPercent < 60;
  const isComplete = completionPercent === 100;
  const isBelowHalf = completionPercent < 50;

  const getStatusColor = () => {
    if (status === "PUBLISHED") return "success";
    if (status === "APPROVED") return "brand";
    return "secondary";
  };

  const getStatusIcon = () => {
    if (status === "PUBLISHED") return <CheckCircle2 className="w-4 h-4" />;
    if (status === "APPROVED") return <Clock className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const atRiskSubjects = subjects.filter(
    (s) => (s.completed / s.total) * 100 < 60
  );

  return (
    <div
      className={`rounded-lg border transition-all hover:shadow-md ${
        isBelowHalf
          ? "border-orange-200 bg-orange-50"
          : isComplete
            ? "border-green-200 bg-green-50"
            : "border-border bg-surface"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {assessmentName}
            </h3>
            <p className="text-xs text-muted mt-1">
              {phase}
              {term && ` • ${term}`}
            </p>
          </div>
          <Badge variant={getStatusColor() as any} className="whitespace-nowrap flex items-center gap-1">
            {getStatusIcon()}
            <span className="text-xs">{status}</span>
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-foreground">
              Entry Progress
            </span>
            <span className="text-xs font-bold text-brand">
              {completionPercent}%
            </span>
          </div>
          <div className="w-full bg-background rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                isComplete
                  ? "bg-green-500"
                  : isLowCompletion
                    ? "bg-orange-500"
                    : "bg-brand"
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-1">
            {entriesComplete} of {totalStudents} students
          </p>
        </div>

        {/* Subject Progress Grid */}
        {subjects.length > 0 && (
          <div className="mb-4 pb-4 border-t border-border pt-3">
            <p className="text-xs font-medium text-foreground mb-2">
              By Subject:
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2">
              {subjects.map((subject) => {
                const subjPercent = Math.round(
                  (subject.completed / subject.total) * 100
                );
                const isAtRisk = subjPercent < 60;
                return (
                  <div
                    key={subject.name}
                    className={`text-xs p-2 rounded ${
                      isAtRisk ? "bg-orange-100 border border-orange-200" : "bg-background border border-border"
                    }`}
                  >
                    <p className="font-medium text-foreground truncate">
                      {subject.name}
                    </p>
                    <p className={`text-xs ${isAtRisk ? "text-orange-700 font-semibold" : "text-muted"}`}>
                      {subjPercent}% ({subject.completed}/{subject.total})
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* At-Risk Alert */}
        {atRiskSubjects.length > 0 && (
          <div className="mb-4 p-2 bg-orange-100 border border-orange-200 rounded flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-orange-700">
              <p className="font-semibold">At-risk subjects:</p>
              <p>{atRiskSubjects.map((s) => s.name).join(", ")}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {status === "DRAFT" && (
            <Link href={`/teacher/results/${assessmentId}/subjects`} className="flex-1">
              <Button className="w-full">
                Continue Entry
              </Button>
            </Link>
          )}
          <Link href={`/teacher/results/${assessmentId}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
