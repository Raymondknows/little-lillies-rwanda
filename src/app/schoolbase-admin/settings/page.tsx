import { redirect } from "next/navigation";
import { getPlatformAdminSession } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/platform-admin";
import SettingsForm from "@/components/platform-admin/settings-form";

export default async function PlatformAdminSettingsPage() {
  const session = await getPlatformAdminSession();
  if (!session) redirect("/schoolbase-admin/login");

  const settings = await getPlatformSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Manage global platform configuration and system-wide settings.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
