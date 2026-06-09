import { Suspense } from "react";
import SetupRemindersClient from "./setup-reminders-client";

export default function SetupRemindersPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Setup Reminders</h1>
        <p className="mt-1 text-muted">Schools that haven't completed their setup process</p>
      </div>

      <Suspense fallback={<div className="text-center py-8 text-muted">Loading setup reminders...</div>}>
        <SetupRemindersClient initialSchools={[]} initialEmailLogs={[]} />
      </Suspense>
    </div>
  );
}
