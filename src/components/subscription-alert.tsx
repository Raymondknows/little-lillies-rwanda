import { AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

export function SubscriptionAlert() {
  return (
    <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-300 px-4 py-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-3 sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">School setup almost complete.</p>
              <p className="text-sm text-amber-800 mt-1">
                Activate your subscription to unlock full access.
              </p>
            </div>
          </div>
          <Link
            href="/admin/subscribe"
            className="flex-shrink-0 ml-2 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Activate Now
          </Link>
        </div>
      </div>
    </div>
  );
}
