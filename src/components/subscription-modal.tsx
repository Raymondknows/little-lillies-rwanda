'use client';

import { useRouter } from 'next/navigation';

interface SubscriptionModalProps {
  reason?: string;
  schoolName?: string;
}

export default function SubscriptionModal({ reason, schoolName }: SubscriptionModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M7.08 6.06A9 9 0 1021.02 18M7.08 6.06l2.12 2.12m0 0a6 6 0 018.84 8.84m0 0l2.12 2.12" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Subscription Required
          </h2>
          
          <p className="text-muted mb-6">
            {reason || 'Your school subscription is not active. Please upgrade to continue accessing all features.'}
          </p>

          {schoolName && (
            <p className="text-sm text-muted-foreground mb-6">
              <span className="font-medium">{schoolName}</span> — Manage your subscription
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push('/admin/subscribe')}
              className="w-full bg-brand text-white py-2 px-4 rounded-lg font-medium hover:bg-brand/90 transition-colors"
            >
              Go to Subscription Page
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="w-full bg-gray-100 text-foreground py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Need help? Contact support@schoolbase.live
          </p>
        </div>
      </div>
    </div>
  );
}
