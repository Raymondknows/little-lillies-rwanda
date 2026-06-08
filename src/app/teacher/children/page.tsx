'use client';

import { AlertCircle, Users } from 'lucide-react';

export default function ChildrenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
        <p className="mt-1 text-gray-600">Track children in your care and their development</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h2 className="font-semibold text-gray-900 mb-2">Early Years Feature</h2>
        <p className="text-gray-600">
          Child tracking and observation features for nursery and early years schools. Coming soon!
        </p>
      </div>
    </div>
  );
}
