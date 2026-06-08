'use client';

import { AlertCircle, FileText } from 'lucide-react';

export default function DailyReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Daily Reports</h1>
        <p className="mt-1 text-gray-600">Send daily updates to parents</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h2 className="font-semibold text-gray-900 mb-2">Daily Reports Feature</h2>
        <p className="text-gray-600">
          Create and send daily activity reports to parents. Coming soon!
        </p>
      </div>
    </div>
  );
}
