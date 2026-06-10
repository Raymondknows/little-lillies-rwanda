"use client";

import { Suspense } from "react";
import SchoolsViewSwitcher from "./schools-view-switcher";

export default function SchoolsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schools Management</h1>
        <p className="mt-1 text-muted">View and manage all schools on the platform</p>
      </div>

      <Suspense fallback={<div className="text-center py-8 text-muted">Loading schools...</div>}>
        <SchoolsViewSwitcher initialSchools={[]} />
      </Suspense>
    </div>
  );
}
