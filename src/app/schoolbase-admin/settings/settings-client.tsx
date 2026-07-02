"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import {
  User,
  Shield,
  Server,
  Save,
  Loader2,
  KeyRound,
  BarChart3,
  Activity,
  Mail,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import AdminSkeleton from "@/components/ui/skeleton";

interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface PlatformStats {
  totalSchools: number;
  activeSchools: number;
  totalUsers: number;
  supportRequests: number;
  trialSchools: number;
  activePercentage: number;
}

interface AuditLog {
  id: string;
  event: string;
  details: string | null;
  createdAt: string;
  user?: { name?: string | null; email?: string | null } | null;
  school?: { name?: string | null } | null;
}

interface PlatformSettingsState {
  maintenanceMode: boolean;
  allowSignup: boolean;
  allowTrial: boolean;
  autoApproveSchools: boolean;
  supportEmail: string;
}

const defaultSettings: PlatformSettingsState = {
  maintenanceMode: false,
  allowSignup: true,
  allowTrial: true,
  autoApproveSchools: false,
  supportEmail: "support@schoolbase.live",
};

export default function SettingsClient() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<PlatformSettingsState>(defaultSettings);
  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [profileRes, statsRes, settingsRes, activityRes] = await Promise.all([
        fetch("/schoolbase-admin/api/profile", { credentials: "include" }),
        fetch("/schoolbase-admin/api/stats", { credentials: "include" }),
        fetch("/schoolbase-admin/api/settings", { credentials: "include" }),
        fetch("/schoolbase-admin/api/audit-logs", { credentials: "include" }),
      ]);

      if (!profileRes.ok) {
        const error = await profileRes.json().catch(() => null);
        throw new Error(error?.message || "Failed to load profile.");
      }

      const profileData = await profileRes.json();
      const adminData = profileData.admin;
      setAdmin(adminData);
      setFormData({
        name: adminData.name || "",
        email: adminData.email || "",
      });

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings({
          maintenanceMode: Boolean(settingsData?.settings?.maintenanceMode ?? settingsData?.defaults?.maintenanceMode ?? false),
          allowSignup: Boolean(settingsData?.settings?.allowSignup ?? settingsData?.defaults?.allowSignup ?? true),
          allowTrial: Boolean(settingsData?.settings?.allowTrial ?? settingsData?.defaults?.allowTrial ?? true),
          autoApproveSchools: Boolean(settingsData?.settings?.autoApproveSchools ?? settingsData?.defaults?.autoApproveSchools ?? false),
          supportEmail: String(settingsData?.settings?.supportEmail ?? settingsData?.defaults?.supportEmail ?? defaultSettings.supportEmail),
        });
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivity(activityData?.logs ?? []);
      }
    } catch (error) {
      console.error(error);
      setProfileMessage(error instanceof Error ? error.message : "Unable to load platform settings.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSettingToggle(key: keyof PlatformSettingsState) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSettingInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name as keyof PlatformSettingsState]: value }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      setProfileMessage(null);

      const res = await fetch("/schoolbase-admin/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to save profile.");
      }

      setAdmin(data.admin);
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setProfileMessage(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSettings() {
    try {
      setSavingSettings(true);
      setSettingsMessage(null);
      setSettingsError(null);

      const res = await fetch("/schoolbase-admin/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to save settings.");
      }

      setSettingsMessage("Platform preferences saved successfully.");
    } catch (error) {
      console.error(error);
      setSettingsError(error instanceof Error ? error.message : "Unable to save platform preferences.");
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20">
        <AdminSkeleton />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-muted">
        {profileMessage ?? "Failed to load settings."}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 px-0 sm:px-0">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground">Platform Overview</h2>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted">Total schools</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{stats?.totalSchools ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted">Active schools</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{stats?.activeSchools ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted">Trial schools</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{stats?.trialSchools ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted">Support requests</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{stats?.supportRequests ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground">Platform Admin</h2>
          </div>

          {profileMessage ? (
            <div className="mb-4 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              {profileMessage}
            </div>
          ) : null}

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted">Name</p>
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
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
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
              <p className="text-foreground">{new Date(admin.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-xs text-muted">Environment</p>
              <p className="text-foreground">Production</p>
            </div>

            <div>
              <p className="text-xs text-muted">Service</p>
              <p className="text-foreground text-xs">Platform admin tools</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground">Platform Preferences</h2>
          </div>

          <div className="space-y-4">
            {settingsMessage ? (
              <div className="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
                {settingsMessage}
              </div>
            ) : null}
            {settingsError ? (
              <div className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
                {settingsError}
              </div>
            ) : null}

            <div className="space-y-3 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Maintenance mode</p>
                  <p className="text-xs text-muted">Pause new signups during maintenance windows.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingToggle("maintenanceMode")}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${settings.maintenanceMode ? "bg-warning/10 text-warning" : "bg-muted/20 text-muted"}`}
                >
                  {settings.maintenanceMode ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Allow new signups</p>
                  <p className="text-xs text-muted">Open the platform for new schools and users.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingToggle("allowSignup")}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${settings.allowSignup ? "bg-success/10 text-success" : "bg-muted/20 text-muted"}`}
                >
                  {settings.allowSignup ? "On" : "Off"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Allow trials</p>
                  <p className="text-xs text-muted">Permit trial accounts for new schools.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingToggle("allowTrial")}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${settings.allowTrial ? "bg-success/10 text-success" : "bg-muted/20 text-muted"}`}
                >
                  {settings.allowTrial ? "On" : "Off"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-approve schools</p>
                  <p className="text-xs text-muted">Automatically approve schools after registration.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingToggle("autoApproveSchools")}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${settings.autoApproveSchools ? "bg-success/10 text-success" : "bg-muted/20 text-muted"}`}
                >
                  {settings.autoApproveSchools ? "On" : "Off"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Support email</label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Mail className="h-4 w-4 text-muted" />
                <input
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleSettingInputChange}
                  className="w-full bg-transparent text-sm text-foreground outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
            >
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Preferences
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground">Recent Activity</h2>
          </div>

          <div className="space-y-2">
            {activity.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted">
                No recent platform activity yet.
              </div>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.event}</p>
                      <p className="mt-1 text-xs text-muted">{item.details || "No details available."}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Activity className="h-3.5 w-3.5" />
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                    {item.user?.name ? <span className="rounded-full bg-muted/20 px-2 py-0.5">{item.user.name}</span> : null}
                    {item.school?.name ? <span className="rounded-full bg-muted/20 px-2 py-0.5">{item.school.name}</span> : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-brand" />
          <h2 className="font-semibold text-foreground">Security & Operational Notes</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted" />
              <p className="text-sm font-medium text-foreground">Password</p>
            </div>
            <p className="mt-2 text-xs text-muted">Change login details through auth settings if needed.</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted" />
              <p className="text-sm font-medium text-foreground">Session health</p>
            </div>
            <p className="mt-2 text-xs text-muted">Your current session is protected by the platform admin cookie.</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted" />
              <p className="text-sm font-medium text-foreground">Issue tracking</p>
            </div>
            <p className="mt-2 text-xs text-muted">Monitor support and trial counts above to spot platform health issues.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
