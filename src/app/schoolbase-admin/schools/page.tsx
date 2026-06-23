"use client";

import { Suspense } from "react";
import SchoolsViewSwitcher from "./schools-view-switcher";

export default function SchoolsPage() {
  return (
    <div className="px-3 py-6 sm:px-5">
      <Suspense fallback={<div className="text-center py-8 text-muted">Loading schools...</div>}>
        <SchoolsViewSwitcher
          initialSchools={[]}
          title="Schools Management"
          subtitle="View and manage all schools on the platform"
        />
      </Suspense>
    </div>
  );
}
