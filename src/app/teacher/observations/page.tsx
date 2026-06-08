'use client';

import { AlertCircle, Eye } from 'lucide-react';

export default function ObservationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Observations</h1>
        <p className="mt-1 text-gray-600">Record child development observations</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h2 className="font-semibold text-gray-900 mb-2">Observations Feature</h2>
        <p className="text-gray-600">
          Document detailed observations of child development and learning. Coming soon!
        </p>
      </div>
    </div>
  );
}
