"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Download,
  Filter,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";
import { Button } from "@/components/ui/button";
import SubscriptionModal from "@/components/subscription-modal";

interface ClassData {
  id: string;
  name: string;
  phase: string;
  arm?: string;
}

interface SummaryRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  pupil: {
    id: string;
    firstName: string;
    lastName: string;
  };
  class: {
    id: string;
    name: string;
  };
}

interface SummaryResponse {
  summary: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
  };
  records: SummaryRecord[];
}

const PHASE_ORDER = ["ALL", "EARLY_YEARS", "PRIMARY", "SECONDARY"];
const PHASE_LABELS: Record<string, string> = {
  ALL: "All Phases",
  EARLY_YEARS: "Early Years",
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
};

export default function AttendanceSummaryPage() {
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT" | "LATE">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string; schoolName?: string } | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setStartDate(monday.toISOString().split("T")[0]);
    setEndDate(sunday.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    async function loadClasses() {
      try {
        const backendUrl = getBackendUrl();
        const [response, verifyResponse] = await Promise.all([
          fetch(`${backendUrl}/api/admin/classes/data`, {
            credentials: "include",
          }),
          fetch(`${backendUrl}/api/admin/verify`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        let schoolNameToUse = "";
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json().catch(() => null);
          if (verifyData?.authenticated && verifyData.session?.schoolId) {
            try {
              const schoolResponse = await fetch(`${backendUrl}/api/admin/school/${verifyData.session.schoolId}`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              });
              if (schoolResponse.ok) {
                const schoolData = await schoolResponse.json().catch(() => null);
                schoolNameToUse = schoolData?.name || "";
              }
            } catch (err) {
              console.error("Error fetching school name:", err);
            }
          }
        }

        if (!response.ok) {
          if (response.status === 403) {
            const errorBody = await response.json().catch(() => null);
            if (errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
              setSubscriptionBlocked({
                reason: errorBody.reason || 'Your school subscription is not active',
                schoolName: schoolNameToUse || undefined,
              });
              setSchoolName(schoolNameToUse);
              setLoading(false);
              return;
            }
          }
          throw new Error("Failed to load classes");
        }

        const data = await response.json();
        setSchoolName(schoolNameToUse);
        const sorted = (data.classes || []).sort((a: any, b: any) => {
          const phaseOrder = PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase);
          if (phaseOrder !== 0) return phaseOrder;
          return a.name.localeCompare(b.name);
        });

        setAllClasses(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load classes");
      }
    }

    loadClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    if (selectedPhase === "ALL") return allClasses;
    return allClasses.filter((cls) => cls.phase === selectedPhase);
  }, [allClasses, selectedPhase]);

  useEffect(() => {
    if (selectedClass === "ALL") return;
    if (!filteredClasses.some((cls) => cls.id === selectedClass)) {
      const fallbackClass = filteredClasses[0] || allClasses[0];
      if (fallbackClass) {
        setSelectedClass(fallbackClass.id);
      }
    }
  }, [allClasses, filteredClasses, selectedClass]);

  useEffect(() => {
    if (!startDate || !endDate) return;

    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);

        const backendUrl = getBackendUrl();
        const query = new URLSearchParams({ fromDate: startDate, toDate: endDate });
        if (selectedClass !== "ALL") query.set("classId", selectedClass);

        const response = await fetch(`${backendUrl}/api/admin/attendance/summary?${query.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load attendance summary");
        }

        setSummaryData(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attendance summary");
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [selectedClass, startDate, endDate]);

  const dates = useMemo(() => {
    if (!startDate || !endDate) return [];
    const output: Date[] = [];
    const current = new Date(startDate);
    const last = new Date(endDate);
    while (current <= last) {
      output.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return output;
  }, [startDate, endDate]);

  const filteredRecords = useMemo(() => {
    const records = summaryData?.records || [];
    return records.filter((record) => {
      const studentName = `${record.pupil.firstName} ${record.pupil.lastName}`.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || studentName.includes(query) || record.class.name.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, summaryData]);

  const stats = useMemo(() => {
    const summary = summaryData?.summary;
    return {
      records: summary?.totalRecords || 0,
      present: summary?.presentCount || 0,
      absent: summary?.absentCount || 0,
      late: summary?.lateCount || 0,
      presentRate: summary && summary.totalRecords > 0 ? (summary.presentCount / summary.totalRecords) * 100 : 0,
    };
  }, [summaryData]);

  const exportCSV = () => {
    if (!summaryData) return;

    setExporting(true);
    try {
      const escapeCell = (value: string | number | null | undefined) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

      const csvRows = [
        ["Date", "Class", "Student", "Status"],
        ...filteredRecords.map((record) => [
          record.date,
          record.class.name,
          `${record.pupil.firstName} ${record.pupil.lastName}`,
          record.status,
        ]),
        ["", "", "", ""],
        ["Summary", "Count", "", ""],
        ["Present", String(stats.present), "", ""],
        ["Absent", String(stats.absent), "", ""],
        ["Late", String(stats.late), "", ""],
        ["Records", String(stats.records), "", ""],
        ["Present Rate", `${stats.presentRate.toFixed(1)}%`, "", ""],
      ];

      const csv = csvRows.map((row) => row.map(escapeCell).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `attendance-summary-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = () => {
    if (!summaryData) return;

    setExporting(true);
    try {
      const printWindow = window.open("", "", "width=1200,height=800");
      if (!printWindow) return;

      const rows = filteredRecords
        .map(
          (record, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${record.date}</td>
              <td>${record.class.name}</td>
              <td>${record.pupil.firstName} ${record.pupil.lastName}</td>
              <td>${record.status}</td>
            </tr>
          `
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Attendance Summary</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #1f2937; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            .meta { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
            .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .metric { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; }
            .metric .label { font-size: 11px; text-transform: uppercase; color: #6b7280; }
            .metric .value { font-size: 22px; font-weight: 700; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; text-align: left; }
            th { background: #0a66c2; color: white; }
            tr:nth-child(even) { background: #f9fafb; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Attendance Summary</h1>
          <div class="meta">Period: ${startDate} to ${endDate}${selectedClass !== "ALL" ? ` | Class: ${filteredClasses.find((cls) => cls.id === selectedClass)?.name || selectedClass}` : " | All Classes"}</div>
          <div class="metrics">
            <div class="metric"><div class="label">Records</div><div class="value">${stats.records}</div></div>
            <div class="metric"><div class="label">Present</div><div class="value">${stats.present}</div></div>
            <div class="metric"><div class="label">Absent</div><div class="value">${stats.absent}</div></div>
            <div class="metric"><div class="label">Late</div><div class="value">${stats.late}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Class</th>
                <th>Student</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="5">No records found</td></tr>`}</tbody>
          </table>
          <script>
            window.print();
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    } finally {
      setExporting(false);
    }
  };

  const selectPhase = (phase: string) => {
    setSelectedPhase(phase);
    const nextClass = phase === "ALL" ? "ALL" : allClasses.find((cls) => cls.phase === phase)?.id || "ALL";
    setSelectedClass(nextClass);
  };

  if (loading && allClasses.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} schoolName={subscriptionBlocked.schoolName || schoolName || 'Your School'} />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Link href="/admin/attendance" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:opacity-80">
            <ChevronLeft className="h-4 w-4" />
            Back to attendance
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart2 className="h-8 w-8 text-brand" />
              Attendance Summary
            </h1>
            <p className="mt-1 text-muted">School-wide attendance analytics, exports, and record history</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportCSV} disabled={exporting || !summaryData} variant="secondary" className="gap-2">
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button onClick={exportPDF} disabled={exporting || !summaryData} variant="secondary" className="gap-2">
            <Calendar className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error bg-error/10 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error</h3>
            <p className="text-sm text-error/80">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">Phase</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PHASE_ORDER.map((phase) => (
              <button
                key={phase}
                onClick={() => selectPhase(phase)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  selectedPhase === phase ? "bg-brand text-white" : "bg-background text-muted hover:bg-surface"
                }`}
              >
                {PHASE_LABELS[phase]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">Class</label>
          <select
            className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="ALL">All Classes</option>
            {filteredClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.arm || ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">Start Date</label>
          <input
            type="date"
            className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">End Date</label>
          <input
            type="date"
            className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted">
            <Filter className="h-4 w-4" />
            <span>Filter and inspect attendance records for the selected period.</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or class"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-72"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <option value="ALL">All statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
            </select>
          </div>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-4 gap-3">
        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <BarChart2 className="h-4 w-4 text-brand" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Records</p>
              <p className="mt-1 text-lg font-bold text-foreground">{stats.records}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">Attendance entries found</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Present</p>
              <p className="mt-1 text-lg font-bold text-green-600">{stats.present}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">On-time attendance</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Absent</p>
              <p className="mt-1 text-lg font-bold text-red-600">{stats.absent}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">Not present</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <Clock className="h-4 w-4 text-brand" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Present Rate</p>
              <p className="mt-1 text-lg font-bold text-brand">{stats.presentRate.toFixed(0)}%</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">Across filtered records</p>
        </div>
      </div>

      <div className="sm:hidden space-y-3">
        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
            <BarChart2 className="h-5 w-5 text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted font-medium">Records</p>
            <p className="mt-1.5 text-xl font-bold text-foreground">{stats.records}</p>
            <p className="mt-1 text-xs text-muted">Attendance entries found</p>
          </div>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted font-medium">Present</p>
            <p className="mt-1.5 text-xl font-bold text-green-600">{stats.present}</p>
            <p className="mt-1 text-xs text-muted">On-time attendance</p>
          </div>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted font-medium">Absent</p>
            <p className="mt-1.5 text-xl font-bold text-red-600">{stats.absent}</p>
            <p className="mt-1 text-xs text-muted">Not present</p>
          </div>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
            <Clock className="h-5 w-5 text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted font-medium">Present Rate</p>
            <p className="mt-1.5 text-xl font-bold text-brand">{stats.presentRate.toFixed(0)}%</p>
            <p className="mt-1 text-xs text-muted">Across filtered records</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" />
          <p className="mt-3 text-muted">Loading attendance summary...</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="border-b border-border bg-background px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Attendance Records</h2>
            <p className="text-sm text-muted">
              {selectedClass === "ALL" ? "All classes" : filteredClasses.find((cls) => cls.id === selectedClass)?.name || "Selected class"} · {startDate} to {endDate}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-background/50 text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => {
                    const badgeColor =
                      record.status === "PRESENT"
                        ? "bg-green-100 text-green-800"
                        : record.status === "ABSENT"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800";

                    return (
                      <tr key={record.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-6 py-4 text-foreground">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-foreground">{record.class.name}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{record.pupil.firstName} {record.pupil.lastName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-muted">
                      No records found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
