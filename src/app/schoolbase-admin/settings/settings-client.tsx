"use client";

import { useEffect, useState } from "react";
import { getBackendUrl } from "@/lib/backend-url";
import { User, Shield, Server, Save, Loader2, KeyRound, LogOut } from "lucide-react";

interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function SettingsClient() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const backendUrl = getBackendUrl();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const res = await fetch(`${backendUrl}/schoolbase-admin/api/profile`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load profile");

      const data = await res.json();
      const adminData = data.admin;

      setAdmin(adminData);
      setFormData({
        name: adminData.name || "",
        email: adminData.email || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  async function handleSave() {
    try {
      setSaving(true);

      const res = await fetch(`${backendUrl}/schoolbase-admin/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      setAdmin(data.admin);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-muted">
        Failed to load settings.
      </div>
    );
  }

  return (
    <div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* PROFILE CARD */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground">Profile</h2>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted">Full Name</p>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <p className="text-xs text-muted">Email</p>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand/90 text-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* SECURITY CARD */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground">Security</h2>
          </div>

          <div className="space-y-2 text-sm">
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition">
              <span className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted" />
                Change Password
              </span>
            </button>

            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted" />
                Two-Factor Auth
              </span>
            </button>

            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition">
              <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4 text-muted" />
                Active Sessions
              </span>
            </button>
          </div>
        </div>

        {/* SYSTEM INFO CARD */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground">System Info</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted">Admin ID</p>
              <p className="font-mono text-xs text-foreground">{admin.id}</p>
            </div>

            <div>
              <p className="text-xs text-muted">Role</p>
              <p className="text-foreground font-medium">{admin.role}</p>
            </div>

            <div>
              <p className="text-xs text-muted">Member Since</p>
              <p className="text-foreground">
                {new Date(admin.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">Environment</p>
              <p className="text-foreground">Production</p>
            </div>

            <div>
              <p className="text-xs text-muted">Backend</p>
              <p className="text-foreground text-xs break-all">{backendUrl}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}