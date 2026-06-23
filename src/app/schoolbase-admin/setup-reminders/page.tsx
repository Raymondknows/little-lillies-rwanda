"use client";

import SetupRemindersClient from "./setup-reminders-client";

export default function SetupRemindersPage() {
  return (
    <div className="px-3 py-6 sm:px-5 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Setup Reminders</h1>
        <p className="mt-1 text-muted">Schools that haven't completed their setup process</p>
      </div>

      <SetupRemindersClient initialSchools={[]} initialEmailLogs={[]} />
    </div>
  );
}
