"use client";

import SetupRemindersClient from "./setup-reminders-client";

export default function SetupRemindersPage() {
  return (
    <div className="px-1.5 py-3 sm:px-2 sm:py-4 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Setup Reminders</h1>
        <p className="mt-1 text-muted">Schools that haven't completed their setup process</p>
      </div>

      <SetupRemindersClient initialSchools={[]} initialEmailLogs={[]} />
    </div>
  );
}
