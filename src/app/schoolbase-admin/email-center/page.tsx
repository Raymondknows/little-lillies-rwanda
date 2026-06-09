import { Suspense } from "react";
import EmailCenterClient from "./email-center-client";

export default function EmailCenterPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Center</h1>
        <p className="mt-1 text-muted">Send emails and manage communications with schools</p>
      </div>

      <Suspense fallback={<div className="text-center py-8 text-muted">Loading email center...</div>}>
        <EmailCenterClient initialSchools={[]} initialEmailLogs={[]} />
      </Suspense>
    </div>
  );
}
