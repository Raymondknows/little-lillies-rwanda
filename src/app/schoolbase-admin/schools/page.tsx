"use client";

import { Suspense } from "react";
import SchoolsViewSwitcher from "./schools-view-switcher";

export default function SchoolsPage() {
  return (
    <div className="px-0.5 py-1.5 sm:px-1 sm:py-2">
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
