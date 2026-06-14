"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, CreditCard, AlertCircle, Users, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";

export default function ChildrenPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        
        const res = await fetch(`${backendUrl}/api/parent/children`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Failed to load children');
        }

        const data = await res.json();
        setChildren(data.children || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading children:", err);
        setError(err instanceof Error ? err.message : 'Failed to load children');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading children...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Children</h1>
        <p className="mt-1 text-muted">
          {children.length === 1 ? "1 child registered in the system" : `${children.length} children registered in the system`}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-error bg-error/10 p-4 flex gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error</h3>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {children.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <Users className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No children registered yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div
              key={child.id}
              className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm transition-shadow hover:shadow-md flex flex-col"
            >
              {/* Child Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground mb-1">
                      {child.firstName} {child.lastName}
                    </h2>
                    <p className="text-sm text-muted">
                      Admission: <span className="font-semibold text-foreground">{child.admissionNo}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted">
                    {child.class?.name || "Class"} {child.class?.section || ""}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium ${
                    child.status === 'ACTIVE' 
                      ? 'border-success bg-success/10 text-success'
                      : 'border-warning bg-warning/10 text-warning'
                  }`}>
                    {child.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-6 space-y-4 flex-1">
                <div>
                  <p className="text-xs text-muted mb-1 uppercase tracking-wider font-medium">Outstanding Fee</p>
                  <p className={`text-2xl font-bold ${child.outstandingFee > 0 ? 'text-error' : 'text-success'}`}>
                    {formatMoney(child.outstandingFee || 0)}
                  </p>
                </div>

                {child.latestGrade && (
                  <div>
                    <p className="text-xs text-muted mb-1 uppercase tracking-wider font-medium">Latest Grade</p>
                    <p className="text-2xl font-bold text-brand">{child.latestGrade}</p>
                  </div>
                )}

                {child.attendance && (
                  <div>
                    <p className="text-xs text-muted mb-1 uppercase tracking-wider font-medium">Attendance</p>
                    <p className="text-2xl font-bold text-success">{child.attendance}%</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 space-y-2 border-t border-border pt-4">
                <Link
                  href={`/parent/results?childId=${child.id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-background text-foreground rounded-lg hover:bg-background/80 transition-colors text-sm font-semibold border border-border"
                >
                  <BookOpen className="h-4 w-4" />
                  View Grades
                </Link>
                <Link
                  href={`/parent/invoices?childId=${child.id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-sm font-semibold shadow-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  View Fees
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
