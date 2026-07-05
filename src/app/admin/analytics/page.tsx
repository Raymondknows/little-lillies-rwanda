"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Users, BookOpen, AlertCircle, Activity, Download, Filter, Search, ChevronDown, ArrowRight } from "lucide-react";
import SubscriptionModal from "@/components/subscription-modal";
import AdminSkeleton from "@/components/ui/skeleton";

// NOTE: using shared AdminSkeleton for page-level loading
function CardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 p-6 bg-white animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-5 w-5 bg-slate-200 rounded"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded w-20 mb-2"></div>
      <div className="h-3 bg-slate-200 rounded w-16"></div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-32"></div>
      </div>
      <div className="divide-y divide-slate-200">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-6 py-3 flex gap-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded flex-1"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 bg-slate-200 rounded w-32"></div>
        <div className="h-4 bg-slate-200 rounded w-24"></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-slate-200 rounded w-16"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
            </div>
            <div className="h-3 bg-slate-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AnalyticsData {
  schoolAnalytics: {
    schoolAverage: number;
    passRate: number;
    totalResults: number;
    gradeDistribution: Record<string, number>;
    topPerformers: Array<{ name: string; score: number }>;
    strugglingStudents: Array<{ name: string; score: number }>;
  };
  classes: Array<{ id: string; name: string; phase: string }>;
  subjects: Array<{ id: string; name: string }>;
}

interface Term {
  id: string;
  name: string;
  sortOrder: number;
  academicYearId: string;
  isCurrent?: boolean;
}

interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
  terms?: Term[];
}

const PHASE_CONFIG = {
  EARLY_YEARS: { label: "Early Years", color: "bg-purple-100 text-purple-800" },
  PRIMARY: { label: "Primary", color: "bg-blue-100 text-blue-800" },
  SECONDARY: { label: "Secondary", color: "bg-green-100 text-green-800" },
  ALL: { label: "All Phases", color: "bg-gray-100 text-gray-800" },
};

const GRADE_COLOR_MAP: Record<string, string> = {
  A: '#0A66C2',
  B: '#0F766E',
  C: '#EAAB0C',
  D: '#EA580C',
  E: '#C2410C',
  F: '#BE123C',
};

