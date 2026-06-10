"use client";

import EmailCenterClient from "./email-center-client";

export default function EmailCenterPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Center</h1>
        <p className="mt-1 text-muted">Send emails and manage communications with schools</p>
      </div>

      <EmailCenterClient initialSchools={[]} initialEmailLogs={[]} />
    </div>
  );
}
