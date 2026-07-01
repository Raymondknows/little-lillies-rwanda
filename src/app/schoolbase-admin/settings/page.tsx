"use client";

import SettingsClient from "./settings-client";

export default function SettingsPage() {
  return (
    <div className="space-y-4 px-2 py-3 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted">Platform admin settings and configuration</p>
      </div>

      <SettingsClient />
    </div>
  );
}

