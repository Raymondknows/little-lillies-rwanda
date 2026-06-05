"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { generateCSV, generatePDF } from "@/lib/attendance-export";
import {
  FileText,
  Download,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
} from "lucide-react";

interface StudentRecord {
  firstName: string;
  lastName: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

interface Props {
  className: string;
  classArm?: string;
  schoolName: string;
  schoolLogo?: string;
  reportDate: string;
  startDate: string;
  endDate: string;
  students: StudentRecord[];
  summary: {
    expectedPupils: number;
    recorded: number;
    present: number;
    absent: number;
    late: number;
    completion: number;
  };
}

export default function AttendanceReportClient({
  className,
  classArm,
  schoolName,
  reportDate,
  startDate,
  endDate,
  students,
  summary,
  schoolLogo,
}: Props) {
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent" | "late">("all");
  const [sortBy, setSortBy] = useState<"name" | "attendance">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === "present") matchesStatus = student.present > 0;
      if (statusFilter === "absent") matchesStatus = student.absent > 0;
      if (statusFilter === "late") matchesStatus = student.late > 0;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === "name") {
        aVal = `${a.firstName} ${a.lastName}`;
        bVal = `${b.firstName} ${b.lastName}`;
      } else {
        aVal = a.percentage;
        bVal = b.percentage;
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return filtered;
  }, [students, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const csv = generateCSV({
        schoolName,
        className,
        classArm,
        reportDate,
        startDate,
        endDate,
        students,
        summary,
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Attendance_${className}${classArm ? `_${classArm}` : ""}_${new Date().getTime()}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      generatePDF({
        schoolName,
        schoolLogo,
        className,
        classArm,
        reportDate,
        startDate,
        endDate,
        students,
        summary,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-foreground">
          {className}
          {classArm ? ` ${classArm}` : ""}
        </h2>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "summary"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "details"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Filter className="h-4 w-4" />
            Student Details
          </button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleExportCSV}
          disabled={isExporting}
          variant="secondary"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Download CSV"}
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          variant="secondary"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Download PDF"}
        </Button>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-muted">Expected Pupils</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{summary.expectedPupils}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-muted">Recorded</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {summary.recorded}
                <span className="text-sm ml-2 font-normal text-muted">({summary.completion.toFixed(1)}%)</span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-muted">Present</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{summary.present}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-muted">Absent</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{summary.absent}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-muted">Late</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{summary.late}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-muted">Report Period</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {startDate}
                <br />
                to {endDate}
              </p>
            </div>
          </div>

          {/* Summary Table */}
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-muted">
                <tr>
                  <th className="px-6 py-4 font-semibold">Metric</th>
                  <th className="px-6 py-4 font-semibold text-right">Count</th>
                  <th className="px-6 py-4 font-semibold text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border hover:bg-background/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-foreground">Present</td>
                  <td className="px-6 py-3 text-right text-foreground">{summary.present}</td>
                  <td className="px-6 py-3 text-right font-semibold text-foreground">
                    {summary.expectedPupils > 0
                      ? ((summary.present / summary.expectedPupils) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
                <tr className="border-t border-border bg-surface/50 hover:bg-surface transition-colors">
                  <td className="px-6 py-3 font-medium text-foreground">Absent</td>
                  <td className="px-6 py-3 text-right text-foreground">{summary.absent}</td>
                  <td className="px-6 py-3 text-right font-semibold text-foreground">
                    {summary.expectedPupils > 0
                      ? ((summary.absent / summary.expectedPupils) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
                <tr className="border-t border-border hover:bg-background/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-foreground">Late</td>
                  <td className="px-6 py-3 text-right text-foreground">{summary.late}</td>
                  <td className="px-6 py-3 text-right font-semibold text-foreground">
                    {summary.expectedPupils > 0
                      ? ((summary.late / summary.expectedPupils) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
                <tr className="border-t border-border bg-surface/80 hover:bg-surface transition-colors">
                  <td className="px-6 py-3 font-semibold text-foreground">Total Recorded</td>
                  <td className="px-6 py-3 text-right font-semibold text-foreground">{summary.recorded}</td>
                  <td className="px-6 py-3 text-right font-semibold text-foreground">
                    {summary.completion.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Search Student</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Attendance Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="all">All Students</option>
                  <option value="present">Present Only</option>
                  <option value="absent">Absent Only</option>
                  <option value="late">Late Only</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  >
                    <option value="name">Name</option>
                    <option value="attendance">Attendance %</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 py-2 border border-border rounded-lg text-muted hover:text-foreground transition-colors"
                  >
                    {sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <p className="text-xs text-muted">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-muted">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold text-center">Present</th>
                  <th className="px-6 py-4 font-semibold text-center">Absent</th>
                  <th className="px-6 py-4 font-semibold text-center">Late</th>
                  <th className="px-6 py-4 font-semibold text-center">Total</th>
                  <th className="px-6 py-4 font-semibold text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr
                      key={`${student.firstName}-${student.lastName}-${index}`}
                      className={`border-t border-border transition-colors ${
                        index % 2 === 0 ? "hover:bg-background/50" : "bg-surface/30 hover:bg-surface/50"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-foreground">
                        {student.present}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-foreground">
                        {student.absent}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-foreground">
                        {student.late}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-foreground">
                        {student.total}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block rounded-full bg-surface px-3 py-1 text-xs font-semibold text-foreground border border-border">
                          {student.percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      No students match the current filters
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
