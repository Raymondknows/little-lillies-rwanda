"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SubscriptionModal from "@/components/subscription-modal";
import { getBackendUrl } from "@/lib/backend-url";

interface Term {
  id: string;
  name: string;
  sortOrder: number;
  startsOn?: string | null;
  endsOn?: string | null;
}

interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
  terms: Term[];
}

export default function AcademicYearsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string; schoolName?: string } | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [showNewTermModal, setShowNewTermModal] = useState(false);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [pendingDeleteTermId, setPendingDeleteTermId] = useState<string | null>(null);
  const [pendingDeleteYearId, setPendingDeleteYearId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newYearData, setNewYearData] = useState({ name: "", isCurrent: false });
  const [newTermData, setNewTermData] = useState({
    academicYearId: "",
    name: "",
    startsOn: "",
    endsOn: "",
  });
  const [editTermData, setEditTermData] = useState({
    id: "",
    name: "",
    startsOn: "",
    endsOn: "",
  });

  const resolveSchoolName = async (backendUrl: string) => {
    try {
      const verifyResponse = await fetch(`${backendUrl}/api/admin/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!verifyResponse.ok) {
        return "";
      }

      const verifyData = await verifyResponse.json().catch(() => null);
      if (!verifyData?.authenticated || !verifyData.session?.schoolId) {
        return "";
      }

      const schoolResponse = await fetch(`${backendUrl}/api/admin/school/${verifyData.session.schoolId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!schoolResponse.ok) {
        return "";
      }

      const schoolData = await schoolResponse.json().catch(() => null);
      return schoolData?.name || "";
    } catch {
      return "";
    }
  };

  const handleSubscriptionBlock = async (response: Response, backendUrl: string) => {
    if (response.status !== 403) {
      return false;
    }

    const errorData = await response.json().catch(() => null);
    if (errorData?.code !== "SUBSCRIPTION_INACTIVE") {
      return false;
    }

    const resolvedSchoolName = await resolveSchoolName(backendUrl);
    setSubscriptionBlocked({
      reason: errorData.reason || "Your school subscription is not active",
      schoolName: resolvedSchoolName || undefined,
    });
    setSchoolName(resolvedSchoolName);
    return true;
  };

  // Fetch academic years
  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/academic-years`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (await handleSubscriptionBlock(response, backendUrl)) {
          setLoading(false);
          return;
        }
        throw new Error("Failed to load academic years");
      }

      const data = await response.json();
      setAcademicYears(data.academicYears || []);
      // Set default academic year for term creation
      if (data.academicYears?.length > 0) {
        setNewTermData((prev) => ({
          ...prev,
          academicYearId: data.academicYears[0].id,
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load academic years"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/academic-years`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newYearData),
      });

      if (!response.ok) {
        throw new Error("Failed to create academic year");
      }

      setNewYearData({ name: "", isCurrent: false });
      setShowNewYearModal(false);
      await loadAcademicYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create year");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/terms`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTermData),
      });

      if (!response.ok) {
        throw new Error("Failed to create term");
      }

      setNewTermData({
        academicYearId: newTermData.academicYearId,
        name: "",
        startsOn: "",
        endsOn: "",
      });
      setShowNewTermModal(false);
      await loadAcademicYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create term");
    } finally {
      setSaving(false);
    }
  };

  const handleSetCurrentYear = async (id: string) => {
    setSaving(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(
        `${backendUrl}/api/admin/academic-years/${id}/set-current`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set current year");
      }

      await loadAcademicYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set current year");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteYear = async (id: string) => {
    setPendingDeleteTermId(null);
    setPendingDeleteYearId(id);
  };

  const confirmDeleteYear = async () => {
    if (!pendingDeleteYearId) return;

    setSaving(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(
        `${backendUrl}/api/admin/academic-years/${pendingDeleteYearId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete academic year");
      }

      setPendingDeleteYearId(null);
      await loadAcademicYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete year");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTerm = (termId: string) => {
    setPendingDeleteTermId(termId);
  };

  const confirmDeleteTerm = async () => {
    if (!pendingDeleteTermId) return;

    setSaving(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(
        `${backendUrl}/api/admin/terms/${pendingDeleteTermId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete term");
      }

      setPendingDeleteTermId(null);
      await loadAcademicYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete term");
    } finally {
      setSaving(false);
    }
  };

  const handleEditTerm = (term: Term, yearId: string) => {
    setEditTermData({
      id: term.id,
      name: term.name,
      startsOn: term.startsOn ? new Date(term.startsOn).toISOString().split('T')[0] : "",
      endsOn: term.endsOn ? new Date(term.endsOn).toISOString().split('T')[0] : "",
    });
    setEditingTermId(term.id);
  };

  const handleUpdateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(
        `${backendUrl}/api/admin/terms/${editTermData.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editTermData.name,
            startsOn: editTermData.startsOn ? new Date(editTermData.startsOn) : null,
            endsOn: editTermData.endsOn ? new Date(editTermData.endsOn) : null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update term");
      }

      setEditingTermId(null);
      await loadAcademicYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update term");
    } finally {
      setSaving(false);
    }
  };

  const filteredYears = useMemo(() => {
    if (!searchQuery.trim()) return academicYears;

    const query = searchQuery.toLowerCase();
    return academicYears
      .map((year) => ({
        ...year,
        terms: year.terms.filter((term) =>
          [year.name, term.name]
            .join(" ")
            .toLowerCase()
            .includes(query)
        ),
      }))
      .filter(
        (year) =>
          year.name.toLowerCase().includes(query) || year.terms.length > 0
      );
  }, [academicYears, searchQuery]);

  const totalTerms = academicYears.reduce(
    (count, year) => count + year.terms.length,
    0
  );

  const formatDate = (date?: string | null) => {
    if (!date) return "Not set";
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  if (subscriptionBlocked) {
    return (
      <SubscriptionModal
        reason={subscriptionBlocked.reason}
        schoolName={subscriptionBlocked.schoolName || schoolName || "Your School"}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">School settings</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Academic years & terms</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Manage academic years and term periods for the whole school. Create years, add terms, and set the current academic year.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => setShowNewTermModal(true)}
            variant="secondary"
            disabled={academicYears.length === 0}
            className="w-full sm:w-auto text-sm"
          >
            Add Term
          </Button>
          <Button
            onClick={() => setShowNewYearModal(true)}
            className="w-full sm:w-auto text-sm"
          >
            Add Year
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <label className="block text-sm font-medium text-foreground">
          Search academic years or terms
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by year or term name..."
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted">Loading academic years...</p>
        </div>
      ) : filteredYears.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
          <p className="text-muted">
            {searchQuery
              ? "No academic years or terms match your search"
              : "No academic years configured yet"}
          </p>
          <Button
            onClick={() => setShowNewYearModal(true)}
            className="mt-4"
          >
            Create First Year
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredYears.map((year) => (
            <div key={year.id} className="rounded-lg border border-border bg-surface overflow-hidden">
              {/* Year Header */}
              <div className="border-b border-border bg-background px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {year.name}
                  </h2>
                  {year.isCurrent && <Badge>Current Year</Badge>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!year.isCurrent && (
                    <Button
                      onClick={() => handleSetCurrentYear(year.id)}
                      variant="secondary"
                      disabled={saving}
                      className="text-xs sm:text-sm"
                    >
                      Set as Current
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteYear(year.id)}
                    variant="outline"
                    disabled={saving}
                    className="text-xs sm:text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Terms Table */}
              {year.terms.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-background">
                        <th className="px-6 py-3 text-left font-medium text-foreground">
                          Term Name
                        </th>
                        <th className="hidden px-6 py-3 text-left font-medium text-foreground sm:table-cell">
                          Starts On
                        </th>
                        <th className="hidden px-6 py-3 text-left font-medium text-foreground sm:table-cell">
                          Ends On
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {year.terms.map((term) => (
                        <tr
                          key={term.id}
                          className="hover:bg-background/50 transition-colors"
                        >
                          <td className="px-6 py-3 font-medium text-foreground">
                            {term.name}
                          </td>
                          <td className="hidden px-6 py-3 text-sm text-muted sm:table-cell">
                            {formatDate(term.startsOn)}
                          </td>
                          <td className="hidden px-6 py-3 text-sm text-muted sm:table-cell">
                            {formatDate(term.endsOn)}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTerm(term, year.id)}
                                className="px-3 py-1 text-xs font-medium rounded bg-brand/10 text-brand hover:bg-brand/20 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTerm(term.id)}
                                className="px-3 py-1 text-xs font-medium rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted">
                  No terms defined for this academic year yet.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Term Confirmation Modal */}
      {pendingDeleteTermId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-foreground">Delete Term</h2>
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to delete this term? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={confirmDeleteTerm}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete term"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setPendingDeleteTermId(null)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Academic Year Confirmation Modal */}
      {pendingDeleteYearId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-foreground">Delete academic year</h2>
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to delete this academic year and all its terms? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={confirmDeleteYear}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete year"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setPendingDeleteYearId(null)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Year Modal */}
      {showNewYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-foreground">
              Create Academic Year
            </h2>
            <p className="mt-2 text-sm text-muted">
              Add a new academic year to the system.
            </p>

            <form onSubmit={handleCreateYear} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Academic Year Name
                </label>
                <input
                  type="text"
                  placeholder="2024/2025"
                  value={newYearData.name}
                  onChange={(e) =>
                    setNewYearData({
                      ...newYearData,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newYearData.isCurrent}
                  onChange={(e) =>
                    setNewYearData({
                      ...newYearData,
                      isCurrent: e.target.checked,
                    })
                  }
                  className="rounded border-border"
                />
                <span className="text-sm font-medium text-foreground">
                  Set as current academic year
                </span>
              </label>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Creating..." : "Create Year"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewYearModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Term Modal */}
      {showNewTermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-foreground">Add Term</h2>
            <p className="mt-2 text-sm text-muted">Create a new term in an academic year.</p>

            <form onSubmit={handleCreateTerm} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Academic Year
                </label>
                <select
                  value={newTermData.academicYearId}
                  onChange={(e) =>
                    setNewTermData({
                      ...newTermData,
                      academicYearId: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Select academic year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Term Name
                </label>
                <input
                  type="text"
                  placeholder="Term 1"
                  value={newTermData.name}
                  onChange={(e) =>
                    setNewTermData({
                      ...newTermData,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Starts On
                  </label>
                  <input
                    type="date"
                    value={newTermData.startsOn}
                    onChange={(e) =>
                      setNewTermData({
                        ...newTermData,
                        startsOn: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ends On
                  </label>
                  <input
                    type="date"
                    value={newTermData.endsOn}
                    onChange={(e) =>
                      setNewTermData({
                        ...newTermData,
                        endsOn: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Creating..." : "Create Term"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewTermModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Term Modal */}
      {editingTermId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-foreground">Edit Term</h2>
            <p className="mt-2 text-sm text-muted">Update term details.</p>

            <form onSubmit={handleUpdateTerm} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Term Name
                </label>
                <input
                  type="text"
                  value={editTermData.name}
                  onChange={(e) =>
                    setEditTermData({
                      ...editTermData,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Starts On
                  </label>
                  <input
                    type="date"
                    value={editTermData.startsOn}
                    onChange={(e) =>
                      setEditTermData({
                        ...editTermData,
                        startsOn: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ends On
                  </label>
                  <input
                    type="date"
                    value={editTermData.endsOn}
                    onChange={(e) =>
                      setEditTermData({
                        ...editTermData,
                        endsOn: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Updating..." : "Update Term"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingTermId(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
