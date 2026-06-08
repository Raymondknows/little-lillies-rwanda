"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export default function AcademicYearsPage() {
  const router = useRouter();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/academic-years", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load academic years");
      }

      const data = await response.json();
      setAcademicYears(data.academicYears || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load academic years");
    } finally {
      setLoading(false);
    }
  };

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/academic-years", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save academic year");
      }

      setFormData({ name: "", startDate: "", endDate: "" });
      setShowForm(false);
      await loadAcademicYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteYear = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const response = await fetch(`/api/admin/academic-years/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      await loadAcademicYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/settings">
              <button className="rounded-lg bg-white p-2 hover:bg-gray-100 transition">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Academic Years</h1>
              <p className="mt-1 text-sm text-gray-600">Manage school academic years and sessions</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#0A66C2] text-white">
            <Plus className="h-5 w-5" />
            Add Year
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Add New Academic Year</h3>
            <form onSubmit={handleAddYear} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="e.g., 2024/2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                  required
                />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                  required
                />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white hover:bg-[#0A66C2]/90 disabled:opacity-50 transition"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading academic years...</div>
        ) : academicYears.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No academic years configured yet</p>
            <Button onClick={() => setShowForm(true)} className="mt-4 bg-[#0A66C2] text-white">
              Add First Year
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {academicYears.map((year) => (
              <div key={year.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{year.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                  </p>
                  {year.current && (
                    <span className="inline-block mt-2 px-2 py-1 bg-[#0A66C2]/10 text-[#0A66C2] text-xs font-semibold rounded">
                      Current Year
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteYear(year.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
