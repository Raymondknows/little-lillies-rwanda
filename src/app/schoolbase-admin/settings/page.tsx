"use client";

import SettingsClient from "./settings-client";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted">Platform admin settings and configuration</p>
      </div>

      <SettingsClient />
    </div>
  );
}

