'use client';

import { AlertCircle, FileText } from 'lucide-react';

export default function CommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Comments</h1>
        <p className="mt-1 text-gray-600">Write and manage student progress comments</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h2 className="font-semibold text-gray-900 mb-2">Comments Feature</h2>
        <p className="text-gray-600">
          This feature allows you to write detailed comments about student progress. Coming soon!
        </p>
      </div>
    </div>
  );
}