const PHASE_ORDER = ["ALL", "EARLY_YEARS", "PRIMARY", "SECONDARY"];
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const emptyAnalyticsData = (): AnalyticsData => ({
  schoolAnalytics: {
    schoolAverage: 0,
    passRate: 0,
    totalResults: 0,
    gradeDistribution: {},
    topPerformers: [],
    strugglingStudents: [],
  },
  classes: [],
  subjects: [],
});

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [allSections, setAllSections] = useState<Array<{ id: string; name: string; phase: string }>>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string } | null>(null);
  const [activePhase, setActivePhase] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized filtered terms based on selected academic year
  const filteredTerms = useMemo(() => {
    if (!selectedAcademicYearId) return [];
    const year = academicYears.find((y) => y.id === selectedAcademicYearId);
    return year?.terms?.sort((a, b) => a.sortOrder - b.sortOrder) || [];
  }, [academicYears, selectedAcademicYearId]);

  // Fetch academic years and sections on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch academic years (which include terms)
        const yearsResponse = await fetch("/api/admin/academic-years", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (yearsResponse.ok) {
          const yearsData = await yearsResponse.json();
          const years = (yearsData.academicYears || []).sort(
            (a: AcademicYear, b: AcademicYear) => {
              if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
              return b.name.localeCompare(a.name);
            }
          );
          setAcademicYears(years);

          // Set default academic year
          const defaultYear = years.find((y: AcademicYear) => y.isCurrent) || years[0];
          if (defaultYear) {
            setSelectedAcademicYearId(defaultYear.id);
            // Set default term from the selected year
            const defaultTerm = defaultYear.terms?.[0];
            if (defaultTerm) {
              setSelectedTermId(defaultTerm.id);
            }
          }
        }

        // Fetch all classes/sections
        const classesResponse = await fetch("/api/admin/classes/data", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setAllSections(classesData.classes || []);
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setAnalytics(emptyAnalyticsData());
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Update term when academic year changes
  useEffect(() => {
    if (!selectedAcademicYearId) {
      setSelectedTermId("");
      return;
    }
    const terms = filteredTerms;
    if (terms.length > 0 && !terms.some((t) => t.id === selectedTermId)) {
      setSelectedTermId(terms[0].id);
    }
  }, [selectedAcademicYearId, filteredTerms]);


  // Fetch analytics when term, phase, or section changes
  useEffect(() => {
    if (!selectedTermId) {
      setAnalyticsLoading(false);
      setError(null);
      setAnalytics(emptyAnalyticsData());
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setError(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const query = new URLSearchParams({
          termId: selectedTermId,
          phase: activePhase,
        });
        if (selectedSectionId) {
          query.set('classId', selectedSectionId);
        }

        const url = `/api/admin/analytics/data?${query.toString()}`;
        const response = await fetch(url, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Check for subscription blocking
          if (response.status === 403) {
            const errorData = await response.json().catch(() => null);
            if (errorData?.code === 'SUBSCRIPTION_INACTIVE') {
              setSubscriptionBlocked({ reason: errorData.reason || 'Your school subscription is not active' });
              setLoading(false);
              return;
            }
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch analytics: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('[ANALYTICS] Response:', { classes: data.classes?.length, subjects: data.subjects?.length, results: data.schoolAnalytics?.totalResults });
        
        // Validate and set analytics with defaults if data is incomplete
        if (data && data.schoolAnalytics) {
          const validatedData: AnalyticsData = {
            schoolAnalytics: {
              schoolAverage: data.schoolAnalytics.schoolAverage ?? 0,
              passRate: data.schoolAnalytics.passRate ?? 0,
              totalResults: data.schoolAnalytics.totalResults ?? 0,
              gradeDistribution: data.schoolAnalytics.gradeDistribution ?? {},
              topPerformers: data.schoolAnalytics.topPerformers ?? [],
              strugglingStudents: data.schoolAnalytics.strugglingStudents ?? [],
            },
            classes: data.classes ?? [],
            subjects: data.subjects ?? [],
          };
          setAnalytics(validatedData);
        } else {
          setAnalytics(emptyAnalyticsData());
        }
        
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        if (err instanceof Error && err.name === 'AbortError') {
          setError("Analytics loading took too long. Please try again.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load analytics");
        }
        setAnalytics(emptyAnalyticsData());
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedTermId, activePhase, selectedSectionId]);

  // Filter classes by phase
  const filteredClasses = useMemo(() => {
    if (!analytics) return [];
    let filtered = analytics.classes;

    if (activePhase !== "ALL") {
      filtered = filtered.filter(c => c.phase === activePhase);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [analytics, activePhase, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / itemsPerPage));
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setCurrentPage(1);
  };

  if (loading && academicYears.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSkeleton />
      </div>
    );
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} />;
  }

  if (academicYears.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 flex gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-900">No Academic Years</h3>
          <p className="text-sm text-yellow-700 mt-1">Please create an academic year first before viewing analytics.</p>
        </div>
      </div>
    );
  }

  if (!selectedTermId) {
    return (
      <div className="space-y-6 pb-8">
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">School Analytics</h1>
              <p className="mt-1 text-sm text-slate-600">Real-time performance insights and academic metrics</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full lg:w-auto lg:max-w-[720px]">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Academic Year</label>
                <select
                  value={selectedAcademicYearId}
                  onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                  disabled={analyticsLoading}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                  style={{ '--tw-ring-color': '#0A66C2' } as React.CSSProperties}
                >
                  <option value="">Choose a year...</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}{year.isCurrent ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {filteredTerms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Term</label>
                  <select
                    value={selectedTermId}
                    onChange={(e) => setSelectedTermId(e.target.value)}
                    disabled={analyticsLoading}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                    style={{ '--tw-ring-color': '#0A66C2' } as React.CSSProperties}
                  >
                    <option value="">Choose a term...</option>
                    {filteredTerms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {allSections.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Class</label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    disabled={analyticsLoading || !selectedTermId}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                    style={{ '--tw-ring-color': '#0A66C2' } as React.CSSProperties}
                  >
                    <option value="">All classes</option>
                    {allSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
          <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Select a Term</h2>
          <p className="text-sm text-blue-700">
            Please select an academic term from the dropdown above to view analytics.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button 
            onClick={() => location.reload()}
            className="text-sm text-red-700 font-medium mt-2 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
        <p className="text-slate-600">No analytics data available</p>
      </div>
    );
  }

  // Check if we have any data at all for this term/phase
  const hasData = analytics.schoolAnalytics.totalResults > 0 || 
                  analytics.classes.length > 0 || 
                  analytics.subjects.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6 pb-8">
        {/* Header with Term Dropdown */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">School Analytics</h1>
              <p className="mt-1 text-sm text-slate-600">Real-time performance insights and academic metrics</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full lg:w-auto lg:max-w-[720px]">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Academic Year</label>
                <select
                  value={selectedAcademicYearId}
                  onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                  disabled={analyticsLoading}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                  style={{ '--tw-ring-color': '#0A66C2' } as React.CSSProperties}
                >
                  <option value="">Choose a year...</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}{year.isCurrent ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {filteredTerms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Term</label>
                  <select
                    value={selectedTermId}
                    onChange={(e) => setSelectedTermId(e.target.value)}
                    disabled={analyticsLoading}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                    style={{ '--tw-ring-color': '#0A66C2' } as React.CSSProperties}
                  >
                    <option value="">Choose a term...</option>
                    {filteredTerms.map((term: Term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {allSections.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Class</label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    disabled={analyticsLoading || !selectedTermId}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                    style={{ '--tw-ring-color': '#0A66C2' } as React.CSSProperties}
                  >
                    <option value="">All classes</option>
                    {allSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* No Data Message */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
          <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-blue-900 mb-2">No Analytics Data</h2>
          <p className="text-sm text-blue-700 mb-4">
            There is no data to display for the selected term and phase. 
          </p>
          <p className="text-sm text-blue-600">
            Analytics will appear once students have results published.
          </p>
        </div>
      </div>
    );
  }

  const { schoolAnalytics, subjects } = analytics;
  const gradeLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const maxGradeCount = Math.max(...gradeLetters.map(g => schoolAnalytics.gradeDistribution[g] || 0));

  // Get phase stats
  const phaseStats = PHASE_ORDER.map(phase => {
    const classCount = phase === "ALL" 
      ? analytics.classes.length 
      : analytics.classes.filter(c => c.phase === phase).length;
    return { phase, count: classCount };
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Academic Year, Term, and Class Dropdowns */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">School Analytics</h1>
            <p className="mt-1 text-sm text-slate-600">Real-time performance insights and academic metrics</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full lg:w-auto lg:max-w-[720px]">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Academic Year</label>
              <select
                value={selectedAcademicYearId}
                onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                disabled={analyticsLoading}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                style={{ '--tw-ring-color': '#0A66C2' } as React.CSSProperties}
              >
                  <option value="">Choose a year...</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}{year.isCurrent ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {filteredTerms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Term</label>
                  <select
                    value={selectedTermId}
                    onChange={(e) => setSelectedTermId(e.target.value)}
                    disabled={analyticsLoading}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                    style={{ '--tw-ring-color': '#0A66C2' } as React.CSSProperties}
                  >
                    <option value="">Choose a term...</option>
                    {filteredTerms.map((term: Term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {allSections.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Class</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  disabled={analyticsLoading || !selectedTermId}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                  style={{ '--tw-ring-color': '#0A66C2' } as React.CSSProperties}
                >
                  <option value="">All classes</option>
                  {allSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">School Average</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{schoolAnalytics.schoolAverage.toFixed(1)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Out of 100</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Pass Rate</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{schoolAnalytics.passRate.toFixed(1)}%</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Passing students</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-800">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Total Results</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{schoolAnalytics.totalResults}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Published assessments</p>
        </div>

        <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-800">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Subjects</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{subjects.length}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Total subjects</p>
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-lg overflow-hidden">
        <div className="flex overflow-x-auto">
          {PHASE_ORDER.map((phase) => {
            const phaseLabel = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG].label;
            const count = phaseStats.find(p => p.phase === phase)?.count || 0;
            return (
              <button
                key={phase}
                onClick={() => handlePhaseChange(phase)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activePhase === phase
                    ? 'text-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
                style={activePhase === phase ? { backgroundColor: '#0A66C2', color: 'white', borderBottomColor: '#0A66C2' } : {}}
              >
                {phaseLabel}
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  activePhase === phase ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Grade Distribution</h2>
          </div>
          <div className="text-sm text-slate-600">
            Total: <span className="font-bold text-slate-900">{schoolAnalytics.totalResults}</span>
          </div>
        </div>

        <div className="space-y-4">
          {gradeLetters.map((grade) => {
            const count = schoolAnalytics.gradeDistribution[grade] || 0;
            const percentage = maxGradeCount > 0 ? (count / maxGradeCount) * 100 : 0;
            const totalPercentage = schoolAnalytics.totalResults > 0 ? (count / schoolAnalytics.totalResults) * 100 : 0;
            return (
              <div key={grade}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900">Grade {grade}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{count} students</span>
                    <span className="text-xs text-slate-500">({totalPercentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${percentage}%`, backgroundColor: GRADE_COLOR_MAP[grade] || '#0A66C2' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Classes and Subjects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Overview with Filters */}
        <div className="group rounded-lg border border-border bg-surface shadow-sm transition hover:border-brand/50 hover:shadow-md overflow-hidden">
          <div className="bg-surface px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Classes</h2>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                  {filteredClasses.length}
                </span>
              </div>
              <button onClick={() => router.push("/admin/analytics/classes")} className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition font-medium" style={{ backgroundColor: '#0A66C2' }}>
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Classes Table - Show only 3 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Class Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Phase</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClasses.slice(0, 3).length > 0 ? (
                  paginatedClasses.slice(0, 3).map((cls, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td className="px-6 py-3 font-medium text-slate-900">{cls.name}</td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PHASE_CONFIG[cls.phase as keyof typeof PHASE_CONFIG]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {PHASE_CONFIG[cls.phase as keyof typeof PHASE_CONFIG]?.label || cls.phase}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button className="font-medium text-sm" style={{ color: '#0A66C2' }}>
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-600">
                      No classes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subjects Overview */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm transition hover:shadow-md">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Subjects ({subjects.length})</h2>
            </div>
            <button onClick={() => router.push("/admin/analytics/subjects")} className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition font-medium" style={{ backgroundColor: '#0A66C2' }}>
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-200">
            {subjects.length > 0 ? (
              subjects.slice(0, 3).map((subject) => (
                <div key={subject.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <p className="text-sm font-medium text-slate-900">{subject.name}</p>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-sm text-slate-600">No subjects available</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performers & Struggling Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-slate-900">Top Performers</h2>
            </div>
            <button onClick={() => router.push("/admin/analytics/top-performers")} className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded-lg transition font-medium">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {schoolAnalytics.topPerformers && schoolAnalytics.topPerformers.length > 0 ? (
              schoolAnalytics.topPerformers.slice(0, 3).map((student, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-green-100 rounded-lg bg-green-50 hover:bg-green-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">
                      #{idx + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-900">{student.name}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{student.score?.toFixed(1) || '—'}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No top performers data available</p>
            )}
          </div>
        </div>

        {/* Struggling Students */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-900">Struggling Students</h2>
            </div>
            <button onClick={() => router.push("/admin/analytics/struggling-students")} className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition font-medium">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {schoolAnalytics.strugglingStudents && schoolAnalytics.strugglingStudents.length > 0 ? (
              schoolAnalytics.strugglingStudents.slice(0, 3).map((student, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-orange-100 rounded-lg bg-orange-50 hover:bg-orange-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-700">
                      ⚠
                    </div>
                    <p className="text-sm font-medium text-slate-900">{student.name}</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">{student.score?.toFixed(1) || '—'}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No struggling students data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
